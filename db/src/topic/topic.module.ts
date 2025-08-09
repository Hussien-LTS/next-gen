import { Module } from '@nestjs/common';
import { TopicController } from './topic.controller';
import { TopicService } from './topic.service';
import { FieldMappingEngineModule } from 'src/field-mapping-engine/field-mapping-engine.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topic } from 'src/entities/topic.entity';
import { ExpansionRuleModule } from 'src/expansion-rule/expansion-rule.module';

@Module({
  imports: [
    FieldMappingEngineModule,
    ExpansionRuleModule,
    TypeOrmModule.forFeature([Topic]),
  ],
  controllers: [TopicController],
  providers: [TopicService],
})
export class TopicModule {}
