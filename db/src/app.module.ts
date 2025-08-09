import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { EventModule } from './event/event.module';
import { BudgetModule } from './salesforce-budget/salesforce-budget.module';
import { SalesforceTopicModule } from './salesforce-topic/salesforce-topic.module';
import { VenueModule } from './salesforce-venue/salesforce-venue.module';
import { AttendeeInformationModule } from './attendee-information/attendee-information.module';
import { AttachmentModule } from './attachment/attachment.module';
import { VaultTerritoryModule } from './vault-territory/vault-territory.module';
import { TransactionLogModule } from './transaction-log/transaction-log.module';
import { ExpansionRuleModule } from './expansion-rule/expansion-rule.module';
import { ConfigurableApiModule } from './configurable-API/configurable-API.module';
import { SalesforceUserModule } from './salesforce-user/salesforce-user.module';
import { UserTerritoryModule } from './user-territory/user-territory.module';
import { SalesforceUserTerritoryModule } from './salesforce-user-territory/salesforce-user-territory.module';
import { FieldMappingEngineModule } from './field-mapping-engine/field-mapping-engine.module';
import { TopicModule } from './topic/topic.module';
import { VenueExpansionListModule } from './venue-expansion-list/venue-expansion-list.module';
import { SpeakerValidationModule } from './speaker-validation/speaker-validation.module';
import { SpeakerQualificationModule } from './speaker-qualification/speaker-qualification.module';
import { AttendeeValidationModule } from './attendee-validation/attendee-validation.module';
import { AuthConfigModule } from './auth-config/auth-config.module';
import { CryptoModule } from './crypto/crypto.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    UsersModule,
    DatabaseModule,
    EventModule,
    BudgetModule,
    VenueModule,
    TopicModule,
    SalesforceTopicModule,
    AttendeeInformationModule,
    AttachmentModule,
    VaultTerritoryModule,
    TransactionLogModule,
    ExpansionRuleModule,
    ConfigurableApiModule,
    SalesforceUserModule,
    UserTerritoryModule,
    SalesforceUserTerritoryModule,
    FieldMappingEngineModule,
    VenueExpansionListModule,
    SpeakerValidationModule,
    SpeakerQualificationModule,
    AttendeeValidationModule,
    AuthConfigModule,
    CryptoModule,
  ],
})
export class AppModule {}
