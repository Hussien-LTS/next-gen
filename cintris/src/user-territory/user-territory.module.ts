import { Module } from "@nestjs/common";
import { UserTerritoryController } from "./user-territory.controller";
import { UserTerritoryService } from "./user-territory.service";
import { RabbitMQModule } from "src/shared/rabbitmq/rabbitmq.module";
import { JwtSharedModule } from "src/shared/jwt-shared.module";

@Module({
  imports: [
    RabbitMQModule.register("salesforce_user_territory_queue"),
    JwtSharedModule,
  ],
  controllers: [UserTerritoryController],
  providers: [UserTerritoryService],
})
export class UserTerritoryModule {}
