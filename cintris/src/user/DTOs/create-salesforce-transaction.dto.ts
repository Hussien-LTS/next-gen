import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class UserDataDto {
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

export class CreateSalesforceUserTransactionDto {
  @ApiProperty({
    type: [UserDataDto],
    description: "List of user data records",
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UserDataDto)
  userDataList: UserDataDto[];

  @ApiProperty({
    example: "DB24433E-F36B-1410-89CA-00DAAF975574",
    description: "Unique ID for the transaction",
  })
  @IsString()
  @IsNotEmpty()
  transactionId: string;
}
