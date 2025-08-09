import { Module } from '@nestjs/common';
import { SpeakerValidationToVaultService } from './speaker-validation-to-vault.service';
import { SpeakerValidationToVaultController } from './speaker-validation-to-vault.controller';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';
import { SessionStoreService } from 'src/sessionValidation/sessionValidation.service';

@Module({
  imports: [RabbitMQModule.register('update_vault_speaker_queue')],
  providers: [SpeakerValidationToVaultService, SessionStoreService],
  controllers: [SpeakerValidationToVaultController],
})
export class SpeakerValidationToVaultModule {}
