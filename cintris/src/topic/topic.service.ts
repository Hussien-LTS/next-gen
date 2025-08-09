import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { RabbitMQService } from "../shared/rabbitmq/rabbitmq.service";
@Injectable()
export class TopicService {
  private readonly logger = new Logger(TopicService.name);
  constructor(private rmqService: RabbitMQService) {}

  async create(createSalesforceTopicDto: any) {
    try {
      this.logger.log("🚀 ~ TopicService ~ create ~ create:");
      const res = await this.rmqService.send(
        `salesforce-topic-created`,
        createSalesforceTopicDto
      );
      console.log("🚀 ~ TopicService ~ create ~ res:", res);
      this.logger.log("🚀 ~ TopicService ~ create ~ Message sent to RabbitMQ");
      return {
        VeevaTransactionId: res?.Id,
        CentrisReferenceId: createSalesforceTopicDto.TransactionId,
        success: res?.isError ? !res?.isError : true,
        errorMessage: res?.message,
      };
    } catch (error) {
      this.logger.error("Error creating topic:", error);
      throw new BadRequestException(error.message);
    }
  }
}
