import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, QueryFailedError } from 'typeorm';
import { UserTerritory } from 'src/entities/userterritory .entity';
import { TransactionLog } from 'src/entities/transaction_log.entity';
import { User } from 'src/entities/user.entity';
import { Territory } from 'src/entities/territory.entity';
import {
  TRANSACTION_DIRECTIONS,
  TRANSACTION_SUCCESS_STATUSES,
  TRANSACTION_LOG_TYPES,
} from '../shared/constants/transaction-log-dirction';

interface ErrorObject {
  message: string;
  code?: string;
}

@Injectable()
export class UserTerritoryService {
  private readonly logger = new Logger(UserTerritoryService.name);

  constructor(
    @InjectRepository(UserTerritory)
    private userTerritoryRepository: Repository<UserTerritory>,

    @InjectRepository(TransactionLog)
    private transactionLogRepository: Repository<TransactionLog>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Territory)
    private territoryRepository: Repository<Territory>,
  ) {}

  async upsertUserTerritories(
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    try {
      this.logger.log('the upsertUserTerritories service has started');

      const userTerritoriesData = data?.userTerritory as Record<
        string,
        unknown
      >[];
      const transactionLogData = data?.transactionLog as Record<
        string,
        unknown
      >;

      const territory = await this.territoryRepository.findOneBy({
        Id: userTerritoriesData?.[0]?.ExternalTerritoryId as string,
      });

      const promises: any[] = [];

      if (userTerritoriesData?.length) {
        for (const userTerritoryData of userTerritoriesData) {
          const userTerritory = this.userTerritoryRepository.save({
            ...userTerritoryData,
            ExternalParentTerritoryId: territory?.ExternalParentId,
          });
          promises.push(userTerritory);
        }
      }

      await Promise.all(promises);

      const userIds = userTerritoriesData.map(
        (userTerritory) => userTerritory?.ExternalUserId,
      ) as string[];

      const territoryUsers = await this.userRepository.find({
        where: {
          Id: In(userIds),
        },
      });

      const transactionLog = await this.transactionLogRepository.insert({
        ModifiedDateTime: data?.modifiedDateTime as string,
        Name: userTerritoriesData?.[0]?.Name as string,
        Success: TRANSACTION_SUCCESS_STATUSES.TRUE,
        Direction: TRANSACTION_DIRECTIONS.VAULT_INBOUND,
        LogType: TRANSACTION_LOG_TYPES.USER_TERRITORY,
        ProcessCompletionTime: new Date().toISOString(),
        Owner: transactionLogData?.Owner?.toString() as string,
      });

      const result = {
        UserTerrWrapperList: [
          {
            userInfoList: [] as Record<string, unknown>[],
            userIdList: [] as string[],
            terrName: territory?.Name,
            terrMasterId: territory?.Id,
            parentMasterId: territory?.ExternalParentId,
          },
        ],
        transactionId: transactionLog?.identifiers?.[0]?.Id as string,
      };

      territoryUsers.forEach((user) => {
        const userInfoList = result.UserTerrWrapperList[0]?.userInfoList;
        const userIdList = result.UserTerrWrapperList[0]?.userIdList;
        userIdList.push(user?.Id);
        userInfoList.push({
          userStatus: user?.UserStatus == 'true' ? true : false,
          userRole: null,
          userProfile: null,
          userLastName: user?.UserLastName,
          userFirstName: user?.UserFirstName,
          userIdentifierId: user?.Id,
          homeState: user?.HomeState,
          homePostalCode: user?.HomePostalCode,
          homeCountry: user?.HomeCountry,
          homeAddressLine1: user?.HomeAddressLine1,
          assignmentPosition: user?.AssignmentPosition,
        });
      });

      this.logger.log('the upsertUserTerritories service has finished');
      return result;
    } catch (err) {
      const error = err as ErrorObject;

      this.logger.error(
        'the upsertUserTerritories service has error',
        error.message,
      );

      const errMsg = error.message.toLowerCase();

      // Handle foreign key constraint violations
      if (
        error instanceof QueryFailedError &&
        errMsg.includes('foreign key constraint')
      ) {
        if (errMsg.includes('.user') && errMsg.includes(`column 'id'`)) {
          return {
            isError: true,
            message: 'The provided user territory id does not have a user',
          };
        }
        if (errMsg.includes('.territory') && errMsg.includes(`column 'id'`)) {
          return {
            isError: true,
            message: 'The provided user territory id does not have a territory',
          };
        }
        return {
          isError: true,
          message: 'Invalid foreign key reference provided',
        };
      }

      return {
        isError: true,
        message: error.message,
      };
    }
  }

  async createFailureUserTerritoryTransactionLog(
    data: Record<string, unknown>,
  ): Promise<any> {
    this.logger.log(
      'the createFailureUserTerritoryTransactionLog service has started',
    );

    const transactionLogData = data?.userTerritoryTransactionLog as Record<
      string,
      unknown
    >;

    try {
      const transaction = await this.transactionLogRepository.insert({
        ...transactionLogData,
        ProcessCompletionTime: new Date().toISOString(),
      });

      this.logger.log(
        'the createFailureUserTerritoryTransactionLog service has ended',
      );

      return transaction;
    } catch (err) {
      const error = err as ErrorObject;

      this.logger.error(
        'the createFailureUserTerritoryTransactionLog service has error',
        error.message,
      );

      return {
        isError: true,
        message: error.message,
      };
    }
  }
}
