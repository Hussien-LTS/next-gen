import { Body, Controller, ForbiddenException, Post, UnauthorizedException, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { SessionStoreService } from 'src/sessionValidation/sessionValidation.service';
import { SyncAttendeeDto } from './DTOs/attendee-validation-sync.dto';
import { ApiBody } from '@nestjs/swagger';
import { VaultAuthInterceptor } from 'src/interceptors/vault-auth.interceptor';
import { CustomVaultAuth } from 'src/decorators/vault-auth.decorator';
import { AttendeeValidationToVaultService } from './attendee-validation-to-vault.service';

@Controller('/vault/api/v1/updateAttendeeValidationInVault')
export class AttendeeValidationToVaultController {
  private sessionId: string;

  constructor(
    private readonly syncAttendeeService: AttendeeValidationToVaultService,
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
  @ApiBody({ type: SyncAttendeeDto })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async syncAttendeeHandler(@Body() data: SyncAttendeeDto) {
    if (!this.sessionId) {
      throw new UnauthorizedException('Session ID is missing or invalid.');
    }

    return await this.syncAttendeeService.syncEventAttendeeInfo(
      data,
      this.sessionId,
    );
  }
  @EventPattern('datasource_attendee_validation_updated')
  @UseInterceptors(VaultAuthInterceptor)
  async syncAttendeeHandlerFromRMQ(
    @Payload() data: any,
    @CustomVaultAuth() vaultData: any,
  ) {
    console.log("🚀 ~ AttendeeValidationToVaultController ~ syncAttendeeHandlerFromRMQ ~ data:", data)
  
    return await this.syncAttendeeService.syncEventAttendeeInfo(data, vaultData);
  }
}
