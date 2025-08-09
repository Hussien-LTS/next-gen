import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { RabbitMQService } from '../shared/rabbitmq/rabbitmq.service';
import { mapApiResponseToAttachment } from './mapApiResponseToAttachment';
import { TRANSACTION_DIRECTIONS } from 'src/shared/constants/transaction-log-dirction';
import { mapTransactionLogPayload } from 'src/shared/transactionLog/mapTransactionLogPayload';
import { randomUUID } from 'crypto';
import * as qs from 'qs';

@Injectable()
export class AttachmentService {
  private readonly logger = new Logger(AttachmentService.name);
  private readonly clientId: any;
  private readonly baseUrl: any;
  private transactionId: string;
  private attachmentQueue: any[] = []; // In-memory queue for attachments
  constructor(
    private readonly configService: ConfigService,
    private rabbitMQService: RabbitMQService,
  ) {
    this.baseUrl = this.configService.get<string>('VAULT_BASE_URL');
    this.clientId = this.configService.get<string>('VAULT_CLIENT_ID');
  }
  // Method to add attachments to the queue (called by RabbitMQ handler)
  async addToQueue(attachmentData: any): Promise<void> {
    this.logger.log(
      `📥 Adding attachment to queue: ${attachmentData.AttachmentId}`,
    );
    this.attachmentQueue.push(attachmentData);
    this.logger.log(`📊 Queue size: ${this.attachmentQueue.length}`);
  }

  // Method to get queue status
  getQueueStatus(): { size: number; attachments: any[] } {
    return {
      size: this.attachmentQueue.length,
      attachments: [...this.attachmentQueue],
    };
  }

  async syncAttachmentsToVault(authToken: string): Promise<any> {
    this.logger.log(
      `🔄 Starting sync of attachments to Vault using direct datasource approach...`,
    );

    try {
      // Get attachments directly from datasource
      this.logger.log(`📝 Getting attachments from datasource...`);

      let attachments: any[] = [];
      try {
        // Call datasource to get pending attachments
        const datasourceUrl = 'http://nextgen_datasource:3000'; // Datasource service URL
        const response = await axios.get(
          `${datasourceUrl}/attachment/get-pending-for-veeva`,
        );
        attachments = response.data?.attachments || [];
        this.logger.log(
          `📝 Retrieved ${attachments.length} attachments from datasource`,
        );

        // If we got attachments from datasource, send them to Vault and then to execution queue
        if (attachments.length > 0) {
          this.logger.log(
            `📤 Processing ${attachments.length} attachments from datasource`,
          );
          return await this.processAttachmentsFromDatasource(
            attachments,
            authToken,
          );
        }
      } catch (error) {
        this.logger.error(
          `❌ Failed to get attachments from datasource: ${error.message}`,
        );
        // Fallback to queue if datasource call fails
        attachments = [...this.attachmentQueue];
        this.logger.log(
          `📝 Fallback: Retrieved ${attachments.length} attachments from queue`,
        );
      }

      if (attachments.length === 0) {
        this.logger.log(`ℹ️ No attachments to sync`);
        return {
          syncedCount: 0,
          errorCount: 0,
          totalCount: 0,
          syncedItems: [],
        };
      }

      // Log the attachment IDs we received
      const attachmentIds = attachments.map(
        (att) => att.AttachmentId || att.Id,
      );
      this.logger.log(
        `📋 Attachment IDs from datasource: ${attachmentIds.join(', ')}`,
      );

      const syncedItems: any[] = [];
      let successCount = 0;
      let errorCount = 0;

      // Process each attachment
      for (const attachment of attachments) {
        try {
          const attachmentId = attachment.AttachmentId || attachment.Id;
          this.logger.log(
            `🔄 Processing attachment: ${attachmentId} - ${attachment.Name}`,
          );

          // Send attachment to Vault
          const vaultResult = await this.sendAttachmentToVault(
            authToken,
            attachment,
          );

          syncedItems.push({
            transactionId: attachmentId,
            attachmentId: attachmentId,
            vaultTransactionId: 'SKIPPED_TRANSACTION_LOG',
            vaultAttachmentId: vaultResult.vaultAttachmentId,
            status: 'success',
          });

          successCount++;
          this.logger.log(
            `✅ Successfully synced: ${attachmentId} - ${attachment.Name}`,
          );
        } catch (error) {
          errorCount++;
          const attachmentId = attachment.AttachmentId || attachment.Id;
          this.logger.error(
            `❌ Failed to sync attachment ${attachmentId}: ${error.message}`,
          );

          syncedItems.push({
            transactionId: attachmentId,
            attachmentId: attachmentId,
            vaultTransactionId: null,
            vaultAttachmentId: null,
            status: 'error',
            error: error.message,
          });
        }
      }

      // Clear the queue after processing
      this.clearQueue();
      this.logger.log(
        `🧹 Queue cleared after processing ${attachments.length} attachments`,
      );

      const result = {
        syncedCount: successCount,
        errorCount: errorCount,
        totalCount: attachments.length,
        syncedItems: syncedItems,
      };

      this.logger.log(
        `✅ Sync completed: ${successCount} successful, ${errorCount} failed from datasource`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `❌ Failed to sync attachments to Vault: ${error.message}`,
      );
      throw new Error(`Attachment sync failed: ${error.message}`);
    }
  }

