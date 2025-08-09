import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { HttpModule } from '@nestjs/axios';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';

@Module({
  imports: [HttpModule, RabbitMQModule.register('user_vault_queue')],

  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
