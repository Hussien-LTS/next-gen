import { Module } from '@nestjs/common';
import { BudgetController } from './budget.controller';
import { BudgetService } from './budget.service';
import { SessionStoreService } from 'src/sessionValidation/sessionValidation.service';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMQModule.register('budget_vault_queue')],
  controllers: [BudgetController],
  providers: [BudgetService, SessionStoreService],
})
export class BudgetModule {}
