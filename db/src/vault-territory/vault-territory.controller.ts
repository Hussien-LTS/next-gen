import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { VaultTerritoryService } from './vault-territory.service';
import { RabbitMQService } from 'src/shared/rabbitmq/rabbitmq.service';
import { mapSalesforceTerritory } from './vault-territory.mapper';

@Controller('vault-territory')
export class VaultTerritoryController {
  constructor(
    private readonly vaultTerritoryService: VaultTerritoryService,
    private readonly rmqService: RabbitMQService,
  ) {}

  @EventPattern('vault-territory-created')
  async createTerritory(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('data from RMQ', data);
    if (!data) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new Error('data missing in payload');
    }
    await this.rmqService.emit(
      `datasource-vault-territory-created`,
      mapSalesforceTerritory(data),
    );

    await this.vaultTerritoryService.createVaultTerritory(data);
    context.getChannelRef().ack(context.getMessage());
    return { status: 'data received from RMQ and persisted', data };
  }
}
