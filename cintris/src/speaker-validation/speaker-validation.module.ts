import { Module } from "@nestjs/common";
import { SpeakerValidationService } from "./speaker-validation.service";
import { SpeakerValidationController } from "./speaker-validation.controller";
import { RabbitMQModule } from "src/shared/rabbitmq/rabbitmq.module";

@Module({
  imports: [RabbitMQModule.register("salesforce_speaker_validation_queue")],
  providers: [SpeakerValidationService],
  controllers: [SpeakerValidationController],
})
export class SpeakerValidationModule {}
