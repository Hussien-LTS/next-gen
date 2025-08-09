import { Module } from '@nestjs/common';
import { TerritoryService } from './territory.service';
import { TerritoryController } from './territory.controller';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';
import { SessionStoreService } from 'src/sessionValidation/sessionValidation.service';

@Module({
  imports: [RabbitMQModule.register('vault_territory_queue')],
  providers: [TerritoryService, SessionStoreService],
  controllers: [TerritoryController],
})
export class TerritoryModule {}
