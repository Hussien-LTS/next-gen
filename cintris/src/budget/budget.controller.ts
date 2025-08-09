import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { BudgetService } from "./budget.service";
import { ApiTags, ApiBody, ApiHeader } from "@nestjs/swagger";
import { SalesforceBudgetDto } from "./DTOs/create-salesforce-budget.dto";
import { JwtAuthGuard } from "src/libs/shared-auth/jwt-auth.guard";
import { TransformInterceptor } from "src/shared/interceptors/transform.interceptor";

@ApiTags("Budget")
@Controller("salesforce/budget")
@UseGuards(JwtAuthGuard)
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  @UseInterceptors(TransformInterceptor)
  @ApiHeader({
    name: "auth",
    description: "Token JWT",
    required: true,
  })
  @ApiBody({ type: SalesforceBudgetDto })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  create(@Body() salesforceBudget: SalesforceBudgetDto) {
    return this.budgetService.create(salesforceBudget);
  }
}
