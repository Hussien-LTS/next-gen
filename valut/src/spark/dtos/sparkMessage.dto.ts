import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsISO8601,
  ValidateNested,
  IsArray,
  ArrayNotEmpty,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class MessageAttributesDto {
  @ApiProperty({
    description: 'Event type triggered in Vault',
    example: 'VAULT_EVENT_UPDATE',
  })
  @IsString()
  @IsNotEmpty()
  event: string;

  @ApiProperty({
    description: 'Type of the object involved',
    example: 'EVENT',
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: 'Name of the Vault object affected by the event',
    example: 'em_event__v',
  })
  @IsString()
  @IsNotEmpty()
  object: string;
}

export class MessageDto {
  @ApiProperty({ type: MessageAttributesDto, required: true })
  @ValidateNested()
  @Type(() => MessageAttributesDto)
  @IsNotEmpty()
  attributes: MessageAttributesDto;

  @ApiProperty({
    description: 'List of affected Vault items in VaultID|ExternalID format',
    type: [String],
    required: true,
    example: [
      'V7RZ08LKW9RGGA1|a121N00000mK4FbQAK',
      'V7RZ08LKW9RGLLP|a121N00000mK4FbQAC',
    ],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  items: string[];
}

export class SparkMessageDto {
  @ApiProperty({
    description: 'Host name of the Vault system',
    example: 'sb-novo-migrator-na-2025-05-08v1-customization.veevavault.com',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  vault_host_name: string;

  @ApiProperty({
    description: 'Name of the Vault',
    example: 'NNI Vault CRM CUSTOMIZATION Sandbox',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  vault_name: string;

  @ApiProperty({
    description: 'Name of the message queue',
    example: 'ahm_connector_queue__c',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  queue_name: string;

  @ApiProperty({
    description: 'Time when the message entered the queue',
    example: '2025-06-25T02:58:36Z',
  })
  @IsISO8601()
  @IsOptional()
  enter_queue_timestamp: string;

  @ApiProperty({
    description: 'Number of times this message has been attempted to send',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  send_attempt: number;

  @ApiProperty({
    description: 'Unique message identifier',
    example: '70ca9b8e-777c-44ff-bbe5-0a86becf8b9c',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  message_id: string;

  @ApiProperty({
    description: 'Timestamp when the message was sent',
    example: '2025-06-25T02:58:39.410Z',
  })
  @IsISO8601()
  @IsOptional()
  send_message_timestamp: string;

  @ApiProperty({ type: MessageDto, required: true })
  @ValidateNested()
  @Type(() => MessageDto)
  @IsNotEmpty()
  message: MessageDto;
}
