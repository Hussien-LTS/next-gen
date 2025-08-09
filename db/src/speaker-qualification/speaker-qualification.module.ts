import { Module } from '@nestjs/common';
import { SpeakerQualificationController } from './speaker-qualification.controller';
import { SpeakerQualificationService } from './speaker-qualification.service';
import { ExpansionRuleModule } from 'src/expansion-rule/expansion-rule.module';
import { FieldMappingEngineModule } from 'src/field-mapping-engine/field-mapping-engine.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionLog } from 'src/entities/transaction_log.entity';
import { SpeakerQualification } from 'src/entities/speaker_qualification.entity';
import { Contract } from 'src/entities/contract.entity';
import { Topic } from 'src/entities/topic.entity';
import { Training } from 'src/entities/training.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TransactionLog,
      SpeakerQualification,
      Contract,
      Topic,
      Training,
    ]),
    FieldMappingEngineModule,
    ExpansionRuleModule,
  ],
  controllers: [SpeakerQualificationController],
  providers: [SpeakerQualificationService],
})
export class SpeakerQualificationModule {}
