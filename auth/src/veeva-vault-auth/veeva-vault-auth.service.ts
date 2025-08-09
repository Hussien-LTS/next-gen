import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { IVaultAuthReqBody } from './interfaces/vault_auth_body.interface';
import { RabbitMQService } from 'src/shared/rabbitmq/rabbitmq.service';

@Injectable()
export class VeevaVaultAuthService {
  private readonly authUrl: any;
  constructor(
    private configService: ConfigService,
    private rmqService: RabbitMQService,
  ) {
    this.authUrl = this.configService.get('VAULT_AUTH_URL');
  }
  async authenticate(body: IVaultAuthReqBody) {
    const { username, password, serverUrl } = body;
    if (!username || !password || !serverUrl ) {
      return {
        status: 'error',
        message:
          'Missing required fields: username, password, serverUrl',
      };
    } else {
      const formData: any = new URLSearchParams();
      formData.append('username', body.username);
      formData.append('password', body.password);
      formData.append('client_id', body.client_id);
      try {
        const response = await axios.post(
          `${body.serverUrl}/api/v25.1/auth`,
          formData,
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
        );
        await this.rmqService.emit('vault_auth_response', response.data);
        return {
          ...response.data,
          clientId: body?.client_id,
          serverUrl: body?.serverUrl,
        };
      } catch (error) {
        return {
          status: 'error',
          message: error.response?.data || error,
        };
      }
    }
  }

  async getVaultAuth(authKey: string) {
    try {
      const configAuth = await this.rmqService.send('datasource_config_auth', {
        authKey,
      });
      if (!configAuth)
        throw new BadRequestException(' auth config not saved in DB');
      return await this.authenticate(configAuth);
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }
}
