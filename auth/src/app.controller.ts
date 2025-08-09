import { Body, Controller, Get, Post } from '@nestjs/common';
import { SalesforceAuthService } from './salesforce-auth.service';
import { VaultAuthService } from './vault-auth.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('Vault & Salesforce Auth')
@Controller()
export class AppController {
  constructor(private readonly salesforceAuthService: SalesforceAuthService, private readonly vaultAuthService: VaultAuthService) { }

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
      },
      required: ['username', 'password', 'client_id', 'client_secret', 'grant_type'],
    },
  })
  async salesforceAuth(@Body() body: any): Promise<any> {
    return await this.salesforceAuthService.getTokenAndSend(body);
  }

  @Post('vault/auth')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        password: { type: 'string' },
      },
      required: ['username', 'password'],
    },
  })
  async vaultAuth(@Body() body: any): Promise<any> {
    return await this.vaultAuthService.authenticate(body);
  }
}