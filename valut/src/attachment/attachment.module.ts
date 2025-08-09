import { Module } from '@nestjs/common';
import { AttachmentController } from './attachment.controller';
import { AttachmentService } from './attachment.service';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';
import { SessionStoreService } from 'src/sessionValidation/sessionValidation.service';

@Module({
  imports: [RabbitMQModule.register('attachment_vault_queue')],
  controllers: [AttachmentController],
  providers: [AttachmentService, SessionStoreService],
})
export class AttachmentModule {}