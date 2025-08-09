import { Module } from '@nestjs/common';
import { VaultService } from './vault.service';
import { VaultController } from './vault.controller';
import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
  providers: [VaultService],
  controllers: [VaultController],
  imports: [HttpModule]
})
export class VaultModule { }
