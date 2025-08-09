import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RABBITMQ_CLIENT } from '../constants/rabbitmq.constants';
import { RabbitMQService } from './rabbitmq.service';
@Module({})
export class RabbitMQModule {
  static register(queue: string): DynamicModule {
    return {
      module: RabbitMQModule,
      imports: [
        ConfigModule,
        ClientsModule.registerAsync([
          {
            name: RABBITMQ_CLIENT,
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) =>
              ({
                transport: Transport.RMQ,
                options: {
                  urls: [configService.get<string>('RABBITMQ_URL')],
                  queue,
                  queueOptions: {
                    durable: false,
                  },
                },
              }) as any,
            inject: [ConfigService],
          },
        ]),
      ],
      providers: [RabbitMQService],
      exports: [RabbitMQService],
    };
  }
}
