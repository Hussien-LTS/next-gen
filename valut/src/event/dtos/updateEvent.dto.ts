import { ApiProperty } from '@nestjs/swagger';

export class UpdateEventDto {
  @ApiProperty({ description: 'fieldName' })
  fieldName: string;

  @ApiProperty({ description: 'value' })
  value: string;
}

export class EventIdDto {
  @ApiProperty()
  eventId: string;
}
