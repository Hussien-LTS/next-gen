import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { RabbitMQService } from 'src/shared/rabbitmq/rabbitmq.service';
import { UpsertUserTerritoriesDto } from './DTOs/upsert-user-territories.dto';
import * as qs from 'qs';
import {
  TRANSACTION_DIRECTIONS,
  TRANSACTION_SUCCESS_STATUSES,
  TRANSACTION_LOG_TYPES,
} from '../shared/constants/transaction-log-dirction';
import { randomUUID } from 'crypto';

interface ErrorObject {
  message?: string;
}

@Injectable()
export class UserTerritoryService {
  private readonly logger = new Logger(UserTerritoryService.name);
  private readonly clientId: string;
  private readonly baseUrl: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly rmqService: RabbitMQService,
  ) {
    this.baseUrl = this.configService.get('VAULT_BASE_URL') as string;
    this.clientId = this.configService.get('VAULT_CLIENT_ID') as string;
  }

  async upsertUserTerritories(
    authToken: Record<string, unknown>,
    payload: UpsertUserTerritoriesDto,
  ): Promise<any> {
    const uuid = randomUUID();
    try {
      this.logger.log('upsertUserTerritories service has started');

      if (!authToken) {
        throw new HttpException(
          'Missing Authorization header',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const { userTerritoryId } = payload;

      const whereCondition = userTerritoryId
        ?.map((id, index) => {
          if (index === 0) {
            return `'${id}'`;
          }
          return `, '${id}'`;
        })
        ?.join('');

      const userTerritoriesDetail = await this.getUserTerritoriesFromVeeva(
        whereCondition,
        authToken,
      );

      if (!userTerritoriesDetail.length) {
        return {
          UserTerrWrapperList: [],
          transactionId: '',
        };
      }

      let modifiedDateTime: unknown;

      const formattedResult = userTerritoriesDetail.map((userTerritory) => {
        if (!modifiedDateTime) {
          modifiedDateTime = userTerritory.modified_date__v;
        }

        return {
          Id: userTerritory.id,
          ModifiedDateTime: userTerritory.modified_date__v,
          ExternalId: userTerritory.external_id__v,
          ExternalUserId: userTerritory.user__v,
          ExternalTerritoryId: userTerritory.territory__v,
          Name: uuid,
        };
      });

      const result = (await this.rmqService.send(`veeva-user-territory-info`, {
        userTerritory: formattedResult,
        transactionLog: { Owner: authToken?.userId },
        modifiedDateTime,
      })) as Record<string, unknown>;

      if (result?.isError) {
        throw new BadRequestException(result?.message);
      }

      this.logger.log('upsertUserTerritories service returned response');
      return result;
    } catch (error) {
      const err = error as ErrorObject;
      this.logger.error(
        'upsertUserTerritories service has error:',
        err?.message,
      );

      await this.rmqService.emit(
        `veeva-user-territory-failure-transaction-log`,
        {
          userTerritoryTransactionLog: {
            ErrorMessage: err?.message,
            Success: TRANSACTION_SUCCESS_STATUSES.FALSE,
            LogType: TRANSACTION_LOG_TYPES.USER_TERRITORY,
            Owner: authToken?.userId?.toString(),
            Direction: TRANSACTION_DIRECTIONS.VAULT_INBOUND,
            Name: uuid,
          },
        },
      );

      throw new BadRequestException(
        err?.message || 'Failed to fetch events from Veeva Vault',
      );
    }
  }

  async queryVault(queryVar: string, authToken: string): Promise<any> {
    const query = queryVar;
    const data = qs.stringify({ q: query });

    const config = {
      method: 'post' as const,
      maxBodyLength: Infinity,
      url: `${this.baseUrl}/query`,
      headers: {
        Authorization: authToken,
        Accept: 'application/json',
        'X-VaultAPI-DescribeQuery': 'true',
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-VaultAPI-ClientID': this.clientId,
      },
      data: data,
    };

    const response = await axios.request(config);
    return response.data;
  }

  async getUserTerritoriesFromVeeva(
    whereCondition: string,
    authToken: Record<string, unknown>,
  ): Promise<Record<string, unknown>[]> {
    const attendeesData = (await this.queryVault(
      `SELECT id, modified_date__v, external_id__v, user__v, territory__v, name__v FROM user_territory__v WHERE id CONTAINS (${whereCondition})`,
      authToken?.sessionId as string,
    )) as { errors?: [{ message?: string }]; data?: unknown };

    const { errors } = attendeesData;

    if (errors?.length) {
      throw new BadRequestException(errors[0]?.message);
    }

    const result = (attendeesData?.data || []) as [];

    return result;
  }
}
