import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class EventIdDto {
  @ApiProperty({
    name: 'eventId',
    description: 'eventId',
    type: String,
    example: 'V7RZ025E829JJP2',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  eventId: string;
}

export interface SubmissionStatusDto {
  id: string;
  ineligible_at_time_of_submission__c: boolean;
}