  private clearQueue(): void {
    this.logger.log(`🧹 Clearing queue...`);
    this.attachmentQueue = [];
    this.logger.log(`✅ Queue cleared successfully`);
  }

  private async processAttachmentsFromDatasource(
    attachments: any[],
    authToken: string,
  ): Promise<any> {
    this.logger.log(
      `🔄 Processing ${attachments.length} attachments from datasource`,
    );

    const syncedItems: any[] = [];
    let successCount = 0;
    let errorCount = 0;

    for (const attachment of attachments) {
      try {
        const attachmentId = attachment.AttachmentId || attachment.Id;
        this.logger.log(
          `🔄 Processing attachment: ${attachmentId} - ${attachment.Name}`,
        );

        // Send attachment to Vault
        const vaultResult = await this.sendAttachmentToVault(
          authToken,
          attachment,
        );

        // Send to Vault execution queue
        await this.sendToVaultExecutionQueue(attachment, vaultResult);

        syncedItems.push({
          transactionId: attachmentId,
          attachmentId: attachmentId,
          vaultTransactionId: 'SKIPPED_TRANSACTION_LOG',
          vaultAttachmentId: vaultResult.vaultAttachmentId,
          status: 'success',
        });

        successCount++;
        this.logger.log(
          `✅ Successfully synced: ${attachmentId} - ${attachment.Name}`,
        );
      } catch (error) {
        errorCount++;
        const attachmentId = attachment.AttachmentId || attachment.Id;
        this.logger.error(
          `❌ Failed to sync attachment ${attachmentId}: ${error.message}`,
        );

        syncedItems.push({
          transactionId: attachmentId,
          attachmentId: attachmentId,
          vaultTransactionId: null,
          vaultAttachmentId: null,
          status: 'error',
          error: error.message,
        });
      }
    }

    return {
      syncedCount: successCount,
      errorCount: errorCount,
      totalCount: attachments.length,
      syncedItems: syncedItems,
    };
  }

  private async sendToVaultExecutionQueue(
    attachment: any,
    vaultResult: any,
  ): Promise<void> {
    this.logger.log(
      `📤 Sending attachment to Vault execution queue: ${attachment.AttachmentId}`,
    );

    try {
      // Send to Vault execution queue for final processing
      const queueName = 'vault-execution-queue';
      this.logger.log(
        `📤 Sending attachment to ${queueName}: ${attachment.AttachmentId}`,
      );

      await this.rabbitMQService.emit(queueName, {
        AttachmentId: attachment.AttachmentId,
        Name: attachment.Name,
        Body: attachment.Body,
        ContentType: attachment.ContentType,
        BodyLength: attachment.BodyLength,
        eventId: attachment.eventId,
        vaultAttachmentId: vaultResult.vaultAttachmentId,
        source: 'veeva-consumer',
        status: 'READY_FOR_EXECUTION',
        timestamp: new Date().toISOString(),
      });

      this.logger.log(
        `✅ Attachment sent to Vault execution queue successfully: ${attachment.AttachmentId}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to send attachment to Vault execution queue: ${error.message}`,
      );
      throw new Error(
        `Failed to send attachment to Vault execution queue: ${error.message}`,
      );
    }
  }

