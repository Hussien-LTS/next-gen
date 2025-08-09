import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VenueController } from './salesforce-venue.controller';
import { VenueService } from './salesforce-venue.service';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';
import { Venue } from 'src/entities/venue.entity';
import { FieldMappingEngineModule } from 'src/field-mapping-engine/field-mapping-engine.module';
import { ExpansionRuleModule } from 'src/expansion-rule/expansion-rule.module';
import { TransactionLogModule } from 'src/transaction-log/transaction-log.module';

@Module({
  imports: [
    RabbitMQModule.register('datasource_venue_queue'),
    TypeOrmModule.forFeature([Venue]),
    FieldMappingEngineModule,
    ExpansionRuleModule,
    TransactionLogModule
  ],
  providers: [VenueService],
  exports: [VenueService],
  controllers: [VenueController],
})
export class VenueModule {}
