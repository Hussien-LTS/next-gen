import { Module } from '@nestjs/common';
import { AttendeeValidationController } from './attendee-validation.controller';
import { AttendeeValidationService } from './attendee-validation.service';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMQModule.register("salesforce_attendee_validation_queue")],
  controllers: [AttendeeValidationController],
  providers: [AttendeeValidationService]
})
export class AttendeeValidationModule {}
