import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { SalesforceAuthService } from './salesforce-auth.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller('salesforce-auth')
export class SalesforceAuthController {
  constructor(private readonly salesforceAuthService: SalesforceAuthService) {}
  @Post('salesforce/auth')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        password: { type: 'string' },
        client_id: { type: 'string' },
        client_secret: { type: 'string' },
        grant_type: { type: 'string' },
        serverUrl: { type: 'string' },
      },
      required: [
        'username',
        'password',
        'client_id',
        'client_secret',
        'grant_type',
        'serverUrl',
      ],
    },
  })
  async salesforceAuth(@Body() body: any): Promise<any> {
    return await this.salesforceAuthService.getTokenAndSend(body);
  }

  @EventPattern('get_centris_auth')
  async vaultAuthRMQ(
    @Payload() payload: { authKey: string },
    @Ctx() context: RmqContext,
  ): Promise<any> {
    try {
      console.log(
        '🚀 ~ VeevaVaultAuthController ~ vaultAuthRMQ ~ payload:',
        payload,
      );
      if (!payload?.authKey) return new BadRequestException('missing auth key');

      const { authKey } = payload;
      context.getChannelRef().ack(context.getMessage());
      return await this.salesforceAuthService.getCentrisAuth(authKey);
    } catch (error) {
      context.getChannelRef().nack(context.getMessage(), false);
      throw new Error(`Error in vaultAuthRMQ: ${error.message}`);
    }
  }
}
