import { Module } from '@nestjs/common';
import { VenueExpansionListController } from './venue-expansion-list.controller';
import { VenueExpansionListService } from './venue-expansion-list.service';
import { ExpansionRuleModule } from 'src/expansion-rule/expansion-rule.module';
import { FieldMappingEngineModule } from 'src/field-mapping-engine/field-mapping-engine.module';

@Module({
  imports: [ExpansionRuleModule, FieldMappingEngineModule],
  controllers: [VenueExpansionListController],
  providers: [VenueExpansionListService],
})
export class VenueExpansionListModule {}
