// main.ts
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { Transport } from "@nestjs/microservices";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })
  );
  console.log(
    "Connecting to RabbitMQ at:",
    configService.get<string>("RABBITMQ_URL")
  );

  // SF Auth Queue Connection
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>("RABBITMQ_URL")],
      queue: "salesforce_auth_queue",
      queueOptions: { durable: false },
      noAck: false,
    },
  });
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>("RABBITMQ_URL")],
      queue: "datasource_event_queue",
      queueOptions: { durable: false },
      noAck: false,
    },
  });
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>("RABBITMQ_URL")],
      queue: "datasource_attachment_queue",
      queueOptions: { durable: false },
      noAck: false,
    },
  });

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>("RABBITMQ_URL")],
      queue: "datasource_vault-territory_queue",
      queueOptions: { durable: false },
      noAck: false,
    },
  });

  // Data Source User Territory Queue Connection
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>("RABBITMQ_URL")],
      queue: "datasource_user_queue",
      queueOptions: { durable: false },
      noAck: false,
    },
  });

  // Data Source User Territory Queue Connection
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>("RABBITMQ_URL")],
      queue: "datasource_user_territory_queue",
      queueOptions: { durable: false },
      noAck: false,
    },
  });
  // Attendee Validation Queue Connection
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>("RABBITMQ_URL")],
      queue: "attendee_validation_queue",
      queueOptions: { durable: false },
      noAck: false,
    },
  });

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>("RABBITMQ_URL")],
      queue: "speaker-validation_queue",
      queueOptions: { durable: false },
      noAck: false,
    },
  });

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>("RABBITMQ_URL")],
      queue: "attendee-validation_queue",
      queueOptions: { durable: false },
      noAck: false,
    },
  });

  const config = new DocumentBuilder()
    .setTitle("Centris API")
    .setDescription("API Centris")
    .setVersion("1.0")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api-docs", app, document);

  await app.startAllMicroservices();

  const port = configService.get<number>("PORT");
  await app.listen(port ?? 3010);
}
bootstrap();
