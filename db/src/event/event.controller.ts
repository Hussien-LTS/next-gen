import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { EventService } from './event.service';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @EventPattern('event_vault_Fdata')
  async getEventFdata(@Payload() dataa: any, @Ctx() context: RmqContext) {
    console.log('event_vault_data - from RMQ', dataa);
    if (!dataa) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new Error('data missing in payload');
    }
    try {
      const createdEvent = await this.eventService.eventSaveProcess(dataa);
      context.getChannelRef().ack(context.getMessage());
      return createdEvent;
    } catch (error) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new Error(`Failed to process event: ${error.message}`);
    }
  }


  @EventPattern('event-to-vault')
  async transactionLogEvent(@Payload() dataa: any, @Ctx() context: RmqContext) {
    if (!dataa) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new Error('data missing in payload');
    }
    context.getChannelRef().ack(context.getMessage());
    return await this.eventService.transactionLogEvent(dataa);
  }

  @EventPattern('centris-to-db')
  async transactionLogCentrisEvent(@Payload() dataa: any, @Ctx() context: RmqContext) {
    if (!dataa) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new Error('data missing in payload');
    }
    context.getChannelRef().ack(context.getMessage());
    return await this.eventService.transactionLogCentrisEvent(dataa);
  }
}
