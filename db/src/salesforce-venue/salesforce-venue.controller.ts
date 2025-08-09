import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { VenueService } from './salesforce-venue.service';
import { RabbitMQService } from 'src/shared/rabbitmq/rabbitmq.service';
import { VenueDto } from './DTOs/create-venue.dto';

@Controller('venue')
export class VenueController {
  constructor(
    private readonly venueService: VenueService,
    private readonly rmqService: RabbitMQService,
  ) {}

  @EventPattern('salesforce-venue-created')
  async createVenue(@Payload() data: VenueDto, @Ctx() context: RmqContext) {
    try {
      console.log('Data from RMQ:', data);

      if (!data) {
        context.getChannelRef().nack(context.getMessage(), false, false);
        throw new Error('Data missing in payload');
      }
      await this.rmqService.emit(`datasource-venue-created`, data);

      context.getChannelRef().ack(context.getMessage());

      return await this.venueService.handleVenueCreated(data);
    } catch (error) {
      console.log('in the catch l 30');

      return {
        isError: true,
        statusCode: 400,
        message: error.message,
      };
    }
  }
}
