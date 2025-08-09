import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // veeva-vault Auth Queue Connection
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL')],
      queue: 'vault_auth_queue',
      queueOptions: { durable: false },
      noAck: false,
    },
  });
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL')],
      queue: 'centris_to_vault',
      queueOptions: { durable: false },
      noAck: false,
    },
  });
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL')],
      queue: 'datasource_budget_queue',
      queueOptions: { durable: false },
      noAck: false,
    },
  });

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL')],
      queue: 'datasource_topic_queue',
      queueOptions: { durable: false },
      noAck: false,
    },
  });

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL')],
      queue: 'datasource_venue_queue',
      queueOptions: { durable: false },
      noAck: false,
    },
  });

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL')],
      queue: 'salesforce_attendee_queue',
      queueOptions: { durable: false },
      noAck: false,
    },
  });

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL')],
      queue: 'speaker-validation_queue',
      queueOptions: { durable: false },
      noAck: false,
    },
  });

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL')],
      queue: 'salesforce_speaker_queue',
      queueOptions: { durable: false },
      noAck: false,
    },
  });

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL')],
      queue: 'attendee-validation_queue',
      queueOptions: { durable: false },
      noAck: false,
    },
  });

  
  const config = new DocumentBuilder()
    .setTitle('Vault API Consumer')
    .setDescription('API to fetch documents from Veeva Vault')
    .setVersion('1.0')
    .addApiKey(
      { type: 'apiKey', name: 'Authorization', in: 'header' },
      'sessionId',
    )
    .addApiKey(
      { type: 'apiKey', name: 'X-VaultAPI-ClientID', in: 'header' },
      'vaultClientId',
    )
    .build();
  const swaggerOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      requestInterceptor: (req: any) => {
        const jsonEndpoints = [
          'vault/v1/users',
          'user-territory',
          'vault/v1/budget',
          'vault/v1/venue',
          'vault/api/v1/getSpeakerValidationDetails',
          'speaker-qualification',
          '/vault/api/v1/updateSpeakerValidationinVault/',
          'attendee-validation',
        ];
        const shouldUseJson = jsonEndpoints.some((endpoint) =>
          req.url?.includes(endpoint),
        );

        // Only set Content-Type for PUT/POST/PATCH requests
        if (
          ['put', 'patch'].includes(req.method.toLowerCase()) &&
          !shouldUseJson
        ) {
          req.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        } else {
          // Default to JSON for other methods (GET, DELETE, etc.)
          req.headers['Content-Type'] = 'application/json';
          req.headers['Accept'] = 'application/json';
        }
        return req;
      },
    },
  };
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, swaggerOptions);

  await app.startAllMicroservices();

  const port = configService.get<number>('PORT');
  await app.listen(port ?? 3007);
}
bootstrap();
