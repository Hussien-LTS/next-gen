import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { BudgetService } from './budget.service';
import { SessionStoreService } from 'src/sessionValidation/sessionValidation.service';
import { CreateBudgetDto, GetBudgetDetailsDto } from './DTOs/create-budget.dto';
import { VaultAuthInterceptor } from 'src/interceptors/vault-auth.interceptor';
import { CustomVaultAuth } from 'src/decorators/vault-auth.decorator';

@ApiTags('Budget')
@Controller('vault/v1')
export class BudgetController {

  constructor(
    private readonly budgetService: BudgetService,
    private readonly sessionStore: SessionStoreService,
  ) {}



  @Post('/budget')
  @ApiBody({ type: CreateBudgetDto })
  @UseInterceptors(VaultAuthInterceptor)
  handleBudgetCreate(
    @Body() data: CreateBudgetDto,
    @CustomVaultAuth() vaultData: any,
  ) {
    console.log(
      '🚀 ~ BudgetController ~ handleBudgetCreate ~ vaultData:',
      vaultData,
    );
    return this.budgetService.create(data, vaultData);
  }

  @Post('/em_budget/get_budget_details')
  @UseInterceptors(VaultAuthInterceptor)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiBody({ type: GetBudgetDetailsDto })
  async getBudgetDetails(
    @Body() body: GetBudgetDetailsDto,
    @CustomVaultAuth() vaultData: any,
  ) {
    console.log('🔍 ~ BudgetController ~ getBudgetDetails ~ Body:', body);

    if (!body?.BudgetId) {
      throw new ForbiddenException('BudgetId is required.');
    }
    return await this.budgetService.getBudgetById(vaultData, body.BudgetId);
  }

  @EventPattern('vault_budget')
  @UseInterceptors(VaultAuthInterceptor)

  async handleBudgetCreatedRMQ(
    @Payload() payload: CreateBudgetDto,
    @Ctx() context: RmqContext,
     @CustomVaultAuth() vaultData: any,
  ) {
    console.log("🚀 ~ BudgetController  c~ handleBudgetCreatedRMQ ~ payload:", payload)
    
    return this.budgetService.create(payload, vaultData);
  }
}
