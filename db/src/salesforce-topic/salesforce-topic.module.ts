import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesforceTopicController } from './salesforce-topic.controller';
import { SalesforceTopicService } from './salesforce-topic.service';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';
import { FieldMappingEngineModule } from 'src/field-mapping-engine/field-mapping-engine.module';
import { Topic } from 'src/entities/topic.entity';
import { ExpansionRuleModule } from 'src/expansion-rule/expansion-rule.module';
import { TransactionLogModule } from 'src/transaction-log/transaction-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ Topic]),
    RabbitMQModule.register('datasource_topic_queue'),
    FieldMappingEngineModule,
    ExpansionRuleModule,
    TransactionLogModule
  ],
  providers: [SalesforceTopicService],
  exports: [SalesforceTopicService],
  controllers: [SalesforceTopicController],
})
export class SalesforceTopicModule {}
