import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsString, IsNotEmpty } from 'class-validator';

export class UpsertUserTerritoriesDto {
  @ApiProperty({
    example: ['VCT000000001001', 'VCT000000001002'],
    description: 'User territory IDs',
    type: [String],
    required: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  userTerritoryId: string[];
}
