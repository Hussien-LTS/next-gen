import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class EventAttendeeIdDto {
  @ApiProperty({
    name: 'vaultEventAttendeeId',
    description: 'vault Event Attendee Id',
    type: String,
    example: 'V7MZ025E826MY8F',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  vaultEventAttendeeId: string;
}
