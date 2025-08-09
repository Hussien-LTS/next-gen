import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class EventSpeakerIdDto {
  @ApiProperty({
    name: 'vaultEventSpeakerId',
    description: 'vault Event Speaker Id',
    type: String,
    example: 'V83Z025E827ZEDJ',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  vaultEventSpeakerId: string;
}
