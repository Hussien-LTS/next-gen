import {
  BadRequestException,
  Body,
  Controller,
  HttpException,
  Logger,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { EventPattern, Payload, Ctx, RmqContext } from "@nestjs/microservices";
import { AttachmentService } from "./attachment.service";
import { ApiBody, ApiHeader, ApiResponse, ApiOperation } from "@nestjs/swagger";
import { AttachmentDto, AuthResponseDto } from "./dtos/attachment.dto";
import { JwtAuthGuard } from "src/libs/shared-auth/jwt-auth.guard";
import { TransformInterceptor } from "src/shared/interceptors/transform.interceptor";
import { RabbitMQService } from "src/shared/rabbitmq/rabbitmq.service";
import { TRANSACTION_DIRECTIONS } from "src/shared/constants/transaction-log-dirction";
import { mapTransactionLogPayload } from "src/shared/mappers/transaction-log.mapper";
import { CustomCentrisAuth } from "src/decorators/centris-auth.decorator";
import { CentrisAuthInterceptor } from "src/interceptors/centris-auth.interceptor";

@Controller("attachment")
export class AttachmentController {
  private access_token: string;
  private token: Record<string, unknown> | null = null;
  private readonly logger = new Logger(AttachmentController.name);
  constructor(
    private readonly attachmentService: AttachmentService,
    private rabbitMQService: RabbitMQService
  ) {}

  @EventPattern("salesforce_auth_response")
  async handleAuthResponse(
    @Payload() data: Record<string, unknown>,
    @Ctx() context: RmqContext
  ) {
    this.logger.log(
      "🚀 ~ AttachmentController ~ handleAuthResponse ~ handleAuthResponse:"
    );
    this.logger.log("Auth from RMQ", data);
    const access_token = data?.access_token;
    // this.access_token = access_token;
    this.token = data;
    if (!access_token) {
      this.logger.log("access_token missing in payload");
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new Error("access_token missing in payload");
    }
    context.getChannelRef().ack(context.getMessage());
    return { status: "access_token received from RMQ", access_token };
  }

  @EventPattern("datasource_attachment_queue")
  async handleDatasourceAttachmentQueue(
    @Payload() data: any,
    @Ctx() context: RmqContext
  ) {
    this.logger.log(
      "🚀 ~ AttachmentController ~ handleDatasourceAttachmentQueue ~ data:",
      data
    );
    try {
      if (!data) {
        this.logger.error("Data missing in payload");
        context.getChannelRef().nack(context.getMessage(), false, false);
        throw new Error("Data missing in payload");
      }
      const authToken = this.token;
      if (!authToken) {
        throw new BadRequestException("Invalid or expired Access Token.");
      }
      // Process the attachment data
      await this.attachmentService.processAttachment(authToken, data);

      context.getChannelRef().ack(context.getMessage());
      this.logger.log("✅ Data received from RMQ and processed successfully");
      return { status: "Data received from RMQ and processed", data };
    } catch (error) {
      this.logger.error("❌ Error processing datasource attachment:", error);
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw error;
    }
  }

  @Post("send-attachment-to-veeva")
  @UseInterceptors(TransformInterceptor)
  @UseGuards(JwtAuthGuard)
  @UsePipes(
    new ValidationPipe({
      whitelist: false, // Allow unknown properties
      forbidNonWhitelisted: false, // Don't forbid unknown properties
      transform: true,
    })
  )
  @ApiOperation({
    summary: "Send attachment to Veeva Vault via queue system",
    description:
      "This endpoint sends attachment data to the Veeva queue for immediate processing and syncing to Vault. Requires JWT authentication.",
  })
  @ApiHeader({
    name: "auth",
    description: "JWT Token for authentication (Bearer token or direct token)",
    required: true,
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        VeevaAttachmentId: {
          type: "string",
          description:
            "This is the Attachment Id of Veeva org, If this is null the attachment is created else updated",
          example: "00P5C000000VBZGUA4",
        },
        TransactionId: {
          type: "string",
          description: "Centris Side Transaction Log ID",
          example: "a3Gf4000000TWbk",
        },
        parentId: {
          type: "string",
          description: "This is the Id of EM_Event record on Veeva",
          example: "a2v5C000000YhJ0QAK",
        },
        Name: {
          type: "string",
          description: "Name of the attachment",
          example: "invoice_numbers.csv",
        },
        ContentType: {
          type: "string",
          description: "MIME type of the file",
          example: "text/csv",
        },
        Body: {
          type: "string",
          description: "Base64 encoded file content",
          example: "XyxJZCxOYW1lDQpbYWhtX19JbnZvaWNlX19jXSxhMlVE",
        },
      },
      required: ["TransactionId", "parentId", "Name", "Body"],
    },
  })
  @ApiResponse({
    status: 200,
    description: "Attachment sent to Veeva queue successfully",
    schema: {
      type: "object",
      properties: {
        TransactionDataList: {
          type: "array",
          items: {
            type: "object",
            properties: {
              VeevaTransactionId: { type: "string", example: "VT123456789" },
              CentrisReferenceId: { type: "string", example: "CRID987654321" },
            },
          },
        },
        errorMessage: { type: "array", items: { type: "string" } },
        success: { type: "boolean", example: true },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Bad Request - Invalid attachment data",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing JWT token",
  })
  @ApiResponse({
    status: 500,
    description: "Internal Server Error - Queue processing error",
  })
  async sendAttachmentToVeeva(@Body() requestData: any, @Req() req: any) {
    // Map the new structure to the existing DTO structure
    const attachmentData = {
      AttachmentId: requestData.VeevaAttachmentId || `NEW_${Date.now()}`,
      eventId: requestData.parentId,
      Name: requestData.Name,
      ContentType: requestData.ContentType,
      Body: requestData.Body,
      TransactionId: requestData.TransactionId,
      BodyLength: requestData.BodyLength || "",
    };

    return this.attachmentService.queueAttachmentForVeeva(attachmentData);
  }

  @UseInterceptors(CentrisAuthInterceptor)
  @UseGuards(JwtAuthGuard)
  @ApiHeader({
    name: "auth",
    description: "Token JWT",
    required: true,
  })
  @Post("DatasourceAttachment")
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )
  @ApiResponse({
    status: 201,
    description: "Attachment successfully created and response returned.",
  })
  @ApiBody({ type: AttachmentDto })
  async handleDatasourceAttachment(
    @Body() attachmentData: AttachmentDto,
    @CustomCentrisAuth() authData: any
  ) {
    this.logger.log("🚀 ~ AttachmentController ~ handleDatasourceAttachment");
    try {
      const response = await this.attachmentService.processAttachment(
        authData,
        attachmentData
      );
      return response;
    } catch (error) {
      this.logger.error("Error processing attachment", error);
    }
  }

  @EventPattern("datasource-attachment-handoff")
  @UseInterceptors(CentrisAuthInterceptor)
  async handleDatasourceAttachmentEvent(
    @Payload() data: any,
    @Ctx() context: RmqContext,
    @CustomCentrisAuth() authData: any
  ) {
    console.log(
      "🚀 ~ AttachmentController ~ handleDatasourceAttachmentEvent ~ authData:",
      authData
    );
    try {
      this.logger.log("data from RMQ DB Attachment", data);
      if (!authData.access_token) {
        throw new BadRequestException("Invalid or expired Access Token.");
      }
      if (
        !data ||
        !data?.transactionId ||
        !data?.res ||
        !data?.res?.attachment
      ) {
        this.logger.error("Received attachment data is invalid or empty");
        context.getChannelRef().nack(context.getMessage(), false, false);
        await this.rabbitMQService.send(
          "transaction-log",
          mapTransactionLogPayload({
            name: data.transactionId,
            direction: TRANSACTION_DIRECTIONS.CENTRIS_OUTBOUND,
            logType: "Attachment",
            success: "false",
            errorMessage: "Received attachment data is invalid or empty",
            owner: authData?.id as string,
          })
        );
        throw new Error("data missing in payload");
      }

      await this.attachmentService.processAttachment(authData, data);
      await this.rabbitMQService.send(
        "transaction-log",
        mapTransactionLogPayload({
          name: data.transactionId,
          direction: TRANSACTION_DIRECTIONS.CENTRIS_OUTBOUND,
          logType: "Attachment",
          success: "true",
          owner: authData?.id as string,
        })
      );

      context.getChannelRef().ack(context.getMessage());
      this.logger.log("data received from RMQ and processed");
      return { status: "data received from RMQ and processed", data };
    } catch (error) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      this.logger.error("Error processing attachment", error);
      await this.rabbitMQService.send(
        "transaction-log",
        mapTransactionLogPayload({
          name: data.transactionId,
          direction: TRANSACTION_DIRECTIONS.CENTRIS_OUTBOUND,
          logType: "Attachment",
          success: "false",
          errorMessage: error.message,
          owner: authData?.id as string,
        })
      );
      throw new HttpException(
        error.response?.data || "Failed to fetch Attachment",
        error.response?.status || 500,
        error.message ?? error
      );
    }
  }
}
