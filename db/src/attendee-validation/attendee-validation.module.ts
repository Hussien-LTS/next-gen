import { Module } from '@nestjs/common';
import { AttendeeValidationController } from './attendee-validation.controller';
import { AttendeeValidationService } from './attendee-validation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HCPEligibility } from 'src/entities/hcp_eligibility.entity';
import { TransactionLog } from 'src/entities/transaction_log.entity';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';

@Module({
  imports: [
      TypeOrmModule.forFeature([HCPEligibility, TransactionLog]),
      RabbitMQModule.register('attendee-validation_queue'),
    ],
  controllers: [AttendeeValidationController],
  providers: [AttendeeValidationService]
})
export class AttendeeValidationModule {}
