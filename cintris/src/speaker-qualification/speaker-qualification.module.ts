import { Module } from "@nestjs/common";
import { SpeakerQualificationController } from "./speaker-qualification.controller";
import { SpeakerQualificationService } from "./speaker-qualification.service";
import { RabbitMQModule } from "src/shared/rabbitmq/rabbitmq.module";
import { JwtSharedModule } from "src/shared/jwt-shared.module";

@Module({
  imports: [
    RabbitMQModule.register("salesforce_speaker_queue"),
    JwtSharedModule,
  ],
  controllers: [SpeakerQualificationController],
  providers: [SpeakerQualificationService],
})
export class SpeakerQualificationModule {}
