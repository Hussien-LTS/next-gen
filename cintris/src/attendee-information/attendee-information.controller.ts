/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseGuards,
  Req,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags, ApiHeader } from "@nestjs/swagger";
import { AttendeeInformationService } from "./attendee-information.service";
import { LitsAttendeeInfoDto } from "./DTOs/attendee-info.dto";
import { JwtAuthGuard } from "src/libs/shared-auth/jwt-auth.guard";

@ApiTags("Attendee Information APIs")
@Controller("speaker-attendee")
export class AttendeeInformationController {
  constructor(
    private readonly attendeeInformationService: AttendeeInformationService
  ) {}

  @Post("list-attendees-info")
  @UseGuards(JwtAuthGuard)
  @ApiHeader({
    name: "auth",
    description: "Token JWT",
    required: true,
  })
  @ApiBody({ type: LitsAttendeeInfoDto })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      "List attendee Information from external ids from Salesforce And Send It To Veeva Vault",
  })
  async litsAttendeesInfo(
    @Req() req: any,
    @Body() payload: LitsAttendeeInfoDto
  ) {
    try {
      const authToken = req.user as Record<string, unknown>;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return await this.attendeeInformationService.litsAttendeesInfo(
        authToken,
        payload
      );
    } catch (error) {
      throw new BadRequestException({
        attendeeDetail: [],
        success: false,
        errorMessage: (error as Error)?.message,
      });
    }
  }
}
