import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsOptional,
  IsString,
  IsNotEmpty,
  ValidateIf,
  ValidateNested,
} from "class-validator";

export class AttendeeInfoValidationDTO {
  @ApiProperty({ example: "85be1254-0007-466c-8024-4d8c5087500b" })
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @ApiProperty({ example: "2023-11-13" })
  @IsString()
  @IsNotEmpty()
  startdate: string;

  @ApiProperty({ example: "2023-11-13" })
  @IsString()
  @IsNotEmpty()
  enddate: string;

  @ApiProperty({ example: "US" })
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiProperty({ example: ["HCP19071908"] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  hcpId: string[];

  @ApiProperty({ example: ["V7MZ025E826N09W"] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  EventAttendeeId: string[];

  @ApiProperty({ example: "active__v" })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({ example: "Event_Attendee" })
  @IsString()
  @IsNotEmpty()
  InterationType: string; // Note: intentionally keeping typo as per source JSON

  @ApiProperty({ nullable: true, example: null })
  @ValidateIf((obj) => obj.InteractionId !== null)
  @IsString()
  @IsNotEmpty()
  InteractionId: string | null;

  @ApiProperty({ example: "V7QZ025E82I9CN8" })
  @IsString()
  @IsNotEmpty()
  topic: string;

  @ApiProperty({ example: "true" })
  @IsString()
  @IsNotEmpty()
  getData: string;

  @ApiProperty({ example: "Attendee" })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({ example: null })
  @IsOptional()
  @IsString()
  Durationtype?: string;

  @ApiProperty({ example: null })
  @IsOptional()
  @IsString()
  TravelType?: string;

  @ApiProperty({ example: null })
  @IsOptional()
  @IsString()
  SpendType?: string;

  @ApiProperty({
    description: "Transaction name",
    example: "008a0628-f011-4caf-9369-c23ded0ba8de",
  })
  @IsNotEmpty()
  @IsString()
  transactionName: string;

  @ApiProperty({ example: "14" })
  @IsString()
  @IsNotEmpty()
  AWSHcpEligibilityId: string;
}

export class AttendeeValidationDTO {
  @ApiProperty({ type: AttendeeInfoValidationDTO })
  @ValidateNested()
  @Type(() => AttendeeInfoValidationDTO)
  speakerinformation: AttendeeInfoValidationDTO;
}
