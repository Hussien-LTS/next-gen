/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { SalesforceUserTerritoryService } from './salesforce-user-territory.service';

@Controller()
export class SalesforceUserTerritoryController {
  constructor(
    private readonly salesforceUserTerritoryService: SalesforceUserTerritoryService,
  ) {}

  @EventPattern('get-veeva-user-territory-inbound-transaction')
  async getUserTerritoryTransactionLog(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    console.log('data from RMQ', data);
    if (!data) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new Error('data missing in payload');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result =
      await this.salesforceUserTerritoryService.getUserTerritoryTransactionById(
        data?.transactionId as string,
      );
    context.getChannelRef().ack(context.getMessage());

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result;
  }

  @EventPattern('create-salesforce-user-territory-transaction')
  async createUserTerritoryTransactionLog(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    console.log('data from RMQ', data);
    if (!data) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new Error('data missing in payload');
    }

    await this.salesforceUserTerritoryService.createUserTerritoryTransaction(
      data,
    );
    context.getChannelRef().ack(context.getMessage());
  }
}
