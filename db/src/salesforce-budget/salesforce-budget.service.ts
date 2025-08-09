import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from 'src/entities/budget.entity';
import { CreateBudgetDto } from './DTOs/create-budget.dto';
import { TransactionLogService } from 'src/transaction-log/transaction-log.service';
import { TRANSACTION_DIRECTIONS } from 'src/shared/constants/transaction-log-dirction';
import { mapTransactionLogPayload } from 'src/shared/transactionLog/mapTransactionLogPayload';
import { RabbitMQService } from 'src/shared/rabbitmq/rabbitmq.service';

@Injectable()
export class BudgetService {
  private transactionId: string;

  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
    private readonly transactionLogService: TransactionLogService,
    private readonly rmqService: RabbitMQService,
  ) {}

  async handleBudgetCreated(budgetData: CreateBudgetDto) {
    try {
      for (const item of budgetData.budgetList) {
        const existingBudget = await this.budgetRepository.findOne({
          where: {
            ExternalId: item.ExternalId,
          },
        });
        if (existingBudget) {
          if (item.ExternalId) {
            await this.handleBudgetUpdated(item);
          }
        } else {
          const newBudget = await this.budgetRepository.create({
            ...item,
            ModifiedDateTime: new Date().toISOString(),
          });
          await this.budgetRepository.save(newBudget);
        }
      }
      const transactionLogData = mapTransactionLogPayload({
        name: budgetData.TransactionId,
        success: true,
        logType: 'Budget',
        direction: TRANSACTION_DIRECTIONS.CENTRIS_INBOUND,
      });
      await this.rmqService.emit(`vault_budget`, budgetData);
      return await this.transactionLogService.create(transactionLogData);
    } catch (error) {
      const transactionLogData = mapTransactionLogPayload({
        name: budgetData.TransactionId,
        success: false,
        errorMessage: error.message,
        logType: 'Budget',
        direction: TRANSACTION_DIRECTIONS.CENTRIS_INBOUND,
      });
      const res = await this.transactionLogService.create(transactionLogData);
      return {
        isError: true,
        statusCode: 400,
        message: error.message,
        Id: res.Id,
      };
    }
  }

  async handleBudgetUpdated(budgetData) {
    try {
      const existingBudget = await this.budgetRepository.findOne({
        where: {
          ExternalId: budgetData.ExternalId,
        },
      });
      if (!existingBudget) throw new BadRequestException('not found budget');

      if (existingBudget.ExternalId) {
        await this.budgetRepository.update(
          { Id: existingBudget.Id },
          budgetData,
        );
      }
      return this.budgetRepository.findOneBy({
        Id: existingBudget.Id,
      });
    } catch (error) {
      console.log('🚀 ~ BudgetService ~ handleBudgetUpdated ~ error:', error);
      return new BadRequestException(error.message);
    }
  }
}
