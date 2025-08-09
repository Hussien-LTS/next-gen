import { Module } from '@nestjs/common';
import { TopicController } from './topic.controller';
import { HttpModule } from '@nestjs/axios';
import { TopicService } from './topic.service';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';

@Module({
  imports: [HttpModule, RabbitMQModule.register('topic_vault_queue')],
  controllers: [TopicController],
  providers: [TopicService],
})
export class TopicModule {}
