import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { EventModule } from "./event/event.module";
import { TerritoryModule } from "./territory/territory.module";
import { TopicModule } from "./topic/topic.module";
import { VenueModule } from "./venue/venue.module";
import { BudgetModule } from "./budget/budget.module";
import { AttendeeInformationModule } from "./attendee-information/attendee-information.module";
import { DocumentModule } from "./document/document.module";
import { ConfigModule } from "@nestjs/config";
import { AttachmentModule } from "./attachment/attachment.module";
import { UserModule } from "./user/user.module";
import { UserTerritoryModule } from "./user-territory/user-territory.module";
import { SpeakerQualificationModule } from "./speaker-qualification/speaker-qualification.module";
import { SpeakerValidationModule } from "./speaker-validation/speaker-validation.module";
import { AuthHanddOffModule } from './auth-handd-off/auth-handd-off.module';
import { AttendeeValidationModule } from './attendee-validation/attendee-validation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
    }),
    EventModule,
    TerritoryModule,
    TopicModule,
    VenueModule,
    BudgetModule,
    AttendeeInformationModule,
    DocumentModule,
    AttachmentModule,
    UserModule,
    UserTerritoryModule,
    SpeakerQualificationModule,
    SpeakerValidationModule,
    AttendeeValidationModule,
    AuthHanddOffModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
