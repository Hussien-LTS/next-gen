import { Module } from '@nestjs/common';
import { SpeakerValidationService } from './speaker-validation.service';
import { SpeakerValidationController } from './speaker-validation.controller';
import { HCPEligibility } from 'src/entities/hcp_eligibility.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';
import { TransactionLog } from 'src/entities/transaction_log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HCPEligibility, TransactionLog]),
    RabbitMQModule.register('speaker-validation_queue'),
  ],
  providers: [SpeakerValidationService],
  controllers: [SpeakerValidationController],
})
export class SpeakerValidationModule {}
