import { Module } from '@nestjs/common';
import { AttachmentController } from './attachment.controller';
import { AttachmentService } from './attachment.service';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';
import { JwtSharedModule } from 'src/shared/jwt-shared.module';

@Module({
  imports: [JwtSharedModule,RabbitMQModule.register('salesforce_attachment_queue')],
  controllers: [AttachmentController],
  providers: [AttachmentService]
})
export class AttachmentModule {}
