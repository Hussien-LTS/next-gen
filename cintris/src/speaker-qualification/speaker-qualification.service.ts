import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { RabbitMQService } from "src/shared/rabbitmq/rabbitmq.service";
import { CreateSpeakerQualificationsDto } from "./DTOs/create-speaker-qualifications.dto";
import {
  TRANSACTION_SUCCESS_STATUSES,
  TRANSACTION_DIRECTIONS,
} from "../shared/constants/transaction-log";

interface ErrorObject {
  message?: string;
}

@Injectable()
export class SpeakerQualificationService {
  private readonly logger = new Logger(SpeakerQualificationService.name);
  constructor(private readonly rmqService: RabbitMQService) {}

  async createSpeakerQualifications(
    authToken: Record<string, unknown> | null,
    payload: CreateSpeakerQualificationsDto
  ): Promise<any> {
    try {
      this.logger.log("createSpeakerQualifications service has started");

      const vaultResult = (await this.rmqService.send(
        "sync-speaker-qualification-from-centris-to-vault",
        {
          payload,
          userAccessToken: authToken,
        }
      )) as Record<string, unknown>;

      if (vaultResult?.isError) {
        throw new BadRequestException(vaultResult?.message);
      }

      const transaction = (await this.rmqService.send(
        "create-speaker-qualification-transaction-log",
        {
          transactionLog: {
            Name: payload.TransactionId,
            Success: TRANSACTION_SUCCESS_STATUSES.TRUE,
            LogType: "Speaker Qualification",
            Owner: `${authToken?.username || ""}`,
            Direction: TRANSACTION_DIRECTIONS.CENTRIS_INBOUND,
          },
        }
      )) as Record<string, unknown>;

      if (transaction?.isError) {
        throw new BadRequestException(transaction?.message);
      }

      this.logger.log("createSpeakerQualifications service has finished");

      return {
        VeevaTransactionId: transaction?.Id || "",
        CentrisReferenceId: payload.TransactionId,
        success: true,
        errorMessage: "",
      };
    } catch (error) {
      const err = error as ErrorObject;
      this.logger.error(
        "createSpeakerQualifications service has error:",
        err?.message
      );

      const transaction = (await this.rmqService.send(
        "create-speaker-qualification-transaction-log",
        {
          transactionLog: {
            Name: payload.TransactionId,
            Success: TRANSACTION_SUCCESS_STATUSES.FALSE,
            LogType: "Speaker Qualification",
            Owner: `${authToken?.username || ""}`,
            Direction: TRANSACTION_DIRECTIONS.CENTRIS_INBOUND,
            ErrorMessage: err?.message,
          },
        }
      )) as Record<string, unknown>;

      return {
        VeevaTransactionId: transaction?.Id || "",
        CentrisReferenceId: payload.TransactionId,
        success: false,
        errorMessage: err?.message || "Something Went Wrong",
      };

      // throw new BadRequestException(err?.message || "Something Went Wrong");
    }
  }
}
