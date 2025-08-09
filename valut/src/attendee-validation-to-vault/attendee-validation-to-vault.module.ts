import { Module } from '@nestjs/common';
import { AttendeeValidationToVaultController } from './attendee-validation-to-vault.controller';
import { AttendeeValidationToVaultService } from './attendee-validation-to-vault.service';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';
import { SessionStoreService } from 'src/sessionValidation/sessionValidation.service';

@Module({
  imports: [RabbitMQModule.register('update_vault_attendee_queue')],
  controllers: [AttendeeValidationToVaultController],
  providers: [AttendeeValidationToVaultService, SessionStoreService]
})
export class AttendeeValidationToVaultModule {}
