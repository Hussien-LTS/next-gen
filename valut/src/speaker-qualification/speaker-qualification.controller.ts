/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBadRequestResponse,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { SpeakerQualificationService } from './speaker-qualification.service';
import { CreateSpeakerQualificationsDto } from './DTOs/create-speaker-qualifications.dto';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { JwtAuthGuard } from 'src/libs/shared-auth/jwt-auth.guard';
import { AuthHanddOffService } from 'src/auth-handd-off/auth-handd-off.service';

@ApiTags('Speaker Qualification APIs')
@Controller('speaker-qualification')
export class SpeakerQualificationController {
  constructor(
    private readonly speakerQualificationService: SpeakerQualificationService,
    private readonly AuthHanddOffService: AuthHanddOffService,
  ) {}

  @EventPattern('sync-speaker-qualification-from-centris-to-vault')
  async syncSpeakerQualificationsFromCentrisToVault(
    @Payload() data: Record<string, unknown>,
    @Ctx() context: RmqContext,
  ) {
    try {
      console.log('speakerQualificationsData from RMQ', data);

      if (!data) {
        context.getChannelRef().nack(context.getMessage(), false, false);
        throw new Error('data missing in payload');
      }

      const vaultCredentials =
        (await this.AuthHanddOffService.handleAuthHandOff()) as {
          sessionId: string;
          clientId: string;
          serverUrl: string;
        };

      // ! todo important discuss this issue
      vaultCredentials.serverUrl = `${vaultCredentials?.serverUrl}/api/v25.1`;

      const user = data.userAccessToken as Record<string, unknown>;

      const payload = data?.payload as CreateSpeakerQualificationsDto;

      const result =
        (await this.speakerQualificationService.createSpeakerQualifications(
          vaultCredentials,
          user,
          payload,
        )) as Record<string, unknown>;

      context.getChannelRef().ack(context.getMessage());

      return result;
    } catch (err) {
      const error = err as { message: string; code?: string };

      context.getChannelRef().ack(context.getMessage());

      console.log(
        'the syncSpeakerQualificationsFromCentrisToVault service has error:',
        error.message,
      );

      return {
        isError: true,
        message: error.message,
      };
    }
  }

  @EventPattern('create-speaker-qualification-transaction-log')
  async createSpeakerQualificationsTransactionLog(
    @Payload() data: Record<string, unknown>,
    @Ctx() context: RmqContext,
  ) {
    console.log('Data from RMQ', data);
    if (!data) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new Error('data missing in payload');
    }

    const result =
      await this.speakerQualificationService.createSpeakerQualificationTransactionLog(
        data,
      );

    context.getChannelRef().ack(context.getMessage());

    return result;
  }

  @Post('/create')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiHeader({
    name: 'auth',
    description: 'Token JWT',
    required: true,
  })
  @ApiBody({
    type: CreateSpeakerQualificationsDto,
    description: 'Create Speaker Qualifications In Vault',
    required: true,
  })
  @ApiOperation({
    summary: 'Create Multiple Speaker Qualifications In Vault',
  })
  @ApiResponse({
    status: 200,
    description:
      'Create Speaker Qualification information successfully In Vault',
    example: {
      success: true,
      message:
        'Speaker Qualification information successfully saved in AWS Instance',
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad Request Errors',
    examples: {
      tokenError: {
        summary: 'Authorization Error',
        value: {
          message: 'Invalid or expired session ID.',
          error: 'Bad Request',
          statusCode: 400,
        },
      },
    },
  })
  async createSpeakerQualifications(
    @Body() payload: CreateSpeakerQualificationsDto,
    @Req() req: Record<string, unknown>,
  ) {
    const user = req.user as Record<string, unknown>;

    const vaultCredentials =
      (await this.AuthHanddOffService.handleAuthHandOff()) as {
        sessionId: string;
        clientId: string;
        serverUrl: string;
      };

    // ! todo important discuss this issue
    vaultCredentials.serverUrl = `${vaultCredentials?.serverUrl}/api/v25.1`;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.speakerQualificationService.createSpeakerQualifications(
      vaultCredentials,
      user,
      payload,
    );
  }
}
