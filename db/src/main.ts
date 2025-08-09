import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const rabbitMqUrl = configService.get<string>('RABBITMQ_URL');
  if (!rabbitMqUrl) {
    throw new Error('RABBITMQ_URL is not configured');
  }

  const queues = [
    'salesforce_budget_queue',
    'salesforce_topic_queue',
    'vault_attendee_queue',
    'salesforce_venue_queue',
    'vault_territory_queue',
    'salesforce-territory_queue',
    'user_vault_queue',
    'salesforce_user_queue',
    'veeva_user_territory_queue',
    'salesforce_user_territory_queue',
    'attachment_vault_queue',
    'salesforce_attachment_queue',
    'vault_speaker-validation_queue',
    'centris-attachment-to-veeva',
    'expansion-rule',
    'configruble-api',
    'topic_vault_queue',
    'venue_vault_queue',
    'budget_vault_queue',
    'vault_speaker_qualification_queue',
    'event_vault_queue',
    'transaction_log_UI_queue',
    'salesforce_speaker_validation_queue',
    'centris_to_vault',
    'update_vault_speaker_queue',
    'attendee_validation_queue',
    'event_speaker_attendee_info',
    'auth-config-queue',
    'vault_auth_queue',
    'salesforce_auth_queue',
    'vault_attendee-validation_queue',
    'salesforce_attendee_validation_queue'
  ];

  queues.forEach((queue) => {
    console.log(`Connecting to queue: ${queue}`);
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
  const port = configService.get<number>('PORT');
  await app.listen(port ?? 3009);
}

bootstrap();
