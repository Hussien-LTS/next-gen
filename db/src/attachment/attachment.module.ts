import { Module } from '@nestjs/common';
import { AttachmentController } from './attachment.controller';
import { AttachmentService } from './attachment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attachment } from 'src/entities/attachment.entity';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';
import { AttachmentIds } from 'src/entities/attachmentIds.entity';
import { S3Service } from './s3.service';
import { TransactionLog } from 'src/entities/transaction_log.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([Attachment, AttachmentIds, TransactionLog]),
    RabbitMQModule.register('datasource_attachment_queue'),
  ],
  providers: [AttachmentService, S3Service],
  exports: [AttachmentService],
  controllers: [AttachmentController],
})
export class AttachmentModule {}
