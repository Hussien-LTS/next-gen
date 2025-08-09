import { Module } from '@nestjs/common';
import { AttendeeValidationController } from './attendee-validation.controller';
import { AttendeeValidationService } from './attendee-validation.service';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';
import { SessionStoreService } from 'src/sessionValidation/sessionValidation.service';
import { SpeakerValidationToVaultService } from 'src/speaker-validation-to-vault/speaker-validation-to-vault.service';

@Module({
  imports: [RabbitMQModule.register('vault_attendee-validation_queue')],
  providers: [
    AttendeeValidationService,
    SessionStoreService,
    SpeakerValidationToVaultService,
  ],
  controllers: [AttendeeValidationController],
})
export class AttendeeValidationModule {}
