import { Module } from '@nestjs/common';
import { SalesforceAuthController } from './salesforce-auth.controller';
import { SalesforceAuthService } from './salesforce-auth.service';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';

@Module({
  imports: [ConfigModule, RabbitMQModule.register('salesforce_auth_queue')],
  controllers: [SalesforceAuthController],
  providers: [SalesforceAuthService],
})
export class SalesforceAuthModule {}
