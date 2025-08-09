import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class VaultAuthService {
  private readonly authUrl = 'https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v20.3/auth';
  private client: ClientProxy;


    onModuleInit() {
      this.client = ClientProxyFactory.create({
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:admin@rabbitmq:5672'], // Update if using Docker
          queue: 'vault_auth_queue',
          queueOptions: {
            durable: false,
          },
        },
      });
    }

  async authenticate(body: { username: string; password: string }) {
    const formData = new URLSearchParams();
    formData.append('username', body.username);
    formData.append('password', body.password);

    try {
      const response = await axios.post(this.authUrl, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      await this.client
      .emit('vault_auth_response', response.data)
      .toPromise();

      return response.data;
    } catch (error) {
      return {
        status: 'error',
        message: error.response?.data || error.message,
      };
    }
  }
}