import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { BudgetService } from './salesforce-budget.service';
import { RabbitMQService } from 'src/shared/rabbitmq/rabbitmq.service';
import { CreateBudgetDto } from './DTOs/create-budget.dto';

@Controller('salesforce-budget')
export class SalesforceBudgetController {
  constructor(
    private readonly budgetService: BudgetService,
    private readonly rmqService: RabbitMQService,
  ) {}

  @EventPattern('budget-created')
  async createBudget(
    @Payload() data: CreateBudgetDto,
    @Ctx() context: RmqContext,
  ) {
    console.log('data from RMQ', data);
    if (!data) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new Error('data missing in payload');
    }
    const budget = await this.budgetService.handleBudgetCreated(data);
    await this.rmqService.emit(`datasource-budget-created`, data);
    context.getChannelRef().ack(context.getMessage());
    return budget;
  }

  @EventPattern('budget-updated')
  async updateBudget(
    @Payload() data: CreateBudgetDto,
    @Ctx() context: RmqContext,
  ) {
    console.log('samah', data);
    if (!data) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new Error('data missing in payload');
    }
    const budget = await this.budgetService.handleBudgetUpdated(
      data.budgetList[0],
    );
    await this.rmqService.emit(`datasource-budget-created`, data);
    context.getChannelRef().ack(context.getMessage());
    return budget;
  }
}
