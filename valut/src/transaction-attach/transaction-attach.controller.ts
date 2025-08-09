import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { TransactionAttachService } from './transaction-attach.service';
import { DownloadRequestDto } from './dtos/DownloadRequest.dto';
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AttachmentDto } from './dtos/AttachmentDto.dto';

@ApiTags('transaction-attach')
@Controller('transaction-attach')
export class TransactionAttachController {
  constructor(
    private readonly transactionAttachService: TransactionAttachService,
  ) {}

  @Post('transactions_logs')
  @ApiOperation({ summary: 'Download attachment content from Veeva Vault' })
  @ApiBody({
    type: DownloadRequestDto,
    description: 'Provide authentication and attachment identifiers',
  })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Attachment file content (as text or base64)',
    schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'File content (base64 encoded or text)',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request or Veeva API Error' })
  async downloadAttachment(
    @Headers() headers: Record<string, string>,
    @Body() body: DownloadRequestDto,
  ) {
    const authToken = headers['auth'];
    return await this.transactionAttachService.downloadAttachment(
      authToken,
      body,
    );
  }

  @Get('transactionattach/:id')
  @ApiOperation({ summary: 'Event Trasnaction Attachments' })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Object created successfully',
    schema: { type: 'object', additionalProperties: true },
  })
  @ApiResponse({ status: 400, description: 'Bad request or Veeva API failure' })
  async getAttachments(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ): Promise<AttachmentDto[]> {
    const authToken = headers['auth'];
    return await this.transactionAttachService.getAttachments(authToken, id);
  }
}
