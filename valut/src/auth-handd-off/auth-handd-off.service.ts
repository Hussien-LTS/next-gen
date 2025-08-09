import { Injectable } from '@nestjs/common';
import { RabbitMQService } from 'src/shared/rabbitmq/rabbitmq.service';


@Injectable()
export class AuthHanddOffService {
  constructor(private readonly RMQService: RabbitMQService) {}
  async handleAuthHandOff() {
    try {
      const res = await this.RMQService.send('get_vault_auth', {
        authKey: 'vaultAuth',
      });
      return res;
    } catch (error) {
      console.error('Error handling auth hand-off:', error);
      throw error;
    }
  }
}
