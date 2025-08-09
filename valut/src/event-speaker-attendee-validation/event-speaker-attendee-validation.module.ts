import { Module } from '@nestjs/common';
import { EventSpeakerAttendeeValidationService } from './event-speaker-attendee-validation.service';
import { EventSpeakerAttendeeValidationController } from './event-speaker-attendee-validation.controller';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';
import { SessionStoreService } from 'src/sessionValidation/sessionValidation.service';
import { SpeakerValidationService } from 'src/speaker-validation/speaker-validation.service';

@Module({
  imports: [RabbitMQModule.register('event_speaker_attendee_info')],
  providers: [
    EventSpeakerAttendeeValidationService,
    SessionStoreService,
    SpeakerValidationService,
  ],
  controllers: [EventSpeakerAttendeeValidationController],
})
export class EventSpeakerAttendeeValidationModule {}
