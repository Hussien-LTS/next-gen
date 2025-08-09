import { ApiProperty } from '@nestjs/swagger';

export class QueryVeevaDto {
  @ApiProperty({ example: 'V7RZ025E825Z5M0' })
  eventId: string;
}
