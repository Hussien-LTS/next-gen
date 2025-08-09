import {
  IsOptional,
  IsString,
  IsArray,
  IsBoolean,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TrainingDetail {
  @ApiPropertyOptional({ example: 'Compliance' })
  @IsOptional()
  @IsString()
  Type?: string;

  @ApiPropertyOptional({ example: 'Compliance' })
  @IsOptional()
  @IsString()
  TopicName?: string;

  @ApiPropertyOptional({ example: 'a0mf4000001SlbcAAC' })
  @IsOptional()
  @IsString()
  Id?: string;

  @ApiPropertyOptional({ example: '2018-12-31' })
  @IsOptional()
  @IsString()
  ExpirationDate?: string;

  @ApiPropertyOptional({ example: '2018-01-01' })
  @IsOptional()
  @IsString()
  EffectiveDate?: string;
}

export class ContractFee {
  @ApiPropertyOptional({ example: 'No Travel' })
  @IsOptional()
  @IsString()
  TravelCategory?: string;

  @ApiPropertyOptional({ example: 0.0 })
  @IsOptional()
  @IsNumber()
  TravelAmount?: number;

  @ApiPropertyOptional({ example: 'Honoraria' })
  @IsOptional()
  @IsString()
  SpendType?: string;

  @ApiPropertyOptional({ example: 'Attendee' })
  @IsOptional()
  @IsString()
  ParticipantRole?: string;

  @ApiPropertyOptional({ example: 0.0 })
  @IsOptional()
  @IsNumber()
  OverriddenTravelAmount?: number;

  @ApiPropertyOptional({ example: 1000.0 })
  @IsOptional()
  @IsNumber()
  OverriddenHonoraria?: number;

  @ApiPropertyOptional({ example: 1000.0 })
  @IsOptional()
  @IsNumber()
  Honoraria?: number;

  @ApiPropertyOptional({ example: 'Full day' })
  @IsOptional()
  @IsString()
  DurationType?: string;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  CurrencyISOCode?: string;
}

export class ContractDetail {
  @ApiPropertyOptional({ example: 'Segment 10' })
  @IsOptional()
  @IsString()
  Classification?: string;

  @ApiPropertyOptional({ example: '2017-07-20 00:00:00' })
  @IsOptional()
  @IsString()
  EffectiveDate?: string;

  @ApiPropertyOptional({ example: '2023-07-20 00:00:00' })
  @IsOptional()
  @IsString()
  ExpirationDate?: string;

  @ApiPropertyOptional({ example: 'a0mf4000001SlbcAAC' })
  @IsOptional()
  @IsString()
  Id?: string;

  @ApiPropertyOptional({ example: '2017-07-Contract-Aileen Abesamis-HC-04290' })
  @IsOptional()
  @IsString()
  Name?: string;

  @ApiPropertyOptional({ example: 'Accepted' })
  @IsOptional()
  @IsString()
  Status?: string;

  @ApiPropertyOptional({ example: 'Tier1' })
  @IsOptional()
  @IsString()
  Tier?: string;

  @ApiPropertyOptional({ example: 'MSA - Master Attendee Agreement' })
  @IsOptional()
  @IsString()
  Type?: string;
}

export class CapDetail {
  @ApiPropertyOptional({ example: 'Corporate Cap' })
  @IsOptional()
  @IsString()
  CapRuleName?: string;

  @ApiPropertyOptional({ example: 1000.0 })
  @IsOptional()
  @IsNumber()
  availableSpend?: number;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsNumber()
  availableCount?: number;
}

export class SpDetail {
  @ApiPropertyOptional({ type: [TrainingDetail] })
  @IsOptional()
  @IsArray()
  trainingDetails?: TrainingDetail[];

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  success?: boolean;

  @ApiPropertyOptional({ example: 'HCP56305' })
  @IsOptional()
  @IsString()
  HCPId?: string;

  @ApiPropertyOptional({ example: 'a2t5C0000008ombQAA' })
  @IsOptional()
  @IsString()
  EventAttendeeId?: string;

  @ApiPropertyOptional({
    type: [String],
    example: [
      'Cap Rule Limit Exceeds:Corporate Cap',
      'Cap Rule Limit Exceeds:Corporate Cap 1',
    ],
  })
  @IsOptional()
  @IsArray()
  errorMessage?: string[];

  @ApiPropertyOptional({ type: ContractFee })
  @IsOptional()
  contractFee?: ContractFee;

  @ApiPropertyOptional({ type: [ContractDetail] })
  @IsOptional()
  @IsArray()
  contractDetails?: ContractDetail[];

  @ApiPropertyOptional({ type: [CapDetail] })
  @IsOptional()
  @IsArray()
  capDetails?: CapDetail[];
}

export class SyncAttendeeDto {
  @ApiProperty({ example: 'V7MZ025E826MY8F' })
  @IsNotEmpty()
  @IsString()
  eventAttendeeId: string;

  @ApiProperty({ example: 'V7RZ025E82GA4U8' })
  @IsNotEmpty()
  @IsString()
  eventId: string;

  @ApiProperty({ example: 'dd83dc20-57c6-442a-8ad4-230775b0dbd9' })
  @IsString()
  @IsNotEmpty()
  transactionName?: string;

  @ApiProperty({ example: 'Processed' })
  @IsString()
  Status: string;

  @ApiProperty({
    type: [String],
    example: [
      'Cap Rule Limit Exceeds:Corporate Cap',
      'Cap Rule Limit Exceeds:Corporate Cap 1',
    ],
  })
  @IsArray()
  reason: string[];

  @ApiPropertyOptional({
    type: [SpDetail],
    example: [
      {
        transactionName: 'dd83dc20-57c6-442a-8ad4-230775b0dbd9',
        trainingDetails: [
          {
            Type: 'Compliance',
            TopicName: 'Compliance',
            Id: 'a0mf4000001SlbcAAC',
            ExpirationDate: '2018-12-31',
            EffectiveDate: '2018-01-01',
          },
        ],
        success: false,
        HCPId: 'HCP56305',
        EventAttendeeId: 'a2t5C0000008ombQAA',
        errorMessage: [
          'Cap Rule Limit Exceeds:Corporate Cap',
          'Cap Rule Limit Exceeds:Corporate Cap 1',
        ],
        contractFee: {
          TravelCategory: 'No Travel',
          TravelAmount: 0.0,
          SpendType: 'Honoraria',
          ParticipantRole: 'Attendee',
          OverriddenTravelAmount: 0.0,
          OverriddenHonoraria: 1000.0,
          Honoraria: 1000.0,
          DurationType: 'Full day',
          CurrencyISOCode: 'USD',
        },
        contractDetails: [
          {
            Classification: 'Segment 10',
            EffectiveDate: '2017-07-20 00:00:00',
            ExpirationDate: '2023-07-20 00:00:00',
            Id: 'a0mf4000001SlbcAAC',
            Name: '2017-07-Contract-Aileen Abesamis-HC-04290',
            Status: 'Accepted',
            Tier: 'Tier1',
            Type: 'MSA - Master Attendee Agreement',
          },
        ],
        capDetails: [
          {
            CapRuleName: 'Corporate Cap',
            availableSpend: 1000.0,
            availableCount: null,
          },
        ],
      },
    ],
  })
  @IsOptional()
  @IsArray()
  spDetails?: SpDetail[];
}
