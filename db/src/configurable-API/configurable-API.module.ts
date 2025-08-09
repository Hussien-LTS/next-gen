import { Module } from '@nestjs/common';
import { ConfigurableApiController } from './configurable-API.controller';
import { ConfigurableApiService } from './configurable-API.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigurableApi } from 'src/entities/configurable-API.entity';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConfigurableApi]),
    RabbitMQModule.register('datasource_configurable_API_queue'),
  ],
  controllers: [ConfigurableApiController],
  providers: [ConfigurableApiService],
  exports: [ConfigurableApiService],
})
export class ConfigurableApiModule {}
