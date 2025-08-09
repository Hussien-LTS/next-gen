import { BadRequestException, Injectable } from "@nestjs/common";
import { RabbitMQService } from "src/shared/rabbitmq/rabbitmq.service";
import { CreateVenueTransactionDto } from "./DTOs/create-salesforce-venue.dto";

@Injectable()
export class VenueService {
  constructor(private rmqService: RabbitMQService) {}

  async create(createSalesforceVenueDto: CreateVenueTransactionDto) {
    console.log(
      "🚀 ~ VenueService ~ create ~ createSalesforceVenueDto:",
      createSalesforceVenueDto
    );
    try {
      const result = await this.rmqService.send(
        `salesforce-venue-created`,
        createSalesforceVenueDto
      );

      return {
        VeevaTransactionId: result.Id,
        CentrisReferenceId: createSalesforceVenueDto.TransactionId,
        success: result?.isError ? !result?.isError : true,
        errorMessage: result?.message,
      };
    } catch (error) {
      console.log("🚀 ~ VenueService ~ create ~ error:", error);
      throw new BadRequestException(error.message);
    }
  }
}
