import { Module } from '@nestjs/common';
import { VaultModule } from './vault/vault.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EventModule } from './event/event.module';
import { ConfigModule } from '@nestjs/config';
import { TransactionAttachModule } from './transaction-attach/transaction-attach.module';
import { SpeakersModule } from './speakers/speakers.module';
import { TerritoryModule } from './territory/territory.module';
import { AttendeesModule } from './attendees/attendees.module';
import { TopicModule } from './topic/topic.module';
import { BudgetModule } from './budget/budget.module';
import { UserModule } from './user/user.module';
import { AttachmentModule } from './attachment/attachment.module';
import { UserTerritoryModule } from './user-territory/user-territory.module';
import { VenueModule } from './venue/venue.module';
import { SpeakerValidationModule } from './speaker-validation/speaker-validation.module';
import { SpeakerQualificationModule } from './speaker-qualification/speaker-qualification.module';
import { SpeakerValidationToVaultModule } from './speaker-validation-to-vault/speaker-validation-to-vault.module';
import { SparkModule } from './spark/spark.module';
import { EventSpeakerAttendeeValidationModule } from './event-speaker-attendee-validation/event-speaker-attendee-validation.module';
import { AuthHanddOffModule } from './auth-handd-off/auth-handd-off.module';
import { AttendeeValidationModule } from './attendee-validation/attendee-validation.module';
import { AttendeeValidationToVaultModule } from './attendee-validation-to-vault/attendee-validation-to-vault.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    VaultModule,
    ScheduleModule.forRoot(),
    EventModule,
    TransactionAttachModule,
    SpeakersModule,
    TerritoryModule,
    AttendeesModule,
    TopicModule,
    BudgetModule,
    UserModule,
    AttachmentModule,
    UserTerritoryModule,
    VenueModule,
    SpeakerValidationModule,
    SpeakerQualificationModule,
    SpeakerValidationToVaultModule,
    SparkModule,
    EventSpeakerAttendeeValidationModule,
    AuthHanddOffModule,
    AttendeeValidationModule,
    AttendeeValidationToVaultModule,
  ],
})
export class AppModule {}
