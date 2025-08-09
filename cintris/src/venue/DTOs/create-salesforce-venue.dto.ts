import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
  IsArray,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class ExpansionDto {
  @ApiProperty({ example: "ahm__Venue_Preferance__c" })
  @IsString()
  outBoundField: string;

  @ApiProperty({ example: null })
  @IsOptional()
  actualValue: any;
}
export class VenueDto {
  @ApiProperty({ example: "QA Test Location Nov 21" })
  @IsString()
  @IsNotEmpty()
  VenueName: string;

  @ApiProperty({ example: "Eligible" })
  @IsString()
  @IsNotEmpty()
  Status: string;

  @ApiProperty({ example: "North Dakota" })
  @IsString()
  @IsNotEmpty()
  State: string;

  @ApiProperty({ example: "58703" })
  @IsString()
  @IsNotEmpty()
  PostalCode: string;

  @ApiProperty({ example: "1234x" })
  @IsString()
  @IsNotEmpty()
  ExternalId?: string;

  @ApiProperty({ example: "Minot" })
  @IsString()
  @IsNotEmpty()
  City: string;

  @ApiProperty({ example: "10 North Main Street" })
  @IsString()
  @IsNotEmpty()
  AddressLine1: string;

  @ApiProperty({ example: "Suite 500" })
  @IsString()
  @IsNotEmpty()
  AddressLine2: string;

  @IsOptional()
  @ApiProperty({
    example: [
      {
        outBoundField: "ahm__Venue_Preferance__c",
        actualValue: null,
      },
      {
        outBoundField: "ahm__Venue_Tier__c",
        actualValue: null,
      },
    ],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ExpansionDto)
  expansionList: ExpansionDto[];
}

export class CreateVenueTransactionDto {
  @ApiProperty({ type: [VenueDto] })
  @ValidateNested({ each: true })
  @IsNotEmpty()
  @Type(() => VenueDto)
  VenueList: VenueDto[];

  @ApiProperty({ example: "a3Gf4000000TVhOEAW" })
  @IsString()
  @IsNotEmpty()
  TransactionId: string;
}
