import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { DownloadRequestDto } from './dtos/DownloadRequest.dto';
import { AttachmentDto } from './dtos/AttachmentDto.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TransactionAttachService {
  private readonly logger = new Logger(TransactionAttachService.name);
  private readonly clientId: any;
  private readonly baseUrl: any;
  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('VAULT_BASE_URL');
    this.clientId = this.configService.get<string>('VAULT_CLIENT_ID');
  }
  async downloadAttachment(
    authToken: string,
    body: DownloadRequestDto,
  ): Promise<any> {
    const clientId = this.clientId;
    const { objectId, attachmentId, version } = body;
    const config = {
      method: 'get' as const,
      url: `${this.baseUrl}/vobjects/transaction_logs__c/${objectId}/attachments/${attachmentId}/versions/${version}/file`,
      headers: {
        Authorization: authToken,
        Accept: 'application/json',
        'X-VaultAPI-ClientID': clientId,
      },
    };
    try {
      const response = await axios.request(config);
      const base64Content = response.data;
      return base64Content;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error:
            error?.response?.data || 'Failed to download file from Veeva Vault',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async getAttachments(
    authToken: string,
    id: string,
  ): Promise<AttachmentDto[]> {
    const clientId = this.clientId;
    const config = {
      method: 'get' as const,
      url: `https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v20.3/vobjects/transaction_logs__c/${id}/attachments`,
      headers: {
        Authorization: authToken,
        Accept: 'application/json',
        'X-VaultAPI-ClientID': clientId,
      },
      maxBodyLength: Infinity,
    };
    try {
      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      console.error(
        'Error fetching document events:',
        error?.response?.data || error.message,
      );
      throw error;
    }
  }
}
