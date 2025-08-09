/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBadRequestResponse,
  ApiBody,
  ApiHeader,
} from "@nestjs/swagger";
import { SpeakerQualificationService } from "./speaker-qualification.service";
import { CreateSpeakerQualificationsDto } from "./DTOs/create-speaker-qualifications.dto";
import { JwtAuthGuard } from "src/libs/shared-auth/jwt-auth.guard";
import { TransformInterceptor } from "src/shared/interceptors/transform.interceptor";

@ApiTags("Speaker Qualification APIs")
@Controller("speaker-qualification")
export class SpeakerQualificationController {
  constructor(
    private readonly speakerQualificationService: SpeakerQualificationService
  ) {}

  @Post("/create")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransformInterceptor)
  @ApiHeader({
    name: "auth",
    description: "Token JWT",
    required: true,
  })
  @ApiBody({
    type: CreateSpeakerQualificationsDto,
    description: "Create Speaker Qualifications In Vault",
    required: true,
  })
  @ApiOperation({
    summary: "Create Multiple Speaker Qualifications In Vault",
  })
  @ApiResponse({
    status: 200,
    description:
      "Create Speaker Qualification information successfully In Vault",
    example: {
      TransactionDataList: [
        {
          VeevaTransactionId: "AEBA433E-F36B-1410-8821-002D8AA5FE0E",
          CentrisReferenceId: "a3Gf4000000TV0KEAW",
        },
      ],
      errorMessage: [],
      success: true,
    },
  })
  @ApiBadRequestResponse({
    description: "Bad Request Errors",
    examples: {
      tokenError: {
        summary: "Authorization Error",
        value: {
          message: "Invalid or expired Access Token.",
          error: "Bad Request",
          statusCode: 400,
        },
      },
    },
  })
  async createSpeakerQualifications(
    @Body() payload: CreateSpeakerQualificationsDto,
    @Req() req: any
  ) {
    const authToken = req.user as Record<string, unknown>;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.speakerQualificationService.createSpeakerQualifications(
      authToken,
      payload
    );
  }
}
