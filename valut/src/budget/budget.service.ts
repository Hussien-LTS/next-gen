import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import {
  mapBudgetInputToVault,
  mapVaultBudgetToCentries,
} from './budget.mapper';
import { CreateBudgetDto } from './DTOs/create-budget.dto';
import { RabbitMQService } from 'src/shared/rabbitmq/rabbitmq.service';
import { TRANSACTION_DIRECTIONS } from 'src/shared/constants/transaction-log-dirction';
import { mapTransactionLogPayload } from 'src/shared/transactionLog/mapTransactionLogPayload';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BudgetService {
  constructor(private readonly rmqService: RabbitMQService) {}

  private getHeaders(authorization: string, clientId: string) {
    return {
      Authorization: authorization || '',
      Accept: '*/*',
      'X-VaultAPI-ClientID': clientId,
    };
  }

  async create(createBudgetDto: CreateBudgetDto, vaultAuth: any) {
    try {
      if (!vaultAuth.sessionId || !vaultAuth.clientId || !vaultAuth.serverUrl) {
        throw new UnauthorizedException('Missing Vault auth');
      }
      console.log('🚀 ~ BudgetService ~ createBudgetDto:', createBudgetDto);

      const body = mapBudgetInputToVault(createBudgetDto);

      const response = await axios.post(
        `${vaultAuth.serverUrl}/api/v25.1/vobjects/em_budget__v/?idParam=legacy_crm_id__v`,
        body,
        {
          headers: this.getHeaders(vaultAuth.sessionId, vaultAuth.clientId),
        },
      );
      console.log('🚀 ~ BudgetService ~ response:', response.data);

      if (response?.data?.errors) {
        throw new BadRequestException(response?.data?.errors[0]?.message);
      } else {
        await this.rmqService.emit(
          'transaction-log',
          mapTransactionLogPayload({
            name: createBudgetDto.TransactionId,
            direction: TRANSACTION_DIRECTIONS.VAULT_OUTBOUND,
            logType: 'Budget',
            success: 'true',
          }),
        );
      }

      console.log('🚀 ~ BudgetService ~ response.data:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('🚀 ~ BudgetService ~ create error:', error.message);
      await this.rmqService.emit(
        'transaction-log',
        mapTransactionLogPayload({
          name: createBudgetDto.TransactionId,
          direction: TRANSACTION_DIRECTIONS.VAULT_OUTBOUND,
          logType: 'Budget',
          success: 'false',
          errorMessage: error?.message,
        }),
      );
      throw error;
    }
  }

  async getBudgetById(vaultAuth: any, budgetId: string) {
    console.log(`🔍 ~ BudgetService ~ getBudgetById ~ BudgetId: ${budgetId}`);

    try {
      if (
        !vaultAuth?.sessionId ||
        !vaultAuth?.clientId ||
        !vaultAuth?.serverUrl
      ) {
        throw new UnauthorizedException('Missing Vault auth');
      }
      const response = await axios.get(
        `${vaultAuth.serverUrl}/api/v25.1/vobjects/em_budget__v/${budgetId}`,
        {
          headers: this.getHeaders(vaultAuth.sessionId, vaultAuth.clientId),
        },
      );
      console.log('🚀 ~ BudgetService ~ getBudgetById ~ response:', response);

      const budgetData = mapVaultBudgetToCentries(response.data.data);
      const savedBudget = await this.rmqService.send(
        `budget-updated`,
        budgetData,
      );
      if (savedBudget?.response?.error) {
        throw new BadRequestException('not found budget');
      }
      let transaction;
      if (response?.data?.data[0]?.errors) {
        throw new BadRequestException(response?.data?.data[0]?.message);
      } else {
        transaction = await this.rmqService.send(
          'transaction-log',
          mapTransactionLogPayload({
            name: uuidv4(),
            direction: TRANSACTION_DIRECTIONS.VAULT_INBOUND,
            logType: 'Budget',
            success: 'true',
          }),
        );
      }
      console.log(
        '🚀 ~ BudgetService ~ lgetBudgetById ~ transaction:',
        transaction,
      );

      return { TransactionId: transaction?.data?.Id, budgetData };
    } catch (error: any) {
      console.log('🚀 ~ BudgetService ~ getBudgetById ~ error:', error);

      await this.rmqService.emit(
        'transaction-log',
        mapTransactionLogPayload({
          name: uuidv4(),
          direction: TRANSACTION_DIRECTIONS.VAULT_INBOUND,
          logType: 'Budget',
          success: 'false',
          errorMessage: error.message,
        }),
      );
      throw new BadRequestException(error.message);
    }
  }
}
