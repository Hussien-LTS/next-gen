import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendeeInformationService } from './attendee-information.service';
import { AttendeeInformation } from 'src/entities/attendee-information.entity';
import { AttendeeInformationAddress } from 'src/entities/attendee-information-address.entity';
import { AttendeeInformationController } from './attendee-information.controller';
import { TransactionLog } from 'src/entities/transaction_log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AttendeeInformation,
      AttendeeInformationAddress,
      TransactionLog,
    ]),
  ],
  providers: [AttendeeInformationService],
  exports: [AttendeeInformationService],
  controllers: [AttendeeInformationController],
})
export class AttendeeInformationModule {}
