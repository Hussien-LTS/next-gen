import { ApiProperty } from "@nestjs/swagger";
import { IsArray, ArrayNotEmpty, IsString, IsNotEmpty } from "class-validator";
import { Type } from "class-transformer";

export class LitsAttendeeInfoDto {
  @ApiProperty({
    example: ["989381", "624385", "135303"],
    description: "vObject Account external ids",
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => String)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  ExternalId: string[];
}
