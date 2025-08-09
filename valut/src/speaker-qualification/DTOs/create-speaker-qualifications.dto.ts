import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ExpansionDto {
  @ApiProperty({
    example: 'ahm__Training_Name__c',
    description: 'Outbound field name',
  })
  @IsString()
  @IsNotEmpty()
  outBoundField: string;

  @ApiProperty({
    example: 'ABCD',
    description: 'Actual value for the field',
  })
  @IsNotEmpty()
  actualValue: any;
}

export class TrainingDto {
  @ApiProperty({
    example: 'a0Kf40000000TJJEB3',
    description: 'Master ID of the training',
  })
  @IsString()
  @IsNotEmpty()
  MasterId: string;

  @ApiProperty({
    example: 'Test Product ABC Topic',
    description: 'Name of the training',
  })
  @IsOptional()
  @IsString()
  TrainingName?: string;

  @ApiProperty({
    example: '2025-07-15',
    description: 'Start date of the training',
  })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiProperty({
    example: '2025-12-28',
    description: 'End date of the training',
  })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiProperty({
    example: 'TP-102',
    description: 'Id of the topic',
  })
  @IsString()
  @IsNotEmpty()
  TopicID: string;

  @ApiProperty({
    example: 'Event_Topic',
    description: 'Topic type',
  })
  @IsOptional()
  @IsString()
  TopicType?: string;

  @ApiProperty({
    example: 'Test Product ABC Topic',
    description: 'Description of the topic',
  })
  @IsOptional()
  @IsString()
  TopicDescription?: string;

  @ApiProperty({
    example: 'approved__v',
    description: 'Status of the topic',
  })
  @IsOptional()
  @IsString()
  TopicStatus?: string;

  @ApiProperty({
    example: 'T5-1236',
    description: 'Name or code of the topic',
  })
  @IsOptional()
  @IsString()
  TopicName?: string;

  @ApiProperty({
    type: [ExpansionDto],
    description: 'List of expansion field mappings',
    example: [
      { outBoundField: 'LinkSys', actualValue: 'product system' },
      {
        outBoundField: 'MobileLastModifiedDatetime',
        actualValue: '2025-08-03T12:55:55.000Z',
      },
    ],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ExpansionDto)
  expansionList?: ExpansionDto[];
}

export class ContractDto {
  @ApiProperty({
    example: 'active__v',
    description: 'Status of the contract',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    example: '2017-07-20',
    description: 'Start date of the contract',
  })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiProperty({
    example: 'a0hf4000000MGrpAAG',
    description: 'Master ID of the contract',
  })
  @IsString()
  @IsNotEmpty()
  MasterId: string;

  @ApiProperty({
    example: '2018-07-20',
    description: 'End date of the contract',
  })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiProperty({
    example: 'MSA - Master Speaker Agreement',
    description: 'Type name of the contract',
  })
  @IsOptional()
  @IsString()
  ContractTypeName?: string;

  @ApiProperty({
    example: 'a0Kf40000000TJJEA2',
    description: 'Contract type ID',
  })
  @IsString()
  @IsNotEmpty()
  ContractTypeId: string;

  @ApiProperty({
    example: 'HC-00019',
    description: 'Name of the contract',
  })
  @IsOptional()
  @IsString()
  ContractName?: string;

  @ApiProperty({
    type: [ExpansionDto],
    description: 'List of expansion field mappings',
    example: [
      { outBoundField: 'Rate', actualValue: 3 },
      {
        outBoundField: 'MobileCreatedDatetime',
        actualValue: '2025-08-10T12:55:55.555Z',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpansionDto)
  expansionList?: ExpansionDto[];
}

export class HCPDataDto {
  @ApiProperty({
    type: [TrainingDto],
    description: 'List of training records',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrainingDto)
  trainingList?: TrainingDto[];

  @ApiProperty({
    example: 'eligible__v',
    description: 'Speaker status',
  })
  @IsOptional()
  @IsString()
  SpeakerStatus?: string;

  @ApiProperty({
    example: 'eligible__v',
    description: 'Next year speaker status',
  })
  @IsOptional()
  @IsString()
  NextYearStatus?: string;

  @ApiProperty({
    example: 'Hickman',
    description: 'Speaker last name',
  })
  @IsOptional()
  @IsString()
  SpeakerLName?: string;

  @ApiProperty({
    example: 'HCP99334',
    description: 'Speaker ID',
  })
  @IsString()
  @IsNotEmpty()
  SpeakerId: string;

  @ApiProperty({
    example: 'Stanley',
    description: 'Speaker first name',
  })
  @IsOptional()
  @IsString()
  SpeakerFName?: string;

  @ApiProperty({
    example: '506 South Rocky Milton Way, Denver, Colorado United States 84515',
    description: 'Speaker address',
  })
  @IsOptional()
  @IsString()
  SpeakerAddr?: string;

  @ApiProperty({
    type: [ExpansionDto],
    description: 'List of expansion field mappings',
    example: [
      { outBoundField: 'LinkSys', actualValue: 'Product system' },
      {
        outBoundField: 'CredentialsVpro',
        actualValue: 'VPRO_HCPD_QWERTY',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpansionDto)
  expansionList?: ExpansionDto[];

  @ApiProperty({
    type: [ContractDto],
    description: 'List of contract records',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContractDto)
  contractList?: ContractDto[];
}

export class CreateSpeakerQualificationsDto {
  @ApiProperty({
    example: 'a3Gf4000000TV0KEAW',
    description: 'Transaction ID',
  })
  @IsOptional()
  @IsString()
  TransactionId?: string;

  @ApiProperty({
    type: [HCPDataDto],
    description: 'List of HCP data records',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HCPDataDto)
  HCPDataList?: HCPDataDto[];
}
