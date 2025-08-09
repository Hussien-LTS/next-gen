import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';
import { AuthHanddOffModule } from 'src/auth-handd-off/auth-handd-off.module';

@Module({
  imports: [RabbitMQModule.register('event_vault_queue'), AuthHanddOffModule],
  providers: [EventService],
  controllers: [EventController],
})
export class EventModule {}
