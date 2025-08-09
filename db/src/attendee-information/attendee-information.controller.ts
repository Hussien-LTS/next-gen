/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { AttendeeInformationService } from './attendee-information.service';

@Controller()
export class AttendeeInformationController {
  constructor(
    private readonly attendeeInformationService: AttendeeInformationService,
  ) {}

  @EventPattern('vault-attendee-info')
  async createAttendee(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('data from RMQ', data);
    if (!data) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new Error('data missing in payload');
    }

    await this.attendeeInformationService.createAttendee(data);
    context.getChannelRef().ack(context.getMessage());
  }

  @EventPattern('vault-list-attendees-by-external-ids-transaction-log')
  async createTransactionLog(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('data from RMQ', data);
    if (!data) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new Error('data missing in payload');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result =
      await this.attendeeInformationService.createTransactionLog(data);

    context.getChannelRef().ack(context.getMessage());

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result;
  }
}
