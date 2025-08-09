import { Module } from '@nestjs/common';
import { AuthHanddOffService } from './auth-handd-off.service';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';


@Module({
  imports: [RabbitMQModule.register('vault_auth_handOff_queue')],
  providers: [AuthHanddOffService],
  exports: [AuthHanddOffService],
})
export class AuthHanddOffModule {}
