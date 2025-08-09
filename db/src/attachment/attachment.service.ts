import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Attachment } from '../entities/attachment.entity';
import { AttachmentIds } from '../entities/attachmentIds.entity';
import { TransactionLog } from '../entities/transaction_log.entity';
import { Repository } from 'typeorm';
import { RabbitMQService } from 'src/shared/rabbitmq/rabbitmq.service';
import { S3Service } from './s3.service';

@Injectable()
export class AttachmentService {
  private readonly logger = new Logger(AttachmentService.name);
  constructor(
    private readonly s3Service: S3Service,
    @InjectRepository(Attachment)
    private attachmentRepository: Repository<Attachment>,
    @InjectRepository(AttachmentIds)
    private attachmentsIdsRepository: Repository<AttachmentIds>,
    @InjectRepository(TransactionLog)
    private transactionLogRepository: Repository<TransactionLog>,
    private rabbitMQService: RabbitMQService,
  ) {}

  async handelCreatedAttachment(attachmentData: any): Promise<any> {
    console.log(
      '🚀 ~ AttachmentService ~ handelCreatedAttachment ~ attachmentContent:',
      attachmentData,
    );

    try {
      const data = attachmentData.res[0];
      const attachmentContent = attachmentData.attachmentContent;
      console.log(
        '🚀 ~ AttachmentService ~ handelCreatedAttachment ~ data:',
        data,
      );

      const fileContent = String(attachmentContent || '');
      const fileName = data.Name || 'attachment';
      const fileExtension = data.Name.split('.').pop() || 'txt';
      const contentType = data.ContentType || 'text/plain';

      const s3Key = await this.s3Service.uploadBase64AsFile(
        fileContent,
        fileName,
        fileExtension,
        contentType,
      );
      console.log(
        '🚀 ~ AttachmentService ~ handelCreatedAttachment ~ s3Key:',
        s3Key,
      );
      const attachment = this.attachmentRepository.create({
        Id: String(data.AttachmentId) || '',
        ExternalId: String(data.ExternalId) || '',
        Body: String(s3Key) || '',
        BodyLength: String(data.BodyLength) || '',
        ContentType: String(data.ContentType) || '',
        Name: String(data.Name) || '',
        ExternalRecordId: String(data.eventId) || '',
        ExternalRecordName: String(data.eventId) || '',
        ModifiedDateTime: new Date().toISOString(),
      });
      await this.attachmentRepository.save(attachment);
      console.log(
        '🚀 ~ AttachmentService ~ handelCreatedAttachment ~ fileContent:',
        attachmentContent,
      );
      let base64: string;

      if (
        typeof attachmentContent === 'object' &&
        !Buffer.isBuffer(attachmentContent)
      ) {
        base64 = Buffer.from(JSON.stringify(attachmentContent)).toString(
          'base64',
        );
      } else {
        base64 = Buffer.isBuffer(attachmentContent)
          ? attachmentContent.toString('base64')
          : Buffer.from(attachmentContent).toString('base64');
      }
      console.log(
        '🚀 ~ AttachmentService ~ handelCreatedAttachment ~ base64:',
        base64,
      );
      return { base64, attachment };
    } catch (error) {
      this.logger.log('🚀 ~ In  AttachmentService ~ handelCreatedAttachment');
      throw new Error(`Failed to Create Attachment: ${error.message}`);
    }
  }
  async saveAttachmentForVeevaSync(attachmentData: any): Promise<any> {
    this.logger.log('🚀 ~ In AttachmentService ~ saveAttachmentForVeevaSync');
    this.logger.log(
      `Processing attachment for Veeva sync: ${attachmentData.AttachmentId} - ${attachmentData.Name}`,
    );

    try {
      const attachment = this.attachmentRepository.create({
        Id: attachmentData.AttachmentId,
        Body: attachmentData.Body,
        ContentType: attachmentData.ContentType,
        Name: attachmentData.Name,
        BodyLength: attachmentData.BodyLength,
        ExternalRecordId: attachmentData.eventId || 'unknown',
        ExternalRecordName: attachmentData.eventId || 'unknown',
        ModifiedDateTime: new Date().toISOString(),
      });

      await this.attachmentRepository.save(attachment);
      // Create transaction log
      const transactionLog = this.transactionLogRepository.create({
        Name: attachmentData.AttachmentId,
        ModifiedDateTime: new Date().toISOString(),
        Success: 'true',
        Direction: 'Centris Inbound',
        LogType: 'Attachment',
        Owner: attachmentData.eventId || 'unknown',
        ErrorMessage: '',
        ProcessCompletionTime: new Date().toISOString(),
      });

      const savedTransactionLog =
        await this.transactionLogRepository.save(transactionLog);

      // Send to Veeva queue (fire-and-forget)
      await this.sendAttachmentToVeevaQueue(attachmentData);

      return {
        Id: savedTransactionLog.Id,
        CentrisReferenceId: attachmentData.TransactionId,
        success: true,
        errorMessage: '',
      };
    } catch (error) {
      this.logger.error(
        `Failed to save attachment for Veeva sync: ${error.message}`,
      );

      // Create error transaction log
      let errorTransactionLogId: string | null = null;
      try {
        const errorTransactionLog = this.transactionLogRepository.create({
          Name: `${attachmentData.AttachmentId}_Error`,
          ModifiedDateTime: new Date().toISOString(),
          Success: 'false',
          Direction: 'Centris Inbound',
          LogType: 'Attachment',
          Owner: attachmentData.eventId || 'unknown',
          ErrorMessage: error.message,
          ProcessCompletionTime: new Date().toISOString(),
        });

        const savedErrorLog =
          await this.transactionLogRepository.save(errorTransactionLog);
        errorTransactionLogId = savedErrorLog.Id;
      } catch (logError) {
        this.logger.error(
          `Failed to create error transaction log: ${logError.message}`,
        );
      }

      return {
        Id: errorTransactionLogId,
        CentrisReferenceId: attachmentData.TransactionId,
        success: false,
        errorMessage: `Failed to save attachment for Veeva sync: ${error.message}`,
      };
    }
  }

