import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Param,
  Put,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TerritoryService } from './territory.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { SessionStoreService } from '../sessionValidation/sessionValidation.service';
import { VeevaAuthDTO } from '../shared/DTOs/vault-auth.dto';

@ApiTags('territory')
@Controller('territory')
export class TerritoryController {
  private sessionId: string;

  constructor(
    private readonly territoryService: TerritoryService,
    private readonly sessionStore: SessionStoreService,
  ) {}

  @EventPattern('vault_auth_response')
  handleVaultAuth(@Payload() data: VeevaAuthDTO, @Ctx() context: RmqContext) {
    console.log('🚀 ~ TerritoryController ~ handleVaultAuth ~ data:', data);
    this.sessionId = data?.sessionId;
    if (!this.sessionId) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new ForbiddenException();
    }

    this.sessionStore.set(data.sessionId);
  }

  @Get()
  @ApiBearerAuth('vault-auth')
  @ApiOperation({ summary: 'List All territories from Veeva Vault' })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'List of all territories from Veeva Vault',
  })
  @ApiResponse({ status: 400, description: 'Missing or invalid token' })
  async listAllTerritories(@Headers() headers: Record<string, string>) {
    const authToken = headers['auth'];
    return await this.territoryService.listAllTerritories(authToken);
  }
  @Get(':id')
  @ApiOperation({ summary: 'retreive territory by id from Veeva Vault' })
  @ApiResponse({
    status: 200,
    description: 'retreive territory by id from Veeva Vault',
  })
  @ApiResponse({ status: 400, description: 'Missing or invalid token' })
  async listTerritoryById(@Param('id') id: string) {
    if (!this.sessionId) {
      throw new UnauthorizedException();
    }
    return await this.territoryService.listTerritoryById(this.sessionId, id);
  }

  @Put(':territoryId')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiParam({
    name: 'territoryId',
    description: 'ID of the territory to update',
  })
  @ApiBearerAuth('vault-auth')
  @ApiOperation({ summary: 'Update territory by id in Veeva Vault' })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiBody({
    type: Object,
    description: 'territory Object',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'territory updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateSpeaker(
    @Headers() headers: Record<string, string>,
    @Param('territoryId') territoryId: string,
    @Body() body: any,
  ) {
    const authToken = headers['auth'];
    if (!authToken) {
      throw new HttpException(
        'Missing Authorization header',
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.territoryService.updateTerritory(
      authToken,
      territoryId,
      body,
    );
  }
}
