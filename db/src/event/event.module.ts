import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from 'src/entities/event.entity';
import { FieldMappingEngineModule } from 'src/field-mapping-engine/field-mapping-engine.module';
import { ExpansionRuleModule } from 'src/expansion-rule/expansion-rule.module';
import { Estimate } from 'src/entities/estimate.entity';
import { EventBudget } from 'src/entities/event_pudget.entity';
import { Participant } from 'src/entities/participant.entity';
import { User } from 'src/entities/user.entity';
import { ExpansionRule } from 'src/entities/expansion-rule.entity';
import { TransactionLogModule } from 'src/transaction-log/transaction-log.module';
@Module({
  imports: [
    RabbitMQModule.register('datasource_event_queue'),
    TypeOrmModule.forFeature([
      Event,
      Estimate,
      EventBudget,
      Participant,
      User,
      ExpansionRule,
    ]),
    FieldMappingEngineModule,
    ExpansionRuleModule,
    TransactionLogModule,
  ],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
