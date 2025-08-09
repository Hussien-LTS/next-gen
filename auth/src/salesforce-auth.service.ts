import { Injectable, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class SalesforceAuthService implements OnModuleInit {
  private client: ClientProxy;

  onModuleInit() {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://admin:admin@rabbitmq:5672'], // Update if using Docker
        queue: 'salesforce_auth_queue',
        queueOptions: {
          durable: false,
        },
      },
    });
  }

  async getTokenAndSend(payload: {
    grant_type: string;
    client_id: string;
    client_secret: string;
    username: string;
    password: string;
  }): Promise<any> {
    const url =
      'https://nniushcpengagements--nniuat.sandbox.my.salesforce.com/services/oauth2/token';

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
      const response = await axios.post(url, data, { headers });

      await this.client
        .emit('salesforce_auth_response', response.data)
        .toPromise();

      return response.data;
    } catch (error) {
      const errorData = error.response?.data || error.message;

      await this.client
        .emit('salesforce_auth_error', errorData)
        .toPromise();

      return {
        status: 'error',
        message: errorData,
      };
    }
  }
}
