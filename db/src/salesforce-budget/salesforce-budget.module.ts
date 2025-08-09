import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BudgetService } from './salesforce-budget.service';
import { SalesforceBudgetController } from './salesforce-budget.controller';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';
import { Budget } from 'src/entities/budget.entity';
import { TransactionLogModule } from 'src/transaction-log/transaction-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Budget]),
    RabbitMQModule.register('datasource_budget_queue'),
    TransactionLogModule,
  ],
  providers: [BudgetService],
  exports: [BudgetService],
  controllers: [SalesforceBudgetController],
})
export class BudgetModule {}
