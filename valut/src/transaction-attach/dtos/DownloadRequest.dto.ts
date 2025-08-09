import { ApiProperty } from '@nestjs/swagger';

export class DownloadRequestDto {
  @ApiProperty({ description: 'Vault vObject' })
  objectId: string;

  @ApiProperty({ description: 'Vault attach Id' })
  attachmentId: string;

  @ApiProperty({ description: 'attach version' })
  version: string;
}
