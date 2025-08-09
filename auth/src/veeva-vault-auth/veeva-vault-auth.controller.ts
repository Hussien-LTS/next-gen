import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { VeevaVaultAuthService } from './veeva-vault-auth.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller('veeva-vault-auth')
export class VeevaVaultAuthController {
  constructor(private readonly vaultAuthService: VeevaVaultAuthService) {}
  @Post('vault/auth')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        password: { type: 'string' },
        serverUrl: { type: 'string' },
        client_id: { type: 'string' },
      },
      required: ['username', 'password', 'serverUrl', 'client_id'],
    },
  })
  async vaultAuth(@Body() body: any): Promise<any> {
    return await this.vaultAuthService.authenticate(body);
  }

  @EventPattern('get_vault_auth')
  async vaultAuthRMQ(
    @Payload() payload: { authKey: string },
    @Ctx() context: RmqContext,
  ) {
    console.log(
      '🚀 ~ VeevaVaultAuthController ~ vaultAuthRMQ ~ payload:',
      payload,
    );
    if (!payload?.authKey) return new BadRequestException('missing auth key');

    const { authKey } = payload;
    const result = await this.vaultAuthService.getVaultAuth(authKey);
    console.log('🚀 ~ VeevaVaultAuthController ~ vaultAuthRMQ ~ result:', result);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    context.getChannelRef().ack(context.getMessage());

    return result;
  }
}
