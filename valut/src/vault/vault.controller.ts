import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { VaultService } from './vault.service';
import { ApiTags, ApiBearerAuth, ApiHeader, ApiOperation } from '@nestjs/swagger';
import { VaultAuthDto } from './models/vaultauth.model';

@ApiTags('Vault')
@Controller('vault')
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Post('documents')
  @ApiOperation({ summary: 'Fetch Vault documents' })
  async getDocuments( @Body() vauktAuth:VaultAuthDto) {
    return this.vaultService.getDocuments(vauktAuth.authorization,vauktAuth.clientId);
  }


  @Post('events')
  @ApiOperation({ summary: 'Fetch Vault documents events' })
  async fetchEvents(@Body() vauktAuth:VaultAuthDto) {
    return this.vaultService.getDocumentEvents(vauktAuth.authorization,vauktAuth.clientId);
  }
}
