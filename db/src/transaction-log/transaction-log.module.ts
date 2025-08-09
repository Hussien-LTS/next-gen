import { Module } from '@nestjs/common';
import { TransactionLogService } from './transaction-log.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionLog } from 'src/entities/transaction_log.entity';
import { TransactionLogController } from './transaction-log.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionLog])],
  providers: [TransactionLogService],
  exports: [TransactionLogService],
  controllers: [TransactionLogController],
})
export class TransactionLogModule {}
