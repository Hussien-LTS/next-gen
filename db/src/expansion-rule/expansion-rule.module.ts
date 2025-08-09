import { Module } from '@nestjs/common';
import { ExpansionRuleController } from './expansion-rule.controller';
import { ExpansionRuleService } from './expansion-rule.service';
import { ExpansionRule } from 'src/entities/expansion-rule.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';
import { ConfigurableApiModule } from 'src/configurable-API/configurable-API.module';
import { config } from 'process';
import { ConfigurableApi } from 'src/entities/configurable-API.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExpansionRule, ConfigurableApi]),
    RabbitMQModule.register('datasource_expansion_rule_queue'),
    ConfigurableApiModule
  ],
  controllers: [ExpansionRuleController],
  providers: [ExpansionRuleService],
  exports: [ExpansionRuleService],

})
export class ExpansionRuleModule {}
