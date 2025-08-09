import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { ManageTerritoryDTO } from "./DTOs/manage-territory.dto";
import { RabbitMQService } from "../shared/rabbitmq/rabbitmq.service";
import { mapTransactionLogPayload } from "../shared/mappers/transaction-log.mapper";
import { TRANSACTION_DIRECTIONS } from "src/shared/constants/transaction-log-dirction";

@Injectable()
export class TerritoryService {
  constructor(private rmqService: RabbitMQService) {}

  async manageTerritory(authData: any, data: ManageTerritoryDTO): Promise<any> {
    try {
      if (!authData?.access_token || !authData?.serverUrl) {
        throw new UnauthorizedException("Missing SF auth");
      }
      const { access_token, serverUrl } = authData;

      console.log("🚀 ~ TerritoryService ~ manageTerritory ~ data:", data);
      const baseUrl = `${serverUrl}/services/apexrest/TerritoryManagementAPI`;
      const response = await axios.post(baseUrl, data, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        validateStatus: () => true,
      });

      await this.rmqService.emit(
        "transaction-log",
        mapTransactionLogPayload({
          name: data.transactionName,
          direction: TRANSACTION_DIRECTIONS.CENTRIS_OUTBOUND,
          logType: "Territory",
          success: "true",
        })
      );

      return response.data;
    } catch (error) {
      console.log("🚀 ~ TerritoryService ~ manageTerritory ~ error:", error);
      await this.rmqService.emit(
        "transaction-log",
        mapTransactionLogPayload({
          name: data.transactionName,
          direction: TRANSACTION_DIRECTIONS.CENTRIS_OUTBOUND,
          logType: "Territory",
          success: "false",
          errorMessage: error.message,
        })
      );
      throw new HttpException(
        error.response?.data || "Salesforce API call failed",
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
