import { Module } from '@nestjs/common';
import { AuthConfigService } from './auth-config.service';
import { AuthConfigController } from './auth-config.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthConfig } from 'src/entities/auth-config';
import { CryptoModule } from 'src/crypto/crypto.module';
import { CryptoService } from 'src/crypto/crypto.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuthConfig])],
  providers: [AuthConfigService, CryptoService],
  controllers: [AuthConfigController],
})
export class AuthConfigModule {}
