import { Module } from '@nestjs/common';
import { SalesforceUserTerritoryController } from './salesforce-user-territory.controller';
import { SalesforceUserTerritoryService } from './salesforce-user-territory.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionLog } from 'src/entities/transaction_log.entity';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionLog]),
    RabbitMQModule.register('datasource_user_territory_queue'),
  ],
  controllers: [SalesforceUserTerritoryController],
  providers: [SalesforceUserTerritoryService],
})
export class SalesforceUserTerritoryModule {}
