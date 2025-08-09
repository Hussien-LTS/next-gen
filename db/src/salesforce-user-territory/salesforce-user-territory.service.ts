import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionLog } from 'src/entities/transaction_log.entity';

interface ErrorObject {
  message: string;
  code?: string;
}

@Injectable()
export class SalesforceUserTerritoryService {
  private readonly logger = new Logger(SalesforceUserTerritoryService.name);

  constructor(
    @InjectRepository(TransactionLog)
    private transactionLogRepository: Repository<TransactionLog>,
  ) {}

  async getUserTerritoryTransactionById(transactionId: string): Promise<any> {
    this.logger.log('the getUserTerritoryTransactionById service has started');

    try {
      const transaction = await this.transactionLogRepository.findOneBy({
        Id: transactionId,
      });

      this.logger.log('the getUserTerritoryTransactionById service has ended');
      return transaction;
    } catch (err) {
      const error = err as ErrorObject;

      this.logger.error(
        'the upsertUserTerritories service has error',
        error.message,
      );

      // Handle foreign key constraint violations
      if (error.message.includes('Invalid GUID')) {
        return {
          isError: true,
          message: 'invalid inbound transaction id',
        };
      }
      throw new BadRequestException(error.message);
    }
  }

  async createUserTerritoryTransaction(
    data: Record<string, unknown>,
  ): Promise<void> {
    this.logger.log('the createUserTerritoryTransaction service has started');

    const transactionLogData = data?.userTerritoryTransactionLog as Record<
      string,
      unknown
    >;

    await this.transactionLogRepository.insert({
      ...transactionLogData,
      ProcessCompletionTime: new Date().toISOString(),
    });

    this.logger.log('the createUserTerritoryTransaction service has ended');
  }
}
