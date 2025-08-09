import {
  Body,
  Controller,
  ForbiddenException,
  HttpException,
  Logger,
  Post,
  Req,
  UnauthorizedException,
  Headers,
  HttpStatus,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AttachmentService } from './attachment.service';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { AttachmentIdDto, GetEventIdDto } from './dtos/attachment.dto';
import { SessionStoreService } from 'src/sessionValidation/sessionValidation.service';
import { CustomVaultAuth } from 'src/decorators/vault-auth.decorator';
import { VaultAuthInterceptor } from 'src/interceptors/vault-auth.interceptor';

@ApiTags('Attachment')
@Controller('attachment')
export class AttachmentController {
  private readonly logger = new Logger(AttachmentController.name);
  private currentSession: string;
  private authToken: Record<string, unknown> | null = null;
  constructor(
    private readonly attachmentService: AttachmentService,
    private readonly sessionStore: SessionStoreService,
  ) {}

  @EventPattern('vault_auth_response')
  handleVaultAuth(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('🚀 ~ AttachmentController ~ handleVaultAuth ~ data:', data);
    this.currentSession = data?.sessionId;
    if (!this.currentSession) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new ForbiddenException();
    }
    this.authToken = data;
    this.sessionStore.set(data.sessionId);
  }

  @EventPattern('vault-attachment-data')
  async handleVaultAttachmentData(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    this.logger.log('data from RMQ create Attachment', data);
    if (!data) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new Error('data missing in payload');
    }
    await this.attachmentService.handelCreatedAttachment(data);
    context.getChannelRef().ack(context.getMessage());
    this.logger.log('data received from RMQ and processed');
    return { status: 'data received from RMQ and processed', data };
  }

  @Post('receive-attachment')
  @ApiOperation({
    summary: 'Receive attachment directly from datasource',
    description:
      'Direct HTTP endpoint to receive attachment data from datasource and save to Veeva Vault',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        AttachmentId: { type: 'string' },
        Name: { type: 'string' },
        Body: { type: 'string' },
        ContentType: { type: 'string' },
        BodyLength: { type: 'string' },
        eventId: { type: 'string' },
        TransactionId: { type: 'string' },
      },
      required: ['AttachmentId', 'Name', 'Body', 'ContentType', 'eventId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Attachment saved to Veeva Vault successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        attachmentId: { type: 'string' },
        eventId: { type: 'string' },
        vaultAttachmentId: { type: 'string' },
      },
    },
  })
  async receiveAttachmentDirectly(@Body() attachmentData: any) {
    try {
      this.logger.log(
        `Received attachment directly via HTTP: ${attachmentData.AttachmentId} - ${attachmentData.Name}`,
      );

      if (!attachmentData || !attachmentData.AttachmentId) {
        this.logger.error(`Attachment data missing`);
        throw new HttpException(
          'Attachment data missing',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate that eventId is present
      if (!attachmentData.eventId) {
        this.logger.error(
          `eventId is required to save attachment to Veeva Vault`,
        );
        throw new HttpException(
          'eventId is required to save attachment to Veeva Vault',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Use RMQ session token like other modules
      if (!this.currentSession) {
        this.logger.error(`No RMQ session available`);
        throw new HttpException(
          'No authentication session available',
          HttpStatus.UNAUTHORIZED,
        );
      }

      this.logger.log(`Event ID for attachment: ${attachmentData.eventId}`);

      // Directly save attachment to Veeva Vault using RMQ session
      const result = await this.attachmentService.sendAttachmentToVault(
        this.currentSession,
        attachmentData,
      );

      this.logger.log(
        `Attachment saved to Veeva Vault successfully: ${attachmentData.AttachmentId}`,
      );

      return {
        success: true,
        message: 'Attachment saved to Veeva Vault successfully',
        attachmentId: attachmentData.AttachmentId,
        eventId: attachmentData.eventId,
        vaultAttachmentId: result.vaultAttachmentId,
      };
    } catch (error) {
      this.logger.error(
        `Failed to save attachment to Veeva Vault: ${error.message}`,
      );
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('sync-to-vault')
  @ApiOperation({
    summary: 'Sync attachments from datasource to Veeva Vault',
    description:
      'This endpoint fetches pending attachments from the datasource and syncs them to Veeva Vault. Requires Vault session token in auth header.',
  })
  @ApiHeader({
    name: 'auth',
    description:
      'Vault Session ID (use /veeva-vault-auth/vault/auth to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Attachments synced to Vault successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Successfully synced 1 attachment(s) to Vault',
        },
        attachmentId: {
          type: 'string',
          example: '00P5C000000VBZGUA44, 00P5C000000VBZGUA45',
          description:
            'Single attachment ID or comma-separated list of attachment IDs if multiple attachments were synced',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Missing auth token' })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Processing error',
  })
  async syncAttachmentsToVault(@Headers() headers: Record<string, string>) {
    try {
      this.logger.log(`Starting sync attachments to Vault`);

      const authToken = headers['auth'];
      if (!authToken) {
        this.logger.error(`Missing auth token in headers`);
        throw new HttpException(
          'Authentication token is required in headers',
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log(
        `Auth token provided, fetching pending attachments from datasource...`,
      );

      // Fetch pending attachments from datasource and sync to Vault
      const result =
        await this.attachmentService.syncAttachmentsToVault(authToken);

      this.logger.log(`Sync completed. Synced ${result.syncedCount} items`);

      // Extract all attachment IDs from synced items
      let attachmentId = null;
      if (result.syncedItems && result.syncedItems.length > 0) {
        if (result.syncedItems.length === 1) {
          // Single attachment - return just the ID
          attachmentId = result.syncedItems[0].attachmentId;
        } else {
          // Multiple attachments - return comma-separated string of IDs
          attachmentId = result.syncedItems
            .map((item) => item.attachmentId)
            .join(', ');
        }
      }

      return {
        success: true,
        message: `Successfully synced ${result.syncedCount} attachment(s) to Vault`,
        attachmentId: attachmentId,
      };
    } catch (error) {
      this.logger.error(
        `Failed to sync attachments to Vault: ${error.message}`,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Post('get-attachment')
  @UseInterceptors(VaultAuthInterceptor)
  @ApiOperation({ summary: 'retrieve Attachment by id from Veeva Vault' })
  @ApiResponse({
    status: 200,
    description: 'retrieve Attachment by id from Veeva Vault',
  })
  @ApiResponse({ status: 400, description: 'Missing or invalid token' })
  @ApiBody({ type: AttachmentIdDto })
  @ApiQuery({
    name: 'version',
    required: false,
    type: Number,
    description: 'Optional version number of the attachment',
  })
  async getAttachmentById(
    @Body() body: AttachmentIdDto,
    @CustomVaultAuth() vaultData: any,
    @Query('version') versionParam?: number,
  ) {
    this.logger.log('🚀 ~ In AttachmentController ~ getAttachmentById:');
    this.logger.log('Request body:', body);
    if (Object.keys(body).length === 1 && Object.values(body)[0] === '') {
      try {
        body = JSON.parse(Object.keys(body)[0]);
      } catch (e) {
        throw new HttpException('Invalid JSON body', 400);
      }
    }

    if (!body.attachmentId || body.attachmentId.trim() === '') {
      throw new HttpException('Attachment Id is required', 400);
    }

    if (!body.eventId || body.eventId.trim() === '') {
      throw new HttpException('Event Id is required', 400);
    }
    if (!vaultData || !vaultData.sessionId) {
      throw new UnauthorizedException();
    }

    const version = Number(versionParam ?? 1);
    return await this.attachmentService.getAttachmentById(
      vaultData,
      body.attachmentId,
      body.eventId,
      version,
    );
  }

  @Post('get-by-event')
  @UseInterceptors(VaultAuthInterceptor)
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched attachment IDs.',
  })
  @ApiBody({ type: GetEventIdDto })
  async getAttachmentsIdsOnEventSubmission(
    @Body() body: GetEventIdDto,
    @CustomVaultAuth() vaultData: any,
  ) {
    this.logger.log(
      '🚀 ~ In AttachmentController ~ getAttachmentsIdsOnEventSubmission',
    );
    // const authToken = this.authToken;
    console.log('🚀 ~ AttachmentController ~ body:', body);

    let eventId = body.eventId;
    if (!eventId) {
      const keys = Object.keys(body);
      if (keys.length === 1) {
        try {
          const parsed = JSON.parse(keys[0]);
          eventId = parsed.eventId;
        } catch (e) {
          this.logger.error('Failed to parse eventId from body');
        }
      }
    }

    if (!eventId || eventId.trim() === '') {
      throw new HttpException('eventId is missing', 400);
    }

    if (vaultData && vaultData.sessionId) {
      this.logger.log('Using RMQ session: true');
      const response =
        await this.attachmentService.getAttachmentsIdsOnEventSubmission(
          vaultData,
          eventId,
        );
      if (response) {
        this.logger.log('🚀 ~ AttachmentController ~ response:', response);
        return response;
      }
    } else {
      this.logger.log('Using RMQ session: false');
      throw new UnauthorizedException(
        'Authentication token is required in headers',
      );
    }
  }
}
