import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

export class ExpansionListDto {
  @ApiProperty({ example: 'Catering_Notes__c' })
  @IsString()
  outBoundField: string;

  @ApiProperty({
    example: null,
    type: String,
    nullable: true,
  })
  @IsOptional()
  actualValue?: string | null;
}

export class ExpansionListWrapperDto {
  @ApiProperty({ type: [ExpansionListDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpansionListDto)
  expansionList: ExpansionListDto[];
}