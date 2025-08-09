import { Module } from '@nestjs/common';
import { VeevaVaultAuthController } from './veeva-vault-auth.controller';
import { VeevaVaultAuthService } from './veeva-vault-auth.service';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, RabbitMQModule.register('vault_auth_queue')],
  controllers: [VeevaVaultAuthController],
  providers: [VeevaVaultAuthService],
})
export class VeevaVaultAuthModule {}
