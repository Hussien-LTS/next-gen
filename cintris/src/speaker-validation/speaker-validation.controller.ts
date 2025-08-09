import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";
import { SpeakerValidationService } from "./speaker-validation.service";
import { ApiBody, ApiResponse } from "@nestjs/swagger";
import { SpeakerValidationDTO } from "./DTOs/speaker-validation.dto";
import { CentrisAuthInterceptor } from "src/interceptors/centris-auth.interceptor";
import { CustomCentrisAuth } from "src/decorators/centris-auth.decorator";

@Controller("centris/api/v1/checkSpeakerValidationinCentris")
export class SpeakerValidationController {
  private access_token: string | null = null;

  constructor(
    private readonly speakerValidationService: SpeakerValidationService
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

  @Post("validate-speaker")
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )
  @ApiBody({ type: SpeakerValidationDTO })
  @ApiResponse({
    status: 201,
    description: "Speaker validation request processed successfully.",
  })
  async validateSpeaker(@Body() speakerInfo: SpeakerValidationDTO) {
    if (!this.access_token) {
      throw new UnauthorizedException("Access token is missing");
    }
    const { speakerinformation } = speakerInfo;
    const response = await this.speakerValidationService.validateSpeaker(
      this.access_token,
      speakerinformation
    );
    return response;
  }

  @UseInterceptors(CentrisAuthInterceptor)
  @EventPattern("datasource_speaker_validation_created")
  async validateSpeakerFromRMQ(
    @Payload() speakerData: SpeakerValidationDTO,
    @CustomCentrisAuth() authData: any
  ) {
    if (!this.access_token) {
      throw new UnauthorizedException("Access token is missing");
    }
    const response = await this.speakerValidationService.validateSpeaker(
      this.access_token,
      speakerData
    );
    return response;
  }
}
