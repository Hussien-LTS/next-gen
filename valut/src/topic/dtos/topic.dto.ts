import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
export class VeevaTopicDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  Id: string;

  @ApiProperty({
    example: '2025-07-10T17:17:47.851Z',
    required: false,
  })
  @IsOptional()
  @IsString()
  ModifiedDateTime?: string;

  @ApiProperty({
    example: 'EXT-TOPIC-789',
    required: false,
  })
  @IsOptional()
  @IsString()
  ExternalId?: string;

  @ApiProperty({
    example: 'Quarterly planning meeting',
    required: false,
  })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiProperty({
    example: 'approved__v',
    description: 'Status for the topic',
    required: false,
  })
  @IsOptional()
  @IsString()
  Status?: string;

  [key: string]: any;
}

class ExpansionItemDto {
  @ApiProperty({
    description: 'Field name in the outbound system',
    example: 'ahm__min_hcp_speakers_reqd_vpro__c',
  })
  @IsNotEmpty()
  @IsString()
  outBoundField: string;

  @ApiProperty({
    description: 'Actual value of the expansion field',
    example: 78,
  })
  @IsNotEmpty()
  @IsNumber()
  actualValue: number;
}

class TopicListDto {
  @ApiProperty({
    description: 'Unique ID for the topic',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  TopicID: string;

  @ApiProperty({
    description: 'Description of the topic',
    example: 'Quarterly planning meeting',
  })
  @IsNotEmpty()
  @IsString()
  TopicDescription: string;

  @ApiProperty({
    description: 'External reference ID',
    example: 'EXT-TOPIC-789654',
  })
  @IsNotEmpty()
  @IsString()
  ExternalId: string;

  @ApiProperty({
    example: 'approved__v',
    description: 'Status for the topic',
    required: false,
  })
  @IsOptional()
  @IsString()
  Status?: string;

  @ApiProperty({
    description: 'List of optional expansion fields',
    type: [ExpansionItemDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpansionItemDto)
  expansionList: Record<string, any>;
}

export class TopicListRequestDto {
  @ApiProperty({
    description: 'AWS Transaction ID for this process',
    example: 'a3Gf4000000TW3xEAG',
  })
  @IsNotEmpty()
  @IsString()
  TransactionId: string;

  @ApiProperty({
    description: 'Array of topic entries',
    type: [TopicListDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TopicListDto)
  TopicList: TopicListDto[];
}