  async getPendingAttachmentsForVeeva(
    limit: number = 10,
    status: string = 'pending',
  ): Promise<any[]> {
    this.logger.log(
      `🚀 ~ In AttachmentService ~ getPendingAttachmentsForVeeva`,
    );

    try {
      // Get attachments that haven't been marked as processed yet
      // We'll check if ModifiedDateTime is older than 1 minute (indicating it hasn't been recently processed)
      const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000).toISOString();

      const queryBuilder =
        this.attachmentRepository.createQueryBuilder('attachment');

      // Only get attachments that were created but not yet processed
      // This means ModifiedDateTime is older than 1 minute (not recently updated)
      queryBuilder.where('attachment.ModifiedDateTime < :oneMinuteAgo', {
        oneMinuteAgo,
      });

      // Order by oldest first (FIFO - First In, First Out)
      queryBuilder.orderBy('attachment.ModifiedDateTime', 'ASC');

      // Apply limit
      queryBuilder.limit(limit);

      const attachments = await queryBuilder.getMany();

      this.logger.log(
        `Found ${attachments.length} unprocessed attachments for Veeva sync`,
      );

      return attachments;
    } catch (error) {
      this.logger.error(`❌ Failed to get attachments: ${error.message}`);
      throw new Error(`Failed to get attachments: ${error.message}`);
    }
  }

  async markAttachmentsAsSyncedToVeeva(attachmentIds: string[]): Promise<void> {
    this.logger.log(
      `🚀 ~ In AttachmentService ~ markAttachmentsAsSyncedToVeeva`,
    );
    this.logger.log(
      `Marking ${attachmentIds.length} attachments as synced to Veeva`,
    );

    try {
      if (attachmentIds.length === 0) {
        this.logger.log('No attachments to mark as synced');
        return;
      }

      // Update ModifiedDateTime to current time to mark as processed
      // This will prevent them from being returned in the next query
      const currentTime = new Date().toISOString();

      this.logger.log(`⏰ Marking attachments as processed at: ${currentTime}`);

      const result = await this.attachmentRepository
        .createQueryBuilder()
        .update(Attachment)
        .set({
          ModifiedDateTime: currentTime,
        })
        .where('Id IN (:...attachmentIds)', { attachmentIds })
        .execute();

      this.logger.log(
        `✅ Marked ${result.affected} attachments as synced to Veeva`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to mark attachments as synced: ${error.message}`,
      );
      throw new Error(`Failed to mark attachments as synced: ${error.message}`);
    }
  }

  async sendAttachmentToVeevaQueue(attachmentData: any): Promise<void> {
    this.logger.log('🚀 ~ In AttachmentService ~ sendAttachmentToVeevaQueue:');
    this.logger.log(
      `Sending attachment to Veeva directly via HTTP: ${attachmentData.AttachmentId} - ${attachmentData.Name}`,
    );

    try {
      // Generate AWS Transaction ID
      const awsTransactionId = `VT${Date.now()}${Math.floor(Math.random() * 1000)}`;

      // Send directly to Veeva via HTTP instead of RabbitMQ
      const veevaUrl = 'http://localhost:3007/attachment/receive-attachment';
      this.logger.log(
        `📤 Sending attachment to Veeva via HTTP: ${attachmentData.AttachmentId}`,
      );

      const response = await fetch(veevaUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          AttachmentId: attachmentData.AttachmentId,
          Name: attachmentData.Name,
          Body: attachmentData.Body,
          ContentType: attachmentData.ContentType,
          BodyLength: attachmentData.BodyLength,
          eventId: attachmentData.eventId,
          timestamp: new Date().toISOString(),
          awsTransactionId: awsTransactionId,
        }),
      });

      if (!response.ok) {
        this.logger.error(`❌ HTTP ${response.status}: ${response.statusText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      this.logger.log(
        `✅ Attachment sent to Veeva successfully: ${attachmentData.AttachmentId}`,
      );
      this.logger.log(`📋 Veeva response:`, result);

      // Log success but don't return anything since this is fire-and-forget
      this.logger.log(
        `✅ Veeva queue processing completed for: ${attachmentData.AttachmentId}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to send attachment to Veeva: ${error.message}`,
      );

      // Log error but don't return anything since this is fire-and-forget
      this.logger.error(
        `❌ Veeva queue processing failed for: ${attachmentData.AttachmentId}`,
      );
    }
  }

  async sendAttachmentToCentres(
    attachmentId: string,
    eventId: string,
  ): Promise<any> {
    this.logger.log('🚀 ~ In AttachmentService ~ sendAttachmentToCentres');
    try {
      const response = await this.attachmentRepository.findOneBy({
        Id: String(attachmentId),
        ExternalRecordId: String(eventId),
      });
      this.logger.log(
        '🚀 ~ AttachmentService ~ sendAttachmentToCentres ~ response:',
        response,
      );
      return response;
    } catch (error) {
      this.logger.error('Error Fetching Attachment', error?.message || error);
      throw new HttpException(
        error.response?.data || 'Failed to fetch Attachment',
        error.response?.status || 500,
        error.message ?? error,
      );
    }
  }

  async sendAttachmentIDsToCentris(eventId: string): Promise<string[]> {
    this.logger.log('🚀 ~ In AttachmentService ~ sendAttachmentIDsToVault');
    this.logger.log(
      '🚀 ~ AttachmentService ~ sendAttachmentIDsToVault ~ eventId:',
      eventId,
    );

    try {
      if (!eventId) {
        this.logger.error('Event ID is missing');
        throw new HttpException('Event ID is missing', 400);
      }
      const attachmentRecords = await this.attachmentRepository.find({
        where: { ExternalRecordId: eventId },
        select: ['Id'],
      });

      const attachmentIdsRecords = attachmentRecords.map((record) => record.Id);

      const attachmentIds = this.attachmentsIdsRepository.create({
        Id: String(eventId),
        AttachmentIdList: attachmentIdsRecords,
      });
      console.log(
        '🚀 ~ AttachmentService ~ sendAttachmentIDsToVault ~ attachmentIds:',
        attachmentIds,
      );
      await this.attachmentsIdsRepository.save(attachmentIds);

      this.logger.log(
        '🚀 ~ AttachmentService ~ sendAttachmentIDsToVault ~ attachmentIdsRecords:',
        attachmentIdsRecords,
      );
      return attachmentIdsRecords;
    } catch (error) {
      this.logger.error('Error Fetching Attachments', error?.message || error);
      throw new HttpException(
        'Failed to fetch Attachments',
        error.status || 500,
      );
    }
  }
}
