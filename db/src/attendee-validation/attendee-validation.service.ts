import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HCPEligibility } from 'src/entities/hcp_eligibility.entity';
import { TransactionLog } from 'src/entities/transaction_log.entity';
import { TRANSACTION_DIRECTIONS } from 'src/shared/constants/transaction-log-dirction';
import { RabbitMQService } from 'src/shared/rabbitmq/rabbitmq.service';
import { mapTransactionLogPayload } from 'src/shared/transactionLog/mapTransactionLogPayload';
import { Repository } from 'typeorm';

@Injectable()
export class AttendeeValidationService {
  constructor(
    @InjectRepository(HCPEligibility)
    private readonly hcpEligibilityRepository: Repository<HCPEligibility>,
    private rmqService: RabbitMQService,
    @InjectRepository(TransactionLog)
    private transactionLogRepository: Repository<TransactionLog>,
  ) {}

  async insertAttendeeValidation(data: any) {
    const { dataSourceAttendee, centriesAttendee, transactionName} = data;
    console.log("🚀 ~ AttendeeValidationService ~ insertAttendeeValidation ~ dataSourceAttendee:", dataSourceAttendee)


    try {
      const existing = await this.hcpEligibilityRepository.findOneBy({
        ExternalId: dataSourceAttendee.ExternalId,
      });
   
      let attendee;
      if (existing) {
        console.log('in existing')
        attendee = await this.hcpEligibilityRepository.update(
          { ExternalId: dataSourceAttendee.ExternalId },
          dataSourceAttendee,
        );
      } else {
        console.log('in else')
        
        attendee = await this.hcpEligibilityRepository.insert(dataSourceAttendee);
      }
      console.log("🚀 ~ AttendeeValidationService ~ insertAttendeeValidation ~ attendee:", attendee)

      console.log('ayman 200', existing?.Id || attendee?.raw[0]?.Id);

      await this.rmqService.emit('datasource_attendee_validation_created', {
        ...centriesAttendee,
        AWSHcpEligibilityId: existing?.Id || attendee?.raw[0]?.Id,
        transactionName,
      });

      //   await this.rmqService.send('datasource_attendee_validation_created', {
      //   ...centriesAttendee,
      //   AWSHcpEligibilityId: existing?.Id || attendee?.raw[0]?.Id,
      //   transactionName,
      // });
      return attendee;
    } catch (error) {
      console.log("🚀 ~ AttendeeValidationService ~ insertAttendeeValidation ~ error:", error)
      throw new BadRequestException('Failed to save Attendee validation data.');
    }
  }

  async updateAttendeeValidation(data: any) {
    const { Id, centrieRes, transactionName, ...updateData } = data;
    console.log('🚀 ~ updateAttendeeValidation ~ updateData:', updateData);

    try {
      const existing = await this.hcpEligibilityRepository.findOneBy({
        Id,
      });
      console.log("🚀 ~ AttendeeValidationService ~ updateAttendeeValidation ~ existing:", existing)
    

      if (!existing) {
        return new NotFoundException(
          `Attendee validation with ID ${Id} not found.`,
        );
      }

      await this.hcpEligibilityRepository.update(Id, updateData);

      await this.transactionLogRepository.insert(
        mapTransactionLogPayload({
          name: transactionName,
          direction: TRANSACTION_DIRECTIONS.CENTRIS_INBOUND,
          logType: 'Attendee',
          success: true,
        }),
      );
      await this.rmqService.send('datasource_attendee_validation_updated', {
        ...centrieRes,
        eventAttendeeId: existing.ExternalId,
        eventId: existing.EventId,
        transactionName,
      });

      //!    await this.rmqService.send('datasource_attendee_validation_updated', {
      //   ...centrieRes,
      //   eventAttendeeId: existing.ExternalId,
      //   eventId: existing.EventId,
      //   transactionName,
      // });

      return await this.hcpEligibilityRepository.findOneBy({ Id });
    } catch (error) {
      console.log("🚀 ~ AttendeeValidationService ~ updateAttendeeValidation ~ error:", error)
      
      await this.transactionLogRepository.insert(
        mapTransactionLogPayload({
          name: transactionName,
          direction: TRANSACTION_DIRECTIONS.CENTRIS_INBOUND,
          logType: 'Attendee',
          success: false,
          errorMessage: error?.message,
        }),
      );
      return new BadRequestException(
        'Failed to update Attendee validation data.',
      );
    }
  }
}
