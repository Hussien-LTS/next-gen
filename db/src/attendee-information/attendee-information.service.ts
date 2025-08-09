import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendeeInformation } from 'src/entities/attendee-information.entity';
import { TransactionLog } from 'src/entities/transaction_log.entity';

interface ErrorObject {
  message: string;
  code?: string;
}
@Injectable()
export class AttendeeInformationService {
  private readonly logger = new Logger(AttendeeInformationService.name);

  constructor(
    @InjectRepository(AttendeeInformation)
    private attendeeInformationRepository: Repository<AttendeeInformation>,

    @InjectRepository(TransactionLog)
    private transactionLogRepository: Repository<TransactionLog>,
  ) {}

  async createAttendee(data: Record<string, unknown>): Promise<void> {
    try {
      this.logger.log('the createAttendee service has started');

      const { addressList, ...otherData } = data?.attendee as Record<
        string,
        unknown
      >;

      const formattedAddress = (addressList as [])
        ?.filter((address: Record<string, unknown>) => address?.ExternalID)
        ?.map((address: Record<string, unknown>) => {
          return {
            Id: address?.ExternalID,
            ExternalId: address?.ExternalID,
            SerialNo: address?.serialNo,
            AddressLine1: address?.AddressLine1,
            AddressLine2: address?.AddressLine2,
            City: address?.City,
            State: address?.State,
            Country: address?.Country,
            ZipCode: address?.ZipCode,
          };
        });

      await this.attendeeInformationRepository.save({
        Id: otherData?.ExternalId,
        ExternalId: otherData?.ExternalId,
        FirstName: otherData?.firstName,
        LastName: otherData?.LastName,
        Name: otherData?.Name,
        Salutation: otherData?.Salutation,
        Phone: otherData?.Phone,
        Email: otherData?.Email,
        Credential: otherData?.Credential,
        Speciality: otherData?.Speciality,
        Addresses: formattedAddress?.length ? formattedAddress : undefined,
      } as AttendeeInformation);

      this.logger.log('the createAttendee service has finished');
    } catch (err) {
      const error = err as ErrorObject;
      this.logger.error('the createAttendee service has error', error.message);
    }
  }

  async createTransactionLog(data: Record<string, unknown>): Promise<any> {
    try {
      this.logger.log('the createTransactionLog service has started');

      const transactionLogData = data?.transactionLog as Record<
        string,
        unknown
      >;

      const transaction = await this.transactionLogRepository.insert({
        ...transactionLogData,
        ModifiedDateTime: new Date().toISOString(),
        ProcessCompletionTime: new Date().toISOString(),
      });

      this.logger.log('the createTransactionLog service has ended');
      return transaction;
    } catch (err) {
      const error = err as ErrorObject;

      this.logger.error(
        'the createTransactionLog service has error',
        error.message,
      );

      return {
        isError: true,
        message: error.message,
      };
    }
  }
}
