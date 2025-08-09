import { Module } from '@nestjs/common';
import { TransactionAttachController } from './transaction-attach.controller';
import { TransactionAttachService } from './transaction-attach.service';

@Module({
  controllers: [TransactionAttachController],
  providers: [TransactionAttachService]
})
export class TransactionAttachModule {}
