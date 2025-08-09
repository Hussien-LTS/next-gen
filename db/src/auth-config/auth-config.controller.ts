import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AuthConfigService } from './auth-config.service';
import { AuthConfigDto } from './DTOs/auth-config.dto';

@Controller('auth-config')
export class AuthConfigController {
  constructor(private readonly authConfigService: AuthConfigService) {}

  @EventPattern('get_auth_config_by_auth_key')
  async handleGetAuthConfig(@Payload() payload: any) {
    const authKey: string = payload?.value ?? payload;
    return this.authConfigService.getByAuthKey(authKey);
  }

  @EventPattern('patch_auth_config_by_auth_key')
  async handlePatchAuthConfig(@Payload() payload: AuthConfigDto) {
    console.log(
      '🚀 ~ AuthConfigController ~ handlePatchAuthConfig ~ payload:',
      payload,
    );

    return this.authConfigService.patchByAuthKey(payload);
  }
  @EventPattern('datasource_config_auth')
  async handleGetAuthConfigRMQ(@Payload() payload: {authKey:string}) {
    const {authKey}=payload;
    return this.authConfigService.getByAuthKey(authKey);
  }
}
