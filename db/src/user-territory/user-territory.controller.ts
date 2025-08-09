/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { UserTerritoryService } from './user-territory.service';

@Controller()
export class UserTerritoryController {
  constructor(private readonly userTerritoryService: UserTerritoryService) {}

  @EventPattern('veeva-user-territory-info')
  async upsertUserTerritories(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    console.log('data from RMQ', data);
    if (!data) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new Error('data missing in payload');
    }

    const result = await this.userTerritoryService.upsertUserTerritories(data);
    context.getChannelRef().ack(context.getMessage());

    return result;
  }

  @EventPattern('veeva-user-territory-failure-transaction-log')
  async createFailureUserTerritoryTransactionLog(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    console.log('data from RMQ', data);
    if (!data) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new Error('data missing in payload');
    }

    await this.userTerritoryService.createFailureUserTerritoryTransactionLog(
      data,
    );
    context.getChannelRef().ack(context.getMessage());
  }
}
