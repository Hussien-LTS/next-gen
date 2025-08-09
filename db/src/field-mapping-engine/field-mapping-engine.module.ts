import { Module } from '@nestjs/common';
import { FieldMappingEngineService } from './field-mapping-engine.service';
import { ExpansionRuleModule } from 'src/expansion-rule/expansion-rule.module';

@Module({
  imports: [ExpansionRuleModule],
  providers: [FieldMappingEngineService],
  exports: [FieldMappingEngineService],
})
export class FieldMappingEngineModule {}
