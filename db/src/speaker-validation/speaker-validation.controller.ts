import { BadRequestException, Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { SpeakerValidationService } from './speaker-validation.service';
import { RabbitMQService } from 'src/shared/rabbitmq/rabbitmq.service';
import { UpdateSpeakerValidationDto } from './DTOs/create-speaker-validation.dto';

@Controller('speaker-validation')
export class SpeakerValidationController {
  constructor(
    private readonly speakerValidationService: SpeakerValidationService,
    private readonly rmqService: RabbitMQService,
  ) {}

  @EventPattern('speaker-validation-created')
  async handleSpeakerValidationCreate(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    console.log('speaker datasource:', data);

    if (!data) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new Error('Payload missing: Speaker Validation data not found.');
    }

    // await this.rmqService.emit('datasource-speaker-validation-created', data);
    // context.getChannelRef().ack(context.getMessage());

    return await this.speakerValidationService.insertSpeakerValidation(data);
  }

  @EventPattern('update-speaker-validation')
  async handleSpeakerValidationUpdate(
    @Payload() data: UpdateSpeakerValidationDto,
    @Ctx() context: RmqContext,
  ) {
    console.log('Received RMQ data for Speaker Validation Update:', data);

    // const channel = context.getChannelRef();
    // const originalMsg = context.getMessage();

    // if (!data || !data.Id) {
    //   channel.nack(originalMsg, false, false);
    //   return new BadRequestException(
    //     'Payload missing or invalid: Speaker Validation update data not found.',
    //   );
    // }

    try {
      const result =
        await this.speakerValidationService.updateSpeakerValidation(data);
      // channel.ack(originalMsg); // Acknowledge only on success
      return result;
    } catch (error) {
      console.log('🚀 ~ SpeakerValidationController ~ error:', error);
      // channel.nack(originalMsg, false, false); // Reject without requeue
      throw new BadRequestException('Failed to update speaker validation.');
    }
  }
}
