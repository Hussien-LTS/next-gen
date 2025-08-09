import {
  HttpException,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { RabbitMQService } from "src/shared/rabbitmq/rabbitmq.service";
import { AttachmentDto, AttachmentProcessResult } from "./dtos/attachment.dto";
import axios from "axios";

@Injectable()
export class AttachmentService {
  private readonly logger = new Logger(AttachmentService.name);
  private readonly baseUrl: string | undefined;
  constructor(
    private readonly configService: ConfigService,
    private rabbitMQService: RabbitMQService
  ) {
    this.baseUrl = this.configService.get<string>("SALESFORCE_URL");
  }

  async processAttachment(
    authData: any,
    attachmentData: any
  ): Promise<AttachmentProcessResult> {
    this.logger.log("🚀 ~ In AttachmentService ~ processAttachment:");
    console.log(
      "🚀 ~ AttachmentService ~ processAttachment ~ attachmentData:",
      attachmentData
    );
    try {
      if (!authData?.access_token || !authData?.serverUrl) {
        throw new UnauthorizedException("Missing SF auth");
      }
      const { access_token, serverUrl } = authData;
      const receivedAttachment = attachmentData.res;
      console.log(
        "🚀 ~ AttachmentService ~ receivedAttachment",
        receivedAttachment
      );
      if (
        !receivedAttachment ||
        receivedAttachment?.base64 ||
        !receivedAttachment?.attachment
      ) {
        this.logger.error("Received attachment data is invalid or empty");
        return {
          success: false,
          message: "Attachment Sync Failed in Centris",
        };
      }

      const mappedData = {
        Body: receivedAttachment.base64,
        ContentType: receivedAttachment.attachment.ContentType,
        Name: receivedAttachment.attachment.Name,
        parentId: receivedAttachment.attachment.ExternalRecordId,
        VeevaAttachmentId: receivedAttachment.Id,
        TransactionId: receivedAttachment.attachment.TransactionId,
      };
      console.log(
        "🚀 ~ AttachmentService ~ processAttachment ~ mappedData:",
        mappedData
      );
      const baseUrl = `${serverUrl}/services/apexrest//DocumentAttachment`;
      const response = await axios.post(baseUrl, mappedData, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        validateStatus: () => true,
      });
      console.log(
        "🚀 ~ AttachmentService ~ processAttachment ~ response:",
        response.data
      );

      if (response?.data?.AttachmentId) {
        this.logger.log(`Attachments Fetched Successfully`);
      }

      if (response?.data?.errors) {
        this.logger.log(
          "🚀 ~ In AttachmentService ~ processAttachment: Attachment Sync Failed in Centris"
        );
        return {
          success: false,
          message: "Attachment Sync Failed in Centris",
        };
      }
      this.logger.log(
        "🚀 ~ In AttachmentService ~ processAttachment: Attachment Sync Successfully in Centris"
      );
      return {
        success: true,
        message: "Attachment Sync Successfully in Centris",
      };
    } catch (error) {
      this.logger.error("Error Fetching Attachment", error?.message || error);
      throw new HttpException(
        error.response?.data || "Failed to fetch Attachment",
        error.response?.status || 500,
        error.message ?? error
      );
    }
  }

  async queueAttachmentForVeeva(attachmentData: any): Promise<any> {
    try {
      const res = await this.rabbitMQService.send(
        "centris-attachment-to-veeva",
        {
          AttachmentId: attachmentData.AttachmentId,
          Name: attachmentData.Name,
          Body: attachmentData.Body,
          ContentType: attachmentData.ContentType,
          BodyLength: attachmentData.BodyLength,
          eventId: attachmentData.eventId,
          TransactionId: attachmentData.TransactionId,
          source: "centris",
          status: "PENDING_VAULT_SYNC",
          timestamp: new Date().toISOString(),
        }
      );

      return {
        VeevaTransactionId: res?.Id,
        CentrisReferenceId: attachmentData.TransactionId,
        success: res?.isError ? !res?.isError : true,
        errorMessage: res?.errorMessage || res?.message || "",
      };
    } catch (error) {
      this.logger.error(
        `Failed to queue attachment for Veeva sync: ${error.message}`
      );

      return {
        VeevaTransactionId: null,
        CentrisReferenceId: attachmentData.TransactionId,
        success: false,
        errorMessage: `Failed to queue attachment for Veeva sync: ${error.message}`,
      };
    }
  }
}
