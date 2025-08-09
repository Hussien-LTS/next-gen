import {
  IsString,
  IsNotEmpty,
  IsDateString,
  ValidateNested,
  ValidateIf,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class BudgetDto {
  @ApiProperty({ example: "10000.00" })
  @IsString()
  @IsNotEmpty()
  TotalBudget: string;

  @ApiProperty({ example: "North America" })
  @IsString()
  @IsNotEmpty()
  Territory: string;

  @ApiProperty({ example: "2025-01-01", format: "date" })
  @IsDateString()
  @IsNotEmpty()
  StartDate: string;

  @ApiProperty({ example: "EXT-001" })
  @IsString()
  @IsNotEmpty()
  ExternalId?: string;

  @ApiProperty({ example: "2025-12-31", format: "date" })
  @IsDateString()
  @IsNotEmpty()
  EndDate: string;

  @ApiProperty({ example: "Marketing Q1 Budget" })
  @IsString()
  @IsNotEmpty()
  BudgetName: string;
}

export class SalesforceBudgetDto {
  @ApiProperty({ example: "TX-001" })
  @IsString()
  @IsNotEmpty()
  TransactionId: string;

  @ApiProperty({ type: [BudgetDto] })
  @ValidateNested({ each: true })
  @IsNotEmpty()
  @Type(() => BudgetDto)
  budgetList: BudgetDto[];
}
