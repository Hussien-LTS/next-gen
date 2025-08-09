import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsString,
  IsOptional,
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class UserInfoDto {
  @ApiProperty({
    example: true,
    description: "Status indicating if the user is active",
  })
  @IsBoolean()
  userStatus: boolean;

  @ApiProperty({
    example: "Sales Representative",
    description: "Role of the user in the organization",
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  userRole: string | null;

  @ApiProperty({
    example: "Veeva Essentials Sales Profile",
    description: "User profile type or category",
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  userProfile: string | null;

  @ApiProperty({
    example: "Jones",
    description: "Last name of the user",
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  userLastName: string | null;

  @ApiProperty({
    example: "EMP-999",
    description: "Unique identifier for the user",
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  userIdentifierId: string | null;

  @ApiProperty({
    example: "Amy",
    description: "First name of the user",
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  userFirstName: string | null;

  @ApiProperty({
    example: "CA",
    description: "Home state/province of the user",
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  homeState: string | null;

  @ApiProperty({
    example: null,
    description: "Home postal/zip code of the user",
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  homePostalCode: string | null;

  @ApiProperty({
    example: "US",
    description: "Home country of the user",
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  homeCountry: string | null;

  @ApiProperty({
    example: "1 Market St",
    description: "Home address line 1 of the user",
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  homeAddressLine1: string | null;

  @ApiProperty({
    example: "Primary",
    description: "Assignment position of the user",
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  assignmentPosition: string | null;
}

export class UserTerrWrapperDto {
  @ApiProperty({
    type: [UserInfoDto],
    description: "List of user information records",
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UserInfoDto)
  userInfoList: UserInfoDto[];

  @ApiProperty({
    example: ["EMP-887", "EMP-112", "EMP-683", "EMP-999"],
    description: "List of user identifier IDs",
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  userIdList: string[];

  @ApiProperty({
    example: "Demoxyz",
    description: "Name of the territory",
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  terrName: string | null;

  @ApiProperty({
    example: "T000",
    description: "Master ID of the territory",
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  terrMasterId: string | null;

  @ApiProperty({
    example: "T1234",
    description: "Master ID of the parent territory",
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  parentMasterId: string | null;
}

export class CreateSalesforceUserTerritoryDto {
  @ApiProperty({
    type: [UserTerrWrapperDto],
    description: "List of user territory wrapper records",
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UserTerrWrapperDto)
  UserTerrWrapperList: UserTerrWrapperDto[];

  @ApiProperty({
    example: "DB24433E-F36B-1410-89CA-00DAAF975574",
    description: "Unique ID for the transaction",
  })
  @IsString()
  @IsNotEmpty()
  transactionId: string;
}
