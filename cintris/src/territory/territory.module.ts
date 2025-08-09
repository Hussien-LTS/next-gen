import { Module } from "@nestjs/common";
import { TerritoryService } from "./territory.service";
import { TerritoryController } from "./territory.controller";
import { RabbitMQModule } from "src/shared/rabbitmq/rabbitmq.module";

@Module({
  imports: [RabbitMQModule.register("salesforce-territory_queue")],
  providers: [TerritoryService],
  controllers: [TerritoryController],
})
export class TerritoryModule {}
