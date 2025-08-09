import { Controller, Logger, Post, Body, Get } from '@nestjs/common';
import { AttachmentService } from './attachment.service';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { RabbitMQService } from 'src/shared/rabbitmq/rabbitmq.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Attachment')
@Controller('attachment')
export class AttachmentController {
  private readonly logger = new Logger(AttachmentController.name);
  constructor(
    private readonly attachmentService: AttachmentService,
    private readonly rmqService: RabbitMQService,
  ) {}

  @EventPattern('vault-attachment-data')
  async createAttachment(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.log('data from RMQ create Attachment', data);
    if (!data) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new Error('data missing in payload');
    }
    const res = await this.attachmentService.handelCreatedAttachment(data);
    const obj = { transactionId: data.res[0].TransactionId, res };
    await this.rmqService.emit('datasource-attachment-handoff', obj);

    context.getChannelRef().ack(context.getMessage());
    this.logger.log('data sent to Centris from RMQ', res);
    return { status: 'data received from RMQ and processed', res };
  }

  @EventPattern('centres-attachment-data')
  async sendAttachmentToCentres(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    this.logger.log('data from RMQ sendAttachmentToCentres', data);
    if (!data) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new Error('data missing in payload');
    }

    const response = await this.attachmentService.sendAttachmentToCentres(
      data.AttachmentId,
      data.eventId,
    );
    this.logger.log('🚀 ~ sendAttachmentToCentres~ DATA SENT:', response);

    context.getChannelRef().ack(context.getMessage(), false, false);
    return { status: 'data received from RMQ ', response };
  }

  @EventPattern('datasource-getDocumentsOnEventSubmission-data')
  async sendAttachmentIDsToCentris(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    if (!data) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new Error('data missing in payload');
    }
    this.logger.log('data from RMQ sendAttachmentIDsToCentris', data);
    const attachmentIDs =
      await this.attachmentService.sendAttachmentIDsToCentris(data.eventId);
    this.logger.log(
      '🚀 ~ datasource-getDocumentsOnEventSubmission-data~ DATA SENT:{}',
      attachmentIDs,
    );

    context.getChannelRef().ack(context.getMessage());
    return {
      status: 'data received from RMQ sendAttachmentIDsToCentris',
      attachmentIDs,
    };
  }

  @EventPattern('centris-attachment-to-veeva')
  async handleCentrisAttachmentToVeeva(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    try {
      if (!data) {
        context.getChannelRef().nack(context.getMessage(), false, false);
        return { success: false, error: 'Attachment data missing in payload' };
      }

      const transactionResult =
        await this.attachmentService.saveAttachmentForVeevaSync(data);
      context.getChannelRef().ack(context.getMessage());
      return transactionResult;
    } catch (error) {
      context.getChannelRef().nack(context.getMessage(), false, false);

      return {
        VeevaTransactionId: null,
        CentrisReferenceId: data.TransactionId,
        success: false,
        errorMessage: error.message,
      };
    }
  }

  @Get('get-pending-for-veeva')
  @ApiOperation({ summary: 'Get pending attachments for Veeva sync' })
  @ApiResponse({
    status: 200,
    description: 'Pending attachments retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        attachments: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              Id: { type: 'string' },
              AttachmentId: { type: 'string' },
              Name: { type: 'string' },
              ContentType: { type: 'string' },
              Body: { type: 'string' },
              BodyLength: { type: 'string' },
              eventId: { type: 'string' },
              TransactionId: { type: 'string' },
              Status: { type: 'string' },
              ModifiedDateTime: { type: 'string' },
            },
          },
        },
        totalCount: { type: 'number' },
      },
    },
  })
  async getPendingAttachmentsForVeeva(
    @Body() body: { limit?: number; status?: string } = {},
  ) {
    try {
      this.logger.log(`🔄 Getting pending attachments for Veeva sync`);
      this.logger.log(
        `📝 Request: limit=${body.limit || 10}, status=${body.status || 'pending'}`,
      );

      const attachments =
        await this.attachmentService.getPendingAttachmentsForVeeva(
          body.limit || 10,
          body.status || 'pending',
        );

      return {
        success: true,
        message: 'Pending attachments retrieved successfully',
        attachments: attachments,
        totalCount: attachments.length,
      };
    } catch (error) {
      this.logger.error(
        `❌ Failed to get pending attachments: ${error.message}`,
      );
      throw error;
    }
  }

  @Post('mark-synced-to-veeva')
  @ApiOperation({ summary: 'Mark attachments as synced to Veeva' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        attachmentIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of Attachment IDs to mark as synced',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Attachments marked as synced successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        syncedCount: { type: 'number' },
      },
    },
  })
  async markAttachmentsAsSyncedToVeeva(
    @Body() body: { attachmentIds: string[] },
  ) {
    try {
      this.logger.log(`🔄 Marking attachments as synced to Veeva`);
      this.logger.log(
        `📝 Request: ${body.attachmentIds?.length || 0} attachment IDs`,
      );

      await this.attachmentService.markAttachmentsAsSyncedToVeeva(
        body.attachmentIds || [],
      );

      return {
        success: true,
        message: 'Attachments marked as synced to Veeva successfully',
        syncedCount: body.attachmentIds?.length || 0,
      };
    } catch (error) {
      this.logger.error(
        `❌ Failed to mark attachments as synced: ${error.message}`,
      );
      throw error;
    }
  }
}
