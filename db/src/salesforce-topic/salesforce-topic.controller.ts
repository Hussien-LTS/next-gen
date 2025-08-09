import { BadRequestException, Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { SalesforceTopicService } from './salesforce-topic.service';
import { RabbitMQService } from 'src/shared/rabbitmq/rabbitmq.service';

@Controller('salesforce-Topic')
export class SalesforceTopicController {
  constructor(
    private readonly salesforceTopicService: SalesforceTopicService,
    private readonly rmqService: RabbitMQService,
  ) {}

  @EventPattern('salesforce-topic-created')
  async createTopic(@Payload() data: any, @Ctx() context: RmqContext) {
    try {
      console.log('data from RMQ:', data);
      if (!data) {
        context.getChannelRef().nack(context.getMessage(), false, false);
        throw new Error('data missing in payload');
      }
      await this.rmqService.emit(`datasource-topic-handoff`, data);
      context.getChannelRef().ack(context.getMessage());
      return await this.salesforceTopicService.handleTopicCreated(data);
    } catch (error) {
      return {
        isError: true,
        statusCode: 400,
        message: error.message,
      };
    }
  }
}
