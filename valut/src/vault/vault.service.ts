import { Injectable, HttpException, Logger } from '@nestjs/common';

import axios from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VaultService {
  private readonly logger = new Logger(VaultService.name);
  private readonly baseUrl: any;
  private authToken = '';
  private clientId = '';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('VAULT_BASE_URL');
  }

  async getDocuments(authh: string, cntId: string): Promise<any> {
    this.authToken = authh;
    this.clientId = cntId;

    const config = {
      method: 'get' as const,
      url: `${this.baseUrl}/objects/documents`,
      headers: {
        Authorization: authh,
        Accept: 'application/json',
        'X-VaultAPI-ClientID': cntId,
      },
    };

    try {
      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to fetch documents',
        error.response?.status || 500,
      );
    }
  }

  // @Cron(CronExpression.EVERY_2_HOURS)
  // async scheduledVaultFetch() {
  //   this.logger.log('Running scheduled Vault data fetch...EVENT DOCUMENT');

  //   const result = await this.getDocuments(this.authToken, this.clientId);
  //   this.logger.log('Scheduled Vault fetch result:', JSON.stringify(result));
  // }

  start() {
    // do not use hardcoded values in production
    // commenting this out for now
    /*let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v20.3/metadata/objects/documents/events',
      headers: {
        Authorization:
          '38F01FA1EB8D52B3AB31E48F05CF804475F99B584316027E73713975CAA0297870C16E43554AEEA98F0C9936041DFAD48E188130D638E546500B23B4253E18A7',
        Accept: 'application/json',
        'X-VaultAPI-ClientID':
          '3MVG9dG9pUXcsrJANLhayvGIEIgf3Kq5FUDwaSx.rHj.Ji2D2.F7ouMmJTTJk8H5qxLM_uQsopuv6J5nnzADm',
      },
    };

    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log(error);
      });*/
  }

  async getDocumentEvents(authh: string, cntId: string): Promise<any> {
    const config = {
      method: 'get' as const,
      url: 'https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v20.3/metadata/objects/documents/events',
      headers: {
        Authorization: authh,
        Accept: 'application/json',
        'X-VaultAPI-ClientID': cntId,
      },
      maxBodyLength: Infinity,
    };

    try {
      const response = await firstValueFrom(this.httpService.request(config));
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
