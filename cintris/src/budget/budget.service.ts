import { BadRequestException, Injectable } from "@nestjs/common";
import { SalesforceBudgetDto } from "./DTOs/create-salesforce-budget.dto";
import { RabbitMQService } from "src/shared/rabbitmq/rabbitmq.service";

@Injectable()
export class BudgetService {
  constructor(private rmqService: RabbitMQService) {}

  async create(createSalesforceBudgetDto: SalesforceBudgetDto) {
    try {
      const result = await this.rmqService.send(
        `budget-created`,
        createSalesforceBudgetDto
      );

      return {
        VeevaTransactionId: result.Id,
        CentrisReferenceId: createSalesforceBudgetDto.TransactionId,
        success: result?.isError ? !result?.isError : true,
        errorMessage: result?.message,
      };
    } catch (error) {
      console.log("🚀 ~ BudgetService ~ create ~ error:", error);
      throw new BadRequestException(error.message);
    }
  }
}
