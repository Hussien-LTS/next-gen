import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionLog } from 'src/entities/transaction_log.entity';

interface ErrorObject {
  message: string;
  code?: string;
}

@Injectable()
export class SalesforceUserService {
  private readonly logger = new Logger(SalesforceUserService.name);

  constructor(
    @InjectRepository(TransactionLog)
    private transactionLogRepository: Repository<TransactionLog>,
  ) {}

  async getUserTransactionLog(transactionId: string): Promise<any> {
    try {
      this.logger.log('the getUserTransactionLog service has started');

      const transaction = await this.transactionLogRepository.findOneBy({
        Id: transactionId,
      });

      this.logger.log('the getUserTransactionLog service has ended');
      return transaction;
    } catch (err) {
      const error = err as ErrorObject;

      this.logger.error(
        'the getUserTransactionLog service has error',
        error.message,
      );

      const errMsg = error.message.toLowerCase();

      if (errMsg.includes('invalid guid')) {
        return {
          isError: true,
          message: 'invalid inbound transaction id',
        };
      }

      return {
        isError: true,
        message: error.message,
      };
    }
  }

  async createUserTransactionLog(data: Record<string, unknown>): Promise<any> {
    try {
      this.logger.log('the createUserTransactionLog service has started');

      const transactionLogData = data?.userTerritoryTransactionLog as Record<
        string,
        unknown
      >;

      const transaction = await this.transactionLogRepository.insert({
        ...transactionLogData,
        ProcessCompletionTime: new Date().toISOString(),
      });

      this.logger.log('the createUserTransactionLog service has ended');
      return transaction;
    } catch (err) {
      const error = err as ErrorObject;

      this.logger.error(
        'the getUserTransactionLog service has error',
        error.message,
      );

      return {
        isError: true,
        message: error.message,
      };
    }
  }
}
