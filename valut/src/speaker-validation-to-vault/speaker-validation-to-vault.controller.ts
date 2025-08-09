import {
  Controller,
  ForbiddenException,
  UnauthorizedException,
  Body,
  UsePipes,
  ValidationPipe,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { SessionStoreService } from 'src/sessionValidation/sessionValidation.service';
import { SyncSpeakerDto } from './DTOs/speaker-validation-sync.dto';
import { SpeakerValidationToVaultService } from './speaker-validation-to-vault.service';
import { VaultAuthInterceptor } from 'src/interceptors/vault-auth.interceptor';
import { CustomVaultAuth } from 'src/decorators/vault-auth.decorator';

@ApiTags('Update Vault Event Speaker')
@Controller('/vault/api/v1/updateSpeakerValidationinVault')
export class SpeakerValidationToVaultController {
  private sessionId: string;

  constructor(
    private readonly syncSpeakerService: SpeakerValidationToVaultService,
    private readonly sessionStore: SessionStoreService,
  ) {}

  @EventPattern('vault_auth_response')
  handleVaultAuth(@Payload() data: any, @Ctx() context: RmqContext) {
    this.sessionId = data?.sessionId;
    if (!this.sessionId) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new ForbiddenException();
    }
    this.sessionStore.set(this.sessionId);
  }

  @Post()
  @ApiBody({ type: SyncSpeakerDto })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async syncSpeakerHandler(@Body() data: SyncSpeakerDto) {
    if (!this.sessionId) {
      throw new UnauthorizedException('Session ID is missing or invalid.');
    }

    return await this.syncSpeakerService.syncEventSpeakerInfo(
      data,
      this.sessionId,
    );
  }
  @EventPattern('datasource_speaker_validation_updated')
  @UseInterceptors(VaultAuthInterceptor)
  async syncSpeakerHandlerFromRMQ(
    @Payload() data: any,
    @CustomVaultAuth() vaultData: any,
  ) {
    console.log(
      '🚀 ~ SpeakerValidationToVaultController ~ syncSpeakerHandlerFromRMQ ~ data:',
      data,
    );
    return await this.syncSpeakerService.syncEventSpeakerInfo(data, vaultData);
  }
}
