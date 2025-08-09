import { Module } from '@nestjs/common';
import { VaultTerritoryController } from './vault-territory.controller';
import { VaultTerritoryService } from './vault-territory.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Territory } from 'src/entities/territory.entity';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';
import { TransactionLogModule } from 'src/transaction-log/transaction-log.module';

@Module({
  imports: [
    RabbitMQModule.register('datasource_vault-territory_queue'),
    TypeOrmModule.forFeature([Territory]),
    TransactionLogModule,
  ],
  controllers: [VaultTerritoryController],
  providers: [VaultTerritoryService],
})
export class VaultTerritoryModule {}