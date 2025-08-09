import { Module } from '@nestjs/common';
import { AttendeesController } from './attendees.controller';
import { AttendeesService } from './attendees.service';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';
import { AuthHanddOffModule } from 'src/auth-handd-off/auth-handd-off.module';

@Module({
  imports: [
    RabbitMQModule.register('vault_attendee_queue'),
    AuthHanddOffModule,
  ],
  controllers: [AttendeesController],
  providers: [AttendeesService],
})
export class AttendeesModule {}
