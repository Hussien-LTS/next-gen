import { Module } from '@nestjs/common';
import { UserTerritoryController } from './user-territory.controller';
import { UserTerritoryService } from './user-territory.service';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMQModule.register('veeva_user_territory_queue')],
  controllers: [UserTerritoryController],
  providers: [UserTerritoryService],
})
export class UserTerritoryModule {}
