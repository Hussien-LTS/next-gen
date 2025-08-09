import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, ValidateNested, IsArray } from "class-validator";
import { Type } from "class-transformer";

class TerDataDto {
  @ApiProperty({ description: "Parent Master ID", example: "T1234" })
  @IsNotEmpty()
  @IsString()
  parentMstrId: string;

  @ApiProperty({ description: "Name", example: "Demoxyz" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: "Master ID", example: "T000" })
  @IsNotEmpty()
  @IsString()
  masterId: string;
}

export class ManageTerritoryDTO {
  @ApiProperty({ description: "Transaction ID", example: "a3s5C0000008vfZQAQ" })
  @IsNotEmpty()
  @IsString()
  transactionId: string;

  @ApiProperty({
    description: "List of TerritoryData objects",
    type: [TerDataDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TerDataDto)
  terDataList: TerDataDto[];

  @ApiProperty({
    description: "Transaction name",
    example: "008a0628-f011-4caf-9369-c23ded0ba8de",
  })
  @IsNotEmpty()
  @IsString()
  transactionName: string;
}
