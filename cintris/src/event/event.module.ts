import { Module } from "@nestjs/common";
import { EventController } from "./event.controller";
import { CentrisEventService } from "./event.service";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { RabbitMQModule } from "src/shared/rabbitmq/rabbitmq.module";
import { JwtSharedModule } from "src/shared/jwt-shared.module";
import { AuthHanddOffModule } from "src/auth-handd-off/auth-handd-off.module";

@Module({
  imports: [
    RabbitMQModule.register("centris_to_vault"),
    JwtSharedModule,
    AuthHanddOffModule,
  ],
  controllers: [EventController],
  providers: [CentrisEventService],
})
export class EventModule {}
