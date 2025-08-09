import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { TransactionLogService } from './transaction-log.service';
import { TransactionLog } from 'src/entities/transaction_log.entity';

@Controller('transaction-log')
export class TransactionLogController {
  constructor(private readonly transactionLogService: TransactionLogService) {}

  @EventPattern('transaction-log')
  async handleTransactionLog(@Payload() data: any, @Ctx() context: RmqContext) {
    return await this.processTransactionLog(data, context, 'transaction-log');
  }

  @EventPattern('user-transaction-log')
  async handleUserTransactionLog(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    return this.processTransactionLog(data, context, 'user-transaction-log');
  }

  @EventPattern('salesforce-territory-response')
  async handleSalesforceTransactionLog(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    return this.processTransactionLog(
      data,
      context,
      'salesforce-territory-response',
    );
  }

  private async processTransactionLog(
    data: any,
    context: RmqContext,
    source: string,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    console.log(`[${source}] Received data:`, data);

    if (!data) {
      channel.nack(originalMsg, false, false);
      throw new Error('Data missing in payload');
    }

    try {
      const result = await this.transactionLogService.create(data);
      channel.ack(originalMsg);
      return { status: 'Processed successfully', data: result };
    } catch (error) {
      console.error(`[${source}] Processing failed:`, error.message);
      channel.nack(originalMsg, false, false);
      throw error;
    }
  }

  @EventPattern('get-transaction-log-UI')
  async getFilteredLogs(filterDto: any) {
    return this.transactionLogService.handleFilterLogs(filterDto);
  }

  @EventPattern('get-transaction-log-by-id-UI')
  async handleFindById(@Payload() id: string): Promise<TransactionLog | null> {
    return await this.transactionLogService.findById(id);
  }
}
