import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { TRANSACTION_DIRECTIONS } from "src/shared/constants/transaction-log-dirction";
import { mapTransactionLogPayload } from "src/shared/mappers/transaction-log.mapper";
import { RabbitMQService } from "src/shared/rabbitmq/rabbitmq.service";

@Injectable()
export class AttendeeValidationService {
  private readonly baseUrl: string | undefined;

  constructor(
    private readonly configService: ConfigService,
    private readonly rmqService: RabbitMQService
  ) {
    this.baseUrl = this.configService.get<string>("SALESFORCE_URL");
  }

  async validateAttendee(auth: any, data: any) {
    console.log(
      "🚀 ~ AttendeeValidationService ~ validateAttendee ~ data:",
      data
    );
    const validationUrl = `${this.baseUrl}/GetSpeakerEligibility/`;
    console.log(
      "🚀 ~ AttendeeValidationService ~ validateAttendee ~ validationUrl:",
      validationUrl
    );
    const { transactionName, AWSHcpEligibilityId, ...attendeeData } = data;
    console.log("🚀🚀🚀🚀 ~ AttendeeValidationService ~ validateAttendee ~ attendeeData:", attendeeData)

    try {
      
      const response = await axios.post(
        validationUrl,
        { speakerinformation: attendeeData },
        {
          headers: {
            Authorization: `Bearer ${auth}`,
            "Content-Type": "application/json",
          },
          validateStatus: () => true,
        }
      );
      console.log(
        "🚀 ~ AttendeeValidationService ~ validateAttendee ~ response:",
        response.data
      );

      await this.rmqService.send(
        "transaction-log",
        mapTransactionLogPayload({
          name: transactionName,
          direction: TRANSACTION_DIRECTIONS.CENTRIS_OUTBOUND,
          logType: "Attendee",
          success: "true",
        })
      );
      const updatedAttendee = await this.rmqService.send(
        "update-attendee-validation",
        {
          Id: data.AWSHcpEligibilityId,
          Status: response.data.Status === "Processed" ? "true" : "false",
          EligibilityReason: response.data.reason,
          centrieRes: response.data,
          transactionName,
        }
      );
      console.log(
        "🚀 ~ AttendeeValidationService ~ validateAttendee ~ updatedAttendee:",
        updatedAttendee
      );

      if (updatedAttendee?.response?.error)
        throw new BadRequestException(updatedAttendee?.response?.message);

      return response.data;
    } catch (error) {
      console.log("🚀 ~ AttendeeValidationService ~ error:", error);

      await this.rmqService.send(
        "transaction-log",
        mapTransactionLogPayload({
          name: transactionName,
          direction: TRANSACTION_DIRECTIONS.CENTRIS_OUTBOUND,
          logType: "Attendee",
          success: "false",
          errorMessage: error.message,
        })
      );

      return new BadRequestException(
        error.message,
        "Salesforce Attendee Validation API call failed"
      );
    }
  }
}
