import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ISalesforceAuthReqBody } from './interfaces/salesforce_auth_body.interface';
import { RabbitMQService } from 'src/shared/rabbitmq/rabbitmq.service';

@Injectable()
export class SalesforceAuthService {
  constructor(
    private configService: ConfigService,
    private rmqService: RabbitMQService,
  ) {}
  async getTokenAndSend(payload: ISalesforceAuthReqBody): Promise<any> {
    const url = this.configService.get('SALESFORCE_OAUTH_URL');
    const {
      username,
      password,
      client_id,
      client_secret,
      grant_type,
      serverUrl,
    } = payload;
    if (
      !username ||
      !password ||
      !client_id ||
      !client_secret ||
      !grant_type ||
      !serverUrl
    ) {
      return {
        status: 'error',
        message:
          'Missing required fields: username, password, client_id, client_secret, grant_type, serverUrl',
      };
    }
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    const data = new URLSearchParams({
      grant_type: payload.grant_type,
      client_id: payload.client_id,
      client_secret: payload.client_secret,
      username: payload.username,
      password: payload.password,
    });
    try {
      const response = await axios.post(
        `${serverUrl}/services/oauth2/token`,
        data,
        { headers },
      );
      await this.rmqService.emit('salesforce_auth_response', response.data);
      console.log(
        '🚀 ~ SalesforceAuthService ~ getTokenAndSend ~ response.data:',
        response.data,
      );
      return {
        ...response.data,
        serverUrl: payload.serverUrl,
      };
    } catch (error) {
      const errorData = error.response?.data || error.message;
      await this.rmqService.emit('salesforce_auth_error', errorData);
      return {
        status: 'error',
        message: errorData,
      };
    }
  }

  async getCentrisAuth(authKey: string) {
    try {
      const configAuth = await this.rmqService.send('datasource_config_auth', {
        authKey,
      });
      console.log(
        '🚀 ~ SalesforceAuthService ~ getCentrisAuth ~ configAuth:',
        configAuth,
      );
      if (!configAuth)
        throw new BadRequestException(' auth config not saved in DB');
      return await this.getTokenAndSend(configAuth);
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }
}
