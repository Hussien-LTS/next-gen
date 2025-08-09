import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  BadRequestException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { RabbitMQService } from "src/shared/rabbitmq/rabbitmq.service";
import { CreateSalesforceUserTerritoryDto } from "./DTOs/create-salesforce-transaction.dto";
import {
  TRANSACTION_DIRECTIONS,
  TRANSACTION_SUCCESS_STATUSES,
  TRANSACTION_LOG_TYPES,
} from "../shared/constants/transaction-log";

interface ErrorObject {
  message?: string;
  response?: {
    data?: {
      errorMessage?: string[];
    };
  };
}

@Injectable()
export class UserTerritoryService {
  private readonly logger = new Logger(UserTerritoryService.name);
  private readonly baseUrl: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly rmqService: RabbitMQService
  ) {
    this.baseUrl = this.configService.get("SALESFORCE_URL") as string;
  }

  async createUserTerritoryTransaction(
    authToken: Record<string, unknown>,
    payload: CreateSalesforceUserTerritoryDto
  ): Promise<any> {
    try {
      this.logger.log("createUserTerritoryTransaction service has started");

      if (!authToken) {
        throw new HttpException(
          "Missing Authorization header",
          HttpStatus.UNAUTHORIZED
        );
      }

      const inboundTransactionId = payload?.transactionId;
      const inboundTransaction = (await this.rmqService.send(
        "get-veeva-user-territory-inbound-transaction",
        {
          transactionId: inboundTransactionId,
        }
      )) as Record<string, unknown>;

      if (inboundTransaction?.isError) {
        throw new BadRequestException(inboundTransaction?.message);
      }

      if (!inboundTransaction) {
        throw new BadRequestException("invalid inbound transaction id");
      }

      const baseUrl = `${this.baseUrl}/UserTerritoryAPI`;

      try {
        await axios.post(baseUrl, payload, {
          headers: {
            Authorization: `Bearer  ${authToken?.access_token as string}`,
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        const err = error as ErrorObject;

        this.logger.error(
          "createUserTransaction failed to fetch data from salesforce error:",
          err?.response?.data?.errorMessage?.[0]
        );

        throw new BadRequestException(
          err?.response?.data?.errorMessage?.[0] ||
            "Failed to fetch data from salesforce "
        );
      }

      await this.rmqService.emit(
        "create-salesforce-user-territory-transaction",
        {
          userTerritoryTransactionLog: {
            Name: inboundTransaction?.Name,
            Success: TRANSACTION_SUCCESS_STATUSES.TRUE,
            LogType: TRANSACTION_LOG_TYPES.USER_TERRITORY,
            Owner: authToken?.id as string,
            Direction: TRANSACTION_DIRECTIONS.CENTRIS_OUTBOUND,
            ModifiedDateTime: inboundTransaction?.ModifiedDateTime,
          },
        }
      );

      const response = {
        success: true,
        message: "User Territory data sync successfully in Centris",
      };

      this.logger.log(
        "createUserTerritoryTransaction service returned response"
      );
      return response;
    } catch (error) {
      const err = error as ErrorObject;
      this.logger.error(
        "createUserTerritoryTransaction service has error:",
        err?.message
      );

      await this.rmqService.emit(
        "create-salesforce-user-territory-transaction",
        {
          userTerritoryTransactionLog: {
            ErrorMessage: err?.message,
            Success: TRANSACTION_SUCCESS_STATUSES.FALSE,
            LogType: TRANSACTION_LOG_TYPES.USER_TERRITORY,
            Owner: authToken?.id as string,
            Direction: TRANSACTION_DIRECTIONS.CENTRIS_OUTBOUND,
            Name: payload?.transactionId,
          },
        }
      );

      throw new BadRequestException(
        err?.message || "Failed to fetch events from Veeva Vault"
      );
    }
  }
}
