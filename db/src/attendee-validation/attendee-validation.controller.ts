import { BadRequestException, Controller } from '@nestjs/common';
import { AttendeeValidationService } from './attendee-validation.service';
import { RabbitMQService } from 'src/shared/rabbitmq/rabbitmq.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { UpdateAttendeeValidationDto } from './DTOs/create-attendee-validation.dto';

@Controller('attendee-validation')
export class AttendeeValidationController {
  constructor(
    private readonly attendeeValidationService: AttendeeValidationService,
    private readonly rmqService: RabbitMQService,
  ) {}

  @EventPattern('attendee-validation-created')
  async handleAttendeeValidationCreate(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    console.log('attendee datasource:', data);

    if (!data) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new Error('Payload missing: attendee Validation data not found.');
    }

    // await this.rmqService.emit('datasource-speaker-validation-created', data);
    // context.getChannelRef().ack(context.getMessage());
    const res =  await this.attendeeValidationService.insertAttendeeValidation(data);
    console.log("🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀:", res)
    return res
  }

  @EventPattern('update-attendee-validation')
  async handleAttendeeValidationUpdate(
    @Payload() data: UpdateAttendeeValidationDto,
    @Ctx() context: RmqContext,
  ) {
    console.log('Received RMQ data for Attendee Validation Update:', data);

    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    if (!data || !data.Id) {
      channel.nack(originalMsg, false, false);
      return new BadRequestException(
        'Payload missing or invalid: Attendee Validation update data not found.',
      );
    }

    try {
      const result =
        await this.attendeeValidationService.updateAttendeeValidation(data);
      channel.ack(originalMsg); // Acknowledge only on success
      return result;
    } catch (error) {
      console.log('🚀 ~ AttendeeValidationController ~ error:', error);
      channel.nack(originalMsg, false, false); // Reject without requeue
      throw new BadRequestException('Failed to update Attendee validation.');
    }
  }
}
