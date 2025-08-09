import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";
import { AttendeeValidationService } from "./attendee-validation.service";
import { ApiBody, ApiResponse } from "@nestjs/swagger";
import { AttendeeValidationDTO } from "./DTOs/attendee-validation.dto";
import { CentrisAuthInterceptor } from "src/interceptors/centris-auth.interceptor";
import { CustomCentrisAuth } from "src/decorators/centris-auth.decorator";

@Controller("centris/api/v1/checkAttendeeValidationInCentris")
export class AttendeeValidationController {
  private access_token: string | null = null;

  constructor(
    private readonly attendeeValidationService: AttendeeValidationService
  ) {}

  @EventPattern("salesforce_auth_response")
  handleAuthResponse(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log("Auth from RMQ", data);
    const access_token = data?.access_token;
    this.access_token = access_token;
    if (!access_token) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new Error("access_token missing in payload");
    }
    context.getChannelRef().ack(context.getMessage());
    return { status: "access_token received from RMQ", access_token };
  }

  @Post("validate-attendee")
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )
  @ApiBody({ type: AttendeeValidationDTO })
  @ApiResponse({
    status: 201,
    description: "Attendee validation request processed successfully.",
  })
  async validateAttendee(@Body() attendeeInfo: AttendeeValidationDTO) {
    if (!this.access_token) {
      throw new UnauthorizedException("Access token is missing");
    }
    const { speakerinformation } = attendeeInfo;
    const response = await this.attendeeValidationService.validateAttendee(
      this.access_token,
      speakerinformation
    );
    return response;
  }

  @UseInterceptors(CentrisAuthInterceptor)
  @EventPattern("datasource_attendee_validation_created")
  async validateAttendeeFromRMQ(
    @Payload() attendeeData: AttendeeValidationDTO,
    @CustomCentrisAuth() authData: any
  ) {
    console.log(
      "🚀 ~ AttendeeValidationController ~ validateAttendeeFromRMQ ~ attendeeData:",
      attendeeData
    );

    if (!authData.access_token) {
      throw new BadRequestException("Invalid or expired Access Token.");
    }
    const response = await this.attendeeValidationService.validateAttendee(
      this.access_token,
      attendeeData
    );
    return response;
  }
}
