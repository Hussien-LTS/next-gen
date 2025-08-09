import { Injectable } from '@nestjs/common';
import { MessageDto } from './dtos/sparkMessage.dto';

@Injectable()
export class SparkService {
  async handleSparkMessage(msg: MessageDto, auth: string) {
    if (msg.attributes.object === 'em_event__v') {
      const eventId = msg.items;
      return {
        message: 'success from spark',
        eventId,
      };
    }
  }
}
