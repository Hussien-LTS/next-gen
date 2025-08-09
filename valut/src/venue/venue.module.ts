import { Module } from '@nestjs/common';
import { VenueController } from './venue.controller';
import { VenueService } from './venue.service';
import { SessionStoreService } from 'src/sessionValidation/sessionValidation.service';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMQModule.register('venue_vault_queue')],
  controllers: [VenueController],
  providers: [VenueService, SessionStoreService],
})
export class VenueModule {}
