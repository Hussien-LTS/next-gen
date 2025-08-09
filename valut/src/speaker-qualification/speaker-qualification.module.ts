import { Module } from '@nestjs/common';
import { SpeakerQualificationController } from './speaker-qualification.controller';
import { SpeakerQualificationService } from './speaker-qualification.service';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';
import { JwtSharedModule } from 'src/shared/jwt-shared.module';
import { AuthHanddOffModule } from 'src/auth-handd-off/auth-handd-off.module';

@Module({
  imports: [
    RabbitMQModule.register('vault_speaker_qualification_queue'),
    AuthHanddOffModule,
    JwtSharedModule,
  ],
  controllers: [SpeakerQualificationController],
  providers: [SpeakerQualificationService],
})
export class SpeakerQualificationModule {}