  public async sendAttachmentToVault(
    authToken: string,
    attachment: any,
  ): Promise<any> {
    this.logger.log(
      `📤 Sending attachment to Vault: ${attachment.AttachmentId || attachment.Id} - ${attachment.Name}`,
    );

    try {
      const clientId = this.clientId;
      const eventId = attachment.eventId;

      if (!eventId) {
        throw new Error(
          'eventId is required to save attachment to Veeva Vault',
        );
      }

      // Prepare the attachment data for Veeva Vault
      const attachmentData = {
        name__v: attachment.Name,
        content_type__v: attachment.ContentType,
        body__v: attachment.Body,
        body_length__v: attachment.BodyLength || attachment.Body?.length || 0,
      };

      // Convert to form-encoded format as required by Veeva Vault
      const data = qs.stringify(attachmentData);

      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        // Direct attachment to event endpoint
        url: `${this.baseUrl}/vobjects/em_event__v/${eventId}/attachments`,
        headers: {
          Authorization: authToken,
          Accept: 'application/json',
          'X-VaultAPI-ClientID': clientId,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data,
      };

      this.logger.log(`📤 Making API call to Veeva Vault: ${config.url}`);
      this.logger.log(
        `📤 Attachment data: ${JSON.stringify(attachmentData, null, 2)}`,
      );

      const response = await axios.request(config);

      if (response?.data?.responseStatus === 'SUCCESS') {
        const vaultAttachmentId =
          response?.data?.data?.id || attachment.AttachmentId;
        this.logger.log(`✅ Successfully saved attachment to Veeva Vault`);
        this.logger.log(`✅ Vault attachment ID: ${vaultAttachmentId}`);

        return {
          success: true,
          message: 'Attachment sent to Vault successfully',
          body: attachment.Body,
          vaultAttachmentId: vaultAttachmentId,
          vaultResponse: response.data,
        };
      } else {
        throw new Error(
          `Veeva Vault API returned error: ${JSON.stringify(response.data)}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `❌ Failed to send attachment to Veeva Vault: ${error.message}`,
      );
      if (error.response) {
        this.logger.error(
          `❌ Vault error response: ${JSON.stringify(error.response.data)}`,
        );
        throw new Error(
          `Veeva Vault API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new Error(
        `Failed to send attachment to Veeva Vault: ${error.message}`,
      );
    }
  }
  async handelCreatedAttachment(attachmentData: any): Promise<void> {
    this.logger.log('🚀 ~ In AttachmentService ~ handelCreatedAttachment');
    try {
      this.logger.log(
        `Processing attachment: ${attachmentData.AttachmentId} - ${attachmentData.Name}`,
      );
      this.logger.log(`Attachment data received and processed successfully`);

      // Emit to vault-attachment-data queue for further processing
      await this.rabbitMQService.emit('vault-attachment-data', attachmentData);
      this.logger.log(
        `📤 Emitted to vault-attachment-data queue: ${attachmentData.AttachmentId}`,
      );
    } catch (error) {
      this.logger.error(`❌ Failed to process attachment: ${error.message}`);
      throw new Error(`Failed to process attachment: ${error.message}`);
    }
  }

  async getAttachmentById(
    vaultAuth: any,
    attachmentId: string,
    eventId: string,
    version: number,
  ): Promise<any> {
    this.logger.log('🚀 ~ In AttachmentService ~ getAttachmentById:');
    const uuid = randomUUID();
    this.transactionId = uuid;
    const { sessionId, clientId, serverUrl } = vaultAuth;
    if (!sessionId || !clientId || !serverUrl) {
      throw new UnauthorizedException('Missing Vault auth');
    }
    version = version ? version : 1;
    const config = {
      method: 'get' as const,
      url: `${this.baseUrl}/vobjects/em_event__v/${eventId}/attachments/${attachmentId}/versions/${version}`,
      headers: {
        Authorization: sessionId as string,
        Accept: 'application/json',
        'X-VaultAPI-ClientID': clientId,
      },
    };

    try {
      this.logger.log(
        `Fetching Attachment For Event ${eventId}: ${attachmentId}.....`,
      );
      const response = await axios.request(config);
      const attachmentContent = await this.getAttachmentContent(
        sessionId,
        attachmentId,
        eventId,
      );
      console.log(
        '🚀 ~ AttachmentService ~ getAttachmentById ~ attachmentContent:',
        attachmentContent,
      );
      const attachmentByIdDto = response?.data;

      if (response?.data?.errors) {
        await this.rabbitMQService.send(
          'transaction-log',
          mapTransactionLogPayload({
            name: this.transactionId,
            direction: TRANSACTION_DIRECTIONS.VAULT_INBOUND,
            logType: 'Attachment',
            success: 'false',
            errorMessage: response?.data?.errors?.message,
            owner: vaultAuth?.userId?.toString(),
          }),
        );
        return {
          success: false,
          message: 'Failed to sync Attachment from Veeva Vault',
        };
      } else
        this.logger.log(
          `Attachment with Id: ${attachmentId} Fetched Successfully For Event ${eventId} `,
        );
      const res = mapApiResponseToAttachment(
        attachmentByIdDto.data,
        attachmentId,
        eventId,
        this.transactionId,
      );

      console.log('🚀 ~ AttachmentService ~ getAttachmentById ~ res:', res);
      await this.rabbitMQService.emit('vault-attachment-data', {
        res,
        attachmentContent,
      });
      await this.rabbitMQService.send(
        'transaction-log',
        mapTransactionLogPayload({
          name: this.transactionId,
          direction: TRANSACTION_DIRECTIONS.VAULT_INBOUND,
          logType: 'Attachment',
          success: 'true',
          owner: vaultAuth?.userId?.toString(),
        }),
      );

      this.logger.log(`Attachment: ${attachmentId}:`, attachmentByIdDto);

      return {
        success: true,
        message: 'Attachment synced successfully from Veeva Vault',
      };
    } catch (error) {
      this.logger.error('Error Fetching Attachment', error?.message || error);
      await this.rabbitMQService.send(
        'transaction-log',
        mapTransactionLogPayload({
          name: this.transactionId,
          direction: TRANSACTION_DIRECTIONS.VAULT_INBOUND,
          logType: 'Attachment',
          success: 'false',
          errorMessage: error.message,
          owner: vaultAuth?.userId?.toString(),
        }),
      );
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error:
            error?.response?.data ||
            'Failed to fetch Attachment from Veeva Vault',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getAttachmentContent(
    sessionId: string,
    attachmentId: string,
    eventId: string,
  ) {
    const clientId = this.clientId;
    if (!sessionId) {
      this.logger.error('Authorization token or Client ID is missing');
      throw new HttpException(
        'Missing Authorization header',
        HttpStatus.BAD_REQUEST,
      );
    }
    const getAttachmentContentConfig = {
      method: 'get' as const,
      url: `${this.baseUrl}/vobjects/em_event__v/${eventId}/attachments/${attachmentId}/file`,
      headers: {
        Authorization: sessionId as string,
        Accept: 'application/json',
        'X-VaultAPI-ClientID': clientId,
      },
    };

    try {
      const getAttachmentContentResponse = await axios.request(
        getAttachmentContentConfig,
      );
      return getAttachmentContentResponse.data;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error:
            error?.response?.data ||
            'Failed to fetch Attachment from Veeva Vault',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getAttachmentsIdsOnEventSubmission(
    vaultAuth: any,
    eventId: string,
  ): Promise<any> {
    this.logger.log(
      '🚀 ~ In AttachmentService ~ getDocumentsOnEventSubmission:',
    );
    const { sessionId, clientId, serverUrl } = vaultAuth;
    if (!sessionId || !clientId || !serverUrl) {
      throw new UnauthorizedException('Missing Vault auth');
    }
    const uuid = randomUUID();
    this.transactionId = uuid;
    try {
      const receivedAttachmentIds = await this.rabbitMQService.send(
        'datasource-getDocumentsOnEventSubmission-data',
        { eventId },
      );
      this.logger.log(
        '🚀 ~ AttachmentService ~ receivedAttachmentIds:!',
        receivedAttachmentIds,
      );
      if (
        !receivedAttachmentIds?.attachmentIDs ||
        receivedAttachmentIds?.attachmentIDs?.length === 0
      ) {
        this.logger.warn('No attachment IDs found in response');

        await this.rabbitMQService.emit(
          'transaction-log',
          mapTransactionLogPayload({
            name: this.transactionId,
            direction: TRANSACTION_DIRECTIONS.VAULT_INBOUND,
            logType: 'Attachment',
            success: 'false',
            errorMessage: 'No attachment IDs found for the provided event ID',
            owner: vaultAuth?.userId?.toString(),
          }),
        );
        return {
          success: false,
          message: 'No attachment IDs found for the provided event ID',
        };
      }

      await this.rabbitMQService.emit(
        'transaction-log',
        mapTransactionLogPayload({
          name: this.transactionId,
          direction: TRANSACTION_DIRECTIONS.VAULT_INBOUND,
          logType: 'Attachment',
          success: 'true',
          owner: vaultAuth?.userId?.toString(),
        }),
      );
      this.logger.log(
        `Attachments IDs Fetched Successfully for Event ID: ${eventId}`,
      );
      return { AttachmentIdList: receivedAttachmentIds?.attachmentIDs };
    } catch (error) {
      await this.rabbitMQService.emit(
        'transaction-log',
        mapTransactionLogPayload({
          name: this.transactionId,
          direction: TRANSACTION_DIRECTIONS.VAULT_INBOUND,
          logType: 'Attachment',
          success: 'false',
          errorMessage: error?.message,
          owner: vaultAuth?.userId?.toString(),
        }),
      );
      this.logger.error(
        'Error Fetching Attachments IDs',
        error?.message || error,
      );
      throw new HttpException(
        error.response?.data || 'Failed to fetch Attachments IDs',
        error.response?.status || 500,
        error.message ?? error,
      );
    }
  }
}
