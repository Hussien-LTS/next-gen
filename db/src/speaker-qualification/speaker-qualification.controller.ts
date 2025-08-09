/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { SpeakerQualificationService } from './speaker-qualification.service';

@Controller('speaker')
export class SpeakerQualificationController {
  constructor(
    private readonly speakerQualificationService: SpeakerQualificationService,
  ) {}

  @EventPattern('expansion-create-speaker-qualifications')
  async getSpeakerQualificationsExpansionList(
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
      await this.speakerQualificationService.getSpeakerQualificationsExpansionList(
        data,
      );
    context.getChannelRef().ack(context.getMessage());

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result;
  }

  @EventPattern('vault-create-speaker-qualifications')
  async bulkUpsertSpeakerQualifications(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    console.log('data from RMQ', data);
    if (!data) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new Error('data missing in payload');
    }

    await this.speakerQualificationService.bulkUpsertSpeakerQualifications(
      data,
    );
    context.getChannelRef().ack(context.getMessage());
  }

  @EventPattern('create-speaker-qualification-transaction-log')
  async createUserTransactionLog(
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
      await this.speakerQualificationService.createTransactionLog(data);

    context.getChannelRef().ack(context.getMessage());

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result;
  }
}
