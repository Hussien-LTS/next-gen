import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { CentrisEventService } from "./event.service";
import { ApiBody, ApiHeader, ApiOperation, ApiTags } from "@nestjs/swagger";
import { VeevaEventWrapperDto } from "./DTOs/add-Interaction.dto";
import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";
import { JwtAuthGuard } from "src/libs/shared-auth/jwt-auth.guard";
import { EventPayloadDto } from "./DTOs/event-expansion.dto";
import { TransformInterceptor } from "src/shared/interceptors/transform.interceptor";
import { AuthHanddOffService } from "src/auth-handd-off/auth-handd-off.service";

@ApiTags("Centris")
// @UseGuards(JwtAuthGuard)
@Controller("Centris")
export class EventController {
  private access_token: string | null = null;
  private payload: any;
  constructor(
    private readonly centrisEventService: CentrisEventService,
    private readonly AuthHanddOffService: AuthHanddOffService
  ) {}

  @EventPattern("salesforce_auth_response")
  async handleAuthResponse(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log("Auth from RMQ", data);
    const access_token = data?.access_token;
    if (!access_token) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new Error("access_token missing in payload");
    }
    this.access_token = access_token;
    context.getChannelRef().ack(context.getMessage());
    return { status: "access_token received from RMQ", access_token };
  }
  @Post("interaction")
  @ApiHeader({
    name: "auth",
    description: " Centris Token JWT",
    required: true,
  })
  @ApiBody({ type: VeevaEventWrapperDto })
  async postInteraction(
    @Headers() headers: Record<string, string>,
    @Body() veevaEventWrapperDto: any
  ) {
    if (this.access_token) {
      console.log("Using RMQ access_token:", this.access_token);
      const res = await this.centrisEventService.sendInteraction(
        this.access_token,
        veevaEventWrapperDto
      );
      if (res.success === true) {
        return res;
      }
    }
    const authToken = headers["auth"];
    return this.centrisEventService.sendInteraction(
      authToken,
      veevaEventWrapperDto
    );
  }

  @EventPattern("datasource-event-created-to-sf")
  async catchPayload(@Payload() data: any, @Ctx() context: RmqContext) {
    try {
      const res = await this.AuthHanddOffService.handleAuthHandOff();
      this.payload = data;
      console.log("this.payload", data);
      const result = await this.centrisEventService.sendToSalesforce(
        res,
        this.payload
      );
      context.getChannelRef().ack(context.getMessage());
      return result.TransactionDataList;
    } catch (error) {
      console.error("Error processing message:", error);
      context.getChannelRef().nack(context.getMessage(), false, false);
      return { error: "Failed to process message" };
    }
  }
  @Post("expansion/v/event")
  async sendInteraction() {
    console.log("data", this.payload);
    const result = await this.centrisEventService.sendToSalesforce(
      this.access_token,
      this.payload
    );
    return {
      msg: "event data sent to centris with expansion data sucssfully",
      res: result.TransactionDataList,
    };
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransformInterceptor)
  @ApiHeader({
    name: "auth",
    description: "Token JWT",
    required: true,
  })
  @ApiBody({ type: EventPayloadDto })
  @Post("expansion/c/event")
  async expansionEventCentris(@Body() body: any, @Req() req: any) {
    req.headers["auth"];
    return await this.centrisEventService.expansionEventCentris(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get("protected")
  @ApiHeader({
    name: "auth",
    description: "Token JWT",
    required: true,
  })
  protectedRoute(@Req() req: any) {
    const token = req.headers["auth"];
    console.log("Token", token);
    return { message: "Access granted" };
  }
}
