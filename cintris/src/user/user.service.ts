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
import { CreateSalesforceUserTransactionDto } from "./DTOs/create-salesforce-transaction.dto";
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
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly baseUrl: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly rmqService: RabbitMQService
  ) {
    this.baseUrl = this.configService.get("SALESFORCE_URL") as string;
  }

  async createUserTransaction(
    authToken: Record<string, unknown>,
    payload: CreateSalesforceUserTransactionDto
  ): Promise<any> {
    try {
      this.logger.log("createUserTransaction service has started");

      if (!authToken) {
        throw new HttpException(
          "Missing Authorization header",
          HttpStatus.UNAUTHORIZED
        );
      }

      const inboundTransactionId = payload?.transactionId;
      const inboundTransaction = (await this.rmqService.send(
        "get-veeva-user-inbound-transaction",
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

      const baseUrl = `${this.baseUrl}/UserManagementAPI`;

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
            "Failed to fetch data from salesforce"
        );
      }

      await this.rmqService.emit("create-salesforce-user-transaction", {
        userTerritoryTransactionLog: {
          Name: inboundTransaction?.Name,
          Success: TRANSACTION_SUCCESS_STATUSES.TRUE,
          LogType: TRANSACTION_LOG_TYPES.USER,
          Owner: authToken?.id as string,
          Direction: TRANSACTION_DIRECTIONS.CENTRIS_OUTBOUND,
          ModifiedDateTime: inboundTransaction?.ModifiedDateTime,
        },
      });

      const response = {
        success: true,
        message: "User data sync successfully in Centris",
      };

      this.logger.log("createUserTransaction service returned response");
      return response;
    } catch (error) {
      const err = error as ErrorObject;
      this.logger.error(
        "createUserTransaction service has error:",
        err?.message
      );

      await this.rmqService.emit("create-salesforce-user-transaction", {
        userTerritoryTransactionLog: {
          ErrorMessage: err?.message,
          Success: TRANSACTION_SUCCESS_STATUSES.FALSE,
          LogType: TRANSACTION_LOG_TYPES.USER,
          Owner: authToken?.id as string,
          Direction: TRANSACTION_DIRECTIONS.CENTRIS_OUTBOUND,
          Name: payload?.transactionId,
        },
      });

      throw new BadRequestException(
        err?.message || "Failed to fetch events from Veeva Vault"
      );
    }
  }
}
