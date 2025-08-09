import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import axios from "axios";
import { VeevaEventWrapperDto } from "./DTOs/add-Interaction.dto";
import { ConfigService } from "@nestjs/config";
import { RabbitMQService } from "src/shared/rabbitmq/rabbitmq.service";
import * as qs from "qs";
@Injectable()
export class CentrisEventService {
  private readonly logger = new Logger(CentrisEventService.name);
  private readonly baseUrl: any;
  constructor(
    private readonly configService: ConfigService,
    private readonly RMQService: RabbitMQService
  ) {
    this.baseUrl = this.configService.get<string>("SALESFORCE_URL");
  }
  async sendInteraction(auth: string, data: any): Promise<any> {
    try {
      const baseUrl = `${this.baseUrl}/add/interaction`;
      const response = await axios.post(baseUrl, data, {
        headers: {
          Authorization: `Bearer ${auth}`,
          "Content-Type": "application/json",
        },
      });
      if (response) {
        this.logger.log("Interaction sent successfully");
      }
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || "Salesforce API call failed",
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  async sendToSalesforce(auth: any, data: any): Promise<any> {
    try {
      const baseUrl = `${auth.serverUrl}/services/apexrest/add/interaction`;
      const response = await axios.post(baseUrl, data, {
        headers: {
          Authorization: `Bearer ${auth.access_token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      if (response) {
        this.logger.log("Interaction sent successfully");
      }
      return response.data.TransactionDataList || [];
    } catch (error) {
      return error.response?.data;
    }
  }

  async expansionEventCentris(body: any) {
    const vaultEventPayload = await this.transformToVaultFormat(body);
    const d = await this.RMQService.send(
      "centris_to_vaultt",
      vaultEventPayload
    );
    console.log("RMQ response form vault", d);
    const result = await this.RMQService.send("centris-to-db", body);
    return {
      VeevaTransactionId: result.Id,
      CentrisReferenceId: body.veevaEvent?.[0].transactionId,
      success: result?.isError ? !result?.isError : true,
      errorMessage: result?.message,
    };
  }

  private transformToVaultFormat(centrisEvent: any): any {
    const event = centrisEvent?.veevaEvent?.[0];
    if (!event) return null;
    const formatDate = (dateString: string): string => {
      if (!dateString) return "";
      try {
        // Replace space with T and add .000Z for ISO format
        return new Date(dateString.replace(" ", "T") + ".000Z").toISOString();
      } catch {
        return "";
      }
    };
    const data = {
      id: event.EventId,
      name__v: event.EventName,
      actual_cost__v: "61935",
      attendee_reconciliation_complete__v: event.ReconcilationStatus || "true",
      city__v: event.VenueCity,
      committed_cost__v: "663",
      description__v: event["Description"],
      end_date__v: event.EndDateLocal,
      end_time__v: formatDate(event.EndDateTime),
      estimated_attendance__v: event.EstimatedAttendance,
      estimated_cost__v: "663",
      external_id__v: event.VenueExternalId || "",
      event_display_name__v: event.EventName || "",
      location__v: event.Location_Type || "",
      postal_code__v: event.VenuePostalCode,
      start_date__v: event.StartDateLocal || "",
      start_time__v: formatDate(event.StartDateTime) || "",
      state_province__v: event.VenueState,
      em_event_status__v: "closed__v",
      venue__v: event.VenueName,
      ownerid__v: event.OwnerID,
      stage__v: "",
      address__v: "",
      country__v: "",
      cancellation_reason__v: "other__v",
      time_zone__v: "america_new_york__sys",
      start_time_local__v: event.StartTimeLocal || "",
      end_time_local__v: event.EndTimeLocal || "",
      approval_comment__c: "",
      centris_id__c: event.transactionId,
      event_approval_type__c: "oob_manual__c",
    };
    return data;
    // return JSON.stringify(data, null, 2);
  }
}
