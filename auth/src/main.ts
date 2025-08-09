import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: 'https://veeva-admin-ui-dev.radiusdirect.net',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Vault & Salesforce Auth API')
    .setDescription('APIs to authenticate with Veeva Vault & Salesforce')
    .setVersion('1.0')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, swaggerDocument);

  const rabbitMqUrl = configService.get<string>('RABBITMQ_URL');
  console.log('🚀 ~ bootstrap ~ rabbitMqUrl:', rabbitMqUrl);
  if (!rabbitMqUrl) {
    throw new Error('RABBITMQ_URL is not configured');
  }

  const queues = [
    'budget_vault_queue',
    'venue_vault_queue',
    'salesforce-territory_queue',
    'salesforce_attachment_queue',
    'attachment_vault_queue',
    'topic_vault_queue',
    'centris_auth_handOff_queue', // IMPORTANT: This queue is used for Centris auth handoff
    'vault_auth_handOff_queue', // IMPORTANT: This queue is used for Vault auth handoff
    'vault_attendee-validation_queue',
    'salesforce_attendee_validation_queue',
    'attendee-validation_queue',
    'update_vault_attendee_queue'
  ];
  queues.forEach((queue) => {
    logger.log(`Connecting to queue: ${queue}`);
    app.connectMicroservice({
      transport: Transport.RMQ,
      options: {
        urls: [rabbitMqUrl],
        queue,
        queueOptions: { durable: false },
        noAck: false,
      },
    });
  });

  await app.startAllMicroservices();

  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);
  logger.log(`Application is running on port ${port}`);
}

bootstrap();
