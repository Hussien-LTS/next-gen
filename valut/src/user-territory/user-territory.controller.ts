import {
  Controller,
  BadRequestException,
  Post,
  HttpStatus,
  HttpCode,
  Body,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBadRequestResponse,
  ApiBody,
} from '@nestjs/swagger';
import { UserTerritoryService } from './user-territory.service';
import { UpsertUserTerritoriesDto } from './DTOs/upsert-user-territories.dto';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

@ApiTags('user territory')
@Controller('user-territory')
export class UserTerritoryController {
  private currentSession: string | null = null;
  private authToken: Record<string, unknown> | null = null;
  constructor(private readonly userTerritoryService: UserTerritoryService) {}

  @EventPattern('vault_auth_response')
  handleAuthResponse(
    @Payload() data: Record<string, unknown>,
    @Ctx() context: RmqContext,
  ) {
    console.log('Auth from RMQ', data);
    console.log('Auth from RMQ SessionID (Veeva  Vault) ', data.sessionId);

    const sessionId = data?.sessionId as string;
    if (!sessionId) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new Error('Session ID missing in payload');
    }
    this.currentSession = sessionId;
    this.authToken = data;
    return { status: 'session_received from RMQ', sessionId };
  }

  @Post()
  @ApiBody({
    type: UpsertUserTerritoriesDto,
    description: 'User Territory Ids',
    required: true,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'list user territories by ids from Veeva Vault' })
  @ApiResponse({
    status: 200,
    description: 'list user territories by ids from Veeva Vault',
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
      userIdError: {
        summary: 'Entering Wrong User Territory Id That Does Not Have User',
        value: {
          message: 'The provided user territory id does not have a user',
          error: 'Bad Request',
          statusCode: 400,
        },
      },
      territoryIdError: {
        summary:
          'Entering Wrong User Territory Id That Does Not Have Territory',
        value: {
          message: 'The provided user territory id does not have a territory',
          error: 'Bad Request',
          statusCode: 400,
        },
      },
    },
  })
  async upsertUserTerritories(@Body() payload: UpsertUserTerritoriesDto) {
    const authToken = this.authToken;

    if (!authToken) {
      throw new BadRequestException('Invalid or expired session ID.');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.userTerritoryService.upsertUserTerritories(
      authToken,
      payload,
    );
  }
}
