import { Module } from '@nestjs/common';
import { SalesforceUserController } from './salesforce-user.controller';
import { SalesforceUserService } from './salesforce-user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionLog } from 'src/entities/transaction_log.entity';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionLog]),
    RabbitMQModule.register('datasource_user_territory_queue'),
  ],
  controllers: [SalesforceUserController],
  providers: [SalesforceUserService],
})
export class SalesforceUserModule {}
