import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from "class-validator";

class TopicListDto {
  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    description: "Unique identifier for the topic",
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/\S/, { message: "TopicID must not be empty or whitespace" })
  TopicID: string;

  @ApiProperty({
    example: "Quarterly planning meeting",
    description: "Detailed description of the topic",
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/\S/, {
    message: "TopicDescription must not be empty or whitespace",
  })
  TopicDescription?: string;

  @ApiProperty({
    example: "EXT-TOPIC-789",
    description: "External system identifier for the topic",
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/\S/, { message: "ExternalId must not be empty or whitespace" })
  ExternalId?: string;

  @ApiProperty({
    example: "approved__v",
    description: "Status for the topic",
    enum: ["approved__v", "expired__v", "staged__v"],
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(["approved__v", "expired__v", "staged__v"])
  Status: string;

  @IsOptional()
  expansionList: [];
}

export class SalesforceTopicDto {
  @ApiProperty({
    example: "TX-001",
    description: "Unique ID for the transaction",
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/\S/, { message: "TransactionId must not be empty or whitespace" })
  TransactionId: string;

  @ApiProperty({ type: [TopicListDto], description: "List of topic records" })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TopicListDto)
  TopicList: TopicListDto[];
}
