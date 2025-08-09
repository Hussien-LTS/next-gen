import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { LitsAttendeeInfoDto } from "./DTOs/attendee-info.dto";
import { RabbitMQService } from "src/shared/rabbitmq/rabbitmq.service";
import {
  TRANSACTION_SUCCESS_STATUSES,
  TRANSACTION_DIRECTIONS,
  TRANSACTION_LOG_TYPES,
} from "../shared/constants/transaction-log";
import { randomUUID } from "crypto";

interface ErrorObject {
  message?: string;
  response?: {
    data?: {
      errorMessage?: string[];
    };
  };
}

@Injectable()
export class AttendeeInformationService {
  private readonly logger = new Logger(AttendeeInformationService.name);
  constructor(private rmqService: RabbitMQService) {}

  async litsAttendeesInfo(
    authToken: Record<string, unknown>,
    payload: LitsAttendeeInfoDto
  ): Promise<any> {
    const uuid = randomUUID();
    try {
      this.logger.log("litsAttendeesInfo service has started");

      const { ExternalId } = payload;

      const attendeeList = (await this.rmqService.send(
        `salesforce-attendee-external-ids`,
        {
          externalIds: ExternalId,
          transactionLogName: uuid,
          reqToken: authToken,
        }
      )) as Record<string, unknown>;

      if (attendeeList?.isError) {
        throw new BadRequestException(attendeeList?.message);
      }

      await this.rmqService.send(
        "salesforce-list-attendees-by-external-ids-transaction-log",
        {
          transactionLog: {
            Name: uuid,
            Success: TRANSACTION_SUCCESS_STATUSES.TRUE,
            LogType: TRANSACTION_LOG_TYPES.ATTENDEE_INFORMATION,
            Owner: `${authToken?.username || ""}`,
            Direction: TRANSACTION_DIRECTIONS.CENTRIS_INBOUND,
          },
        }
      );

      this.logger.log("litsAttendeesInfo service has finished");

      return { success: true, attendeeDetail: attendeeList?.result };
    } catch (error) {
      const err = error as ErrorObject;
      this.logger.error("litsAttendeesInfo service has error:", err?.message);

      await this.rmqService.send(
        "salesforce-list-attendees-by-external-ids-transaction-log",
        {
          transactionLog: {
            Name: uuid,
            Success: TRANSACTION_SUCCESS_STATUSES.FALSE,
            LogType: TRANSACTION_LOG_TYPES.ATTENDEE_INFORMATION,
            Owner: `${authToken?.username || ""}`,
            Direction: TRANSACTION_DIRECTIONS.CENTRIS_INBOUND,
            ErrorMessage: err?.message,
          },
        }
      );

      throw new BadRequestException(err?.message);
    }
  }
}
