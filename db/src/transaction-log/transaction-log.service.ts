import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionLog } from '../entities/transaction_log.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TransactionLogService {
  private readonly logger = new Logger(TransactionLogService.name);
  constructor(
    @InjectRepository(TransactionLog)
    private readonly transactionLogRepo: Repository<TransactionLog>,
  ) {}

  async create(data: any): Promise<any> {
    console.log('🚀 ~ TransactionLogService ~ create ~ data:', data);
    try {
      return await this.transactionLogRepo.save(data);
    } catch (error) {
      console.log('🚀 ~ TransactionLogService ~ create ~ error:', error);
      throw new Error(`Failed to log transaction: ${error.message}`);
    }
  }
  async handleFilterLogs(filterDto: any) {
    try {
      const {
        logType,
        direction,
        success,
        page = 1,
        limit = 20,
        sortBy,
        order = 'ASC',
      } = filterDto;

      const query = this.transactionLogRepo.createQueryBuilder('log');

      if (logType) {
        query.andWhere('CAST(log.LogType AS NVARCHAR(MAX)) = :logType', {
          logType,
        });
      }

      if (direction) {
        query.andWhere('CAST(log.Direction AS NVARCHAR(MAX)) = :direction', {
          direction,
        });
      }

      if (success !== undefined) {
        query.andWhere('CAST(log.Success AS NVARCHAR(MAX)) = :success', {
          success,
        });
      }

      const sortableColumns = [
        'Id',
        'Name',
        'ModifiedDateTime',
        'LogType',
        'Direction',
        'Success',
      ];

      if (sortBy && sortableColumns.includes(sortBy)) {
        query.orderBy(
          `CAST(log.${sortBy} AS NVARCHAR(MAX))`,
          order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
        );
      }

      query.skip((page - 1) * limit).take(limit);

      const [items, total] = await query.getManyAndCount();

      return {
        items,
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new Error(`Failed to Get Transaction log(s): ${error.message}`);
    }
  }

  async findById(id: string): Promise<TransactionLog> {
    try {
      const log = await this.transactionLogRepo.findOne({ where: { Id: id } });

      if (!log) {
        throw new NotFoundException(`Transaction log with ID ${id} not found`);
      }

      return log;
    } catch (error) {
      throw new Error(
        `Transaction log with ID ${id} not found: ${error.message}`,
      );
    }
  }
}
