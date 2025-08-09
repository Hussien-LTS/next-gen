/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { SalesforceUserService } from './salesforce-user.service';

@Controller('salesforce-user')
export class SalesforceUserController {
  constructor(private readonly salesforceUserService: SalesforceUserService) {}

  @EventPattern('get-veeva-user-inbound-transaction')
  async getUserTransactionLog(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    console.log('data from RMQ', data);
    if (!data) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new Error('data missing in payload');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await this.salesforceUserService.getUserTransactionLog(
      data?.transactionId as string,
    );
    context.getChannelRef().ack(context.getMessage());

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result;
  }

  @EventPattern('create-salesforce-user-transaction')
  async createUserTransactionLog(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    console.log('data from RMQ', data);
    if (!data) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new Error('data missing in payload');
    }

    await this.salesforceUserService.createUserTransactionLog(data);
    context.getChannelRef().ack(context.getMessage());
  }
}
