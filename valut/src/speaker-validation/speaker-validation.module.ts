import { Module } from '@nestjs/common';
import { SpeakerValidationService } from './speaker-validation.service';
import { SpeakerValidationController } from './speaker-validation.controller';
import { SessionStoreService } from 'src/sessionValidation/sessionValidation.service';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';
import { SpeakerValidationToVaultService } from 'src/speaker-validation-to-vault/speaker-validation-to-vault.service';

@Module({
  imports: [RabbitMQModule.register('vault_speaker-validation_queue')],
  providers: [
    SpeakerValidationService,
    SessionStoreService,
    SpeakerValidationToVaultService,
  ],
  controllers: [SpeakerValidationController],
})
export class SpeakerValidationModule {}
