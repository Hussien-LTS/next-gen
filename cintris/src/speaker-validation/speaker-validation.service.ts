import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { RabbitMQService } from "../shared/rabbitmq/rabbitmq.service";
import { mapTransactionLogPayload } from "../shared/mappers/transaction-log.mapper";
import { TRANSACTION_DIRECTIONS } from "src/shared/constants/transaction-log-dirction";
import { SpeakerValidationDTO } from "./DTOs/speaker-validation.dto";

@Injectable()
export class SpeakerValidationService {
  private readonly baseUrl: string | undefined;

  constructor(
    private readonly configService: ConfigService,
    private readonly rmqService: RabbitMQService
  ) {
    this.baseUrl = this.configService.get<string>("SALESFORCE_URL");
  }

  async validateSpeaker(auth: string, data: any) {
    console.log(
      "🚀 ~ SpeakerValidationService ~ validateSpeaker ~ dbData:",
      data
    );
    const validationUrl = `${this.baseUrl}/GetSpeakerEligibility/`;
    const { transactionName, AWSHcpEligibilityId, ...speakerData } = data;
    console.log(
      "🚀 ~ SpeakerValidationService ~ validationUrl:",
      validationUrl
    );
    try {
      const response = await axios.post(
        validationUrl,
        { speakerinformation: speakerData },
        {
          headers: {
            Authorization: `Bearer ${auth}`,
            "Content-Type": "application/json",
          },
          validateStatus: () => true,
        }
      );
      console.log(
        "🚀 ~ SpeakerValidationService ~ validateSpeaker ~ samah:",
        response.data
      );

      await this.rmqService.send(
        "transaction-log",
        mapTransactionLogPayload({
          name: transactionName,
          direction: TRANSACTION_DIRECTIONS.CENTRIS_OUTBOUND,
          logType: "Speaker",
          success: "true",
        })
      );
      const updatedSpeaker = await this.rmqService.send(
        "update-speaker-validation",
        {
          Id: data.AWSHcpEligibilityId,
          Status: response.data.Status === "Processed" ? "true" : "false",
          EligibilityReason: response.data.reason,
          centrieRes: response.data,
          transactionName,
        }
      );
      console.log(
        "🚀 ~ SpeakerValidationService ~ validateSpeaker ~ updatedSpeaker:",
        updatedSpeaker
      );
      if (updatedSpeaker?.response?.error)
        throw new BadRequestException(updatedSpeaker?.response?.message);

      return response.data;
    } catch (error) {
      console.log("🚀 ~ SpeakerValidationService ~ error:", error);

      await this.rmqService.send(
        "transaction-log",
        mapTransactionLogPayload({
          name: transactionName,
          direction: TRANSACTION_DIRECTIONS.CENTRIS_OUTBOUND,
          logType: "SpeakerValidation",
          success: "false",
          errorMessage: error.message,
        })
      );

      return new BadRequestException(
        error.message,
        "Salesforce Speaker Validation API call failed"
      );
    }
  }
}
