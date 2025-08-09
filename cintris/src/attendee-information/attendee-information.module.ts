import { Module } from "@nestjs/common";
import { AttendeeInformationController } from "./attendee-information.controller";
import { AttendeeInformationService } from "./attendee-information.service";
import { RabbitMQModule } from "src/shared/rabbitmq/rabbitmq.module";
import { JwtSharedModule } from "src/shared/jwt-shared.module";

@Module({
  imports: [
    RabbitMQModule.register("salesforce_attendee_queue"),
    JwtSharedModule,
  ],
  controllers: [AttendeeInformationController],
  providers: [AttendeeInformationService],
})
export class AttendeeInformationModule {}
