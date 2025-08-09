import { Injectable, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQProducerService {
  private readonly logger = new Logger(RabbitMQProducerService.name);
  private readonly RABBIT_URL = 'amqp://admin:admin@localhost:5672'; 
  //private readonly QUEUE = 'veeva_events';

  async sendToQueue(payload: any,queueName : string): Promise<void> {
    try {
      const connection = await amqp.connect(this.RABBIT_URL);
      const channel = await connection.createChannel();

      await channel.assertQueue(queueName, { durable: true });

      const message = Buffer.from(JSON.stringify(payload));
      channel.sendToQueue(queueName, message, { persistent: true });

      this.logger.log(`Message sent to ${queueName}`);

      await channel.close();
      await connection.close();
    } catch (error) {
      this.logger.error(` Failed to send message: ${error.message}`);
    }
  }
}
