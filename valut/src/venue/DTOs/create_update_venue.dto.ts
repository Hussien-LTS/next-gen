import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ExpansionDto {
  @ApiProperty({ example: 'ahm__Venue_Preferance__c' })
  @IsString()
  outBoundField: string;

  @ApiProperty({ example: null })
  @IsOptional()
  actualValue: any;
}

class Venue {
  @ApiProperty({ example: 'QA Test Location Nov 21' })
  @IsString()
  @IsNotEmpty()
  VenueName: string;

  @ApiProperty({ example: 'active__v' })
  @IsString()
  @IsNotEmpty()
  Status: string;

  @ApiProperty({ example: 'North Dakota' })
  @IsString()
  @IsNotEmpty()
  State: string;

  @ApiProperty({ example: '58703' })
  @IsString()
  @IsNotEmpty()
  PostalCode: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsNotEmpty()
  ExternalId: string;

  @ApiProperty({ example: 'Minot' })
  @IsString()
  @IsNotEmpty()
  City: string;

  @ApiProperty({ example: '10 North Main Street' })
  @IsString()
  @IsNotEmpty()
  AddressLine1: string;

  @ApiProperty({ example: 'Suite 5B' })
  @IsString()
  @IsNotEmpty()
  AddressLine2: string;

  @IsOptional()
  @ApiProperty({
    example: [
      {
        outBoundField: 'ahm__Venue_Preferance__c',
        actualValue: null,
      },
      {
        outBoundField: 'ahm__Venue_Tier__c',
        actualValue: null,
      },
    ],
  })
  expansionList: ExpansionDto[];
}

export class CreateVenueDto {
  @ApiProperty({
    type: [Venue],
    example: [
      {
        VenueName: 'QA Test Location Nov 21',
        Status: 'active__v',
        State: 'North Dakota',
        PostalCode: '58703',
        ExternalId: '12345678',
        City: 'Minot',
        AddressLine1: '10 North Main Street',
        AddressLine2: 'Suite 5B',
        expansionList: [
          {
            outBoundField: 'status_code',
            actualValue: 126,
          },
          {
            outBoundField: 'status_code2',
            actualValue: '12',
          },
        ],
      },
    ],
  })
  @ValidateNested({ each: true })
  @Type(() => Venue)
  VenueList: Venue[];

  @ApiProperty({ example: 'a3Gf4000000TVhOEAW' })
  @IsString()
  @IsNotEmpty()
  TransactionId: string;
}
