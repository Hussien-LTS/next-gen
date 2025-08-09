import { Module } from '@nestjs/common';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';
import { TopicController } from './topic.controller';
import { TopicService } from './topic.service';
import { JwtSharedModule } from 'src/shared/jwt-shared.module';

@Module({
  imports: [JwtSharedModule,RabbitMQModule.register('salesforce_topic_queue')],
  controllers: [TopicController],
  providers: [TopicService],
})
export class TopicModule {}
