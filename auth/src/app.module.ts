import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VeevaVaultAuthModule } from './veeva-vault-auth/veeva-vault-auth.module';
import { SalesforceAuthModule } from './salesforce-auth/salesforce-auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    VeevaVaultAuthModule,
    SalesforceAuthModule,
  ],
})
export class AppModule {}
