import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HCPEligibility } from 'src/entities/hcp_eligibility.entity';
import { Repository } from 'typeorm';
import { RabbitMQService } from 'src/shared/rabbitmq/rabbitmq.service';
import { mapTransactionLogPayload } from 'src/shared/transactionLog/mapTransactionLogPayload';
import { TRANSACTION_DIRECTIONS } from 'src/shared/constants/transaction-log-dirction';
import { TransactionLog } from 'src/entities/transaction_log.entity';

@Injectable()
export class SpeakerValidationService {
  constructor(
    @InjectRepository(HCPEligibility)
    private readonly hcpEligibilityRepository: Repository<HCPEligibility>,
    private rmqService: RabbitMQService,
    @InjectRepository(TransactionLog)
    private transactionLogRepository: Repository<TransactionLog>,
  ) {}

  async insertSpeakerValidation(data: any) {
    const { dataSourceSpeaker, centriesSpeaker, transactionName } = data;
    console.log(
      '🚀 ~ SpeakerValidationService ~ insertSpeakerValidation ~ dataSourceSpeaker:',
      dataSourceSpeaker,
    );

    try {
      const existing = await this.hcpEligibilityRepository.findOneBy({
        ExternalId: dataSourceSpeaker.ExternalId,
      });
      let speaker;
      if (existing) {
        speaker = await this.hcpEligibilityRepository.update(
          { ExternalId: dataSourceSpeaker.ExternalId },
          dataSourceSpeaker,
        );
      } else {
        speaker = await this.hcpEligibilityRepository.insert(dataSourceSpeaker);
      }

      console.log('ayman 200', existing?.Id || speaker?.raw[0]?.Id);

      await this.rmqService.send('datasource_speaker_validation_created', {
        ...centriesSpeaker,
        AWSHcpEligibilityId: existing?.Id || speaker?.raw[0]?.Id,
        transactionName,
      });

      return speaker;
    } catch (error) {
      console.log('🚀 ~ insertSpeakerValidation ~ error:', error);
      throw new BadRequestException('Failed to save speaker validation data.');
    }
  }

  async updateSpeakerValidation(data: any) {
    const { Id, centrieRes, transactionName, ...updateData } = data;
    console.log('🚀 ~ updateSpeakerValidation ~ updateData:', updateData);

    try {
      const existing = await this.hcpEligibilityRepository.findOneBy({
        Id,
      });
      console.log(
        '🚀 ~ SpeakerValidationService ~ updateSpeakerValidation ~ existing:',
        existing,
      );

      if (!existing) {
        return new NotFoundException(
          `Speaker validation with ID ${Id} not found.`,
        );
      }

      await this.hcpEligibilityRepository.update(Id, updateData);

      await this.transactionLogRepository.insert(
        mapTransactionLogPayload({
          name: transactionName,
          direction: TRANSACTION_DIRECTIONS.CENTRIS_INBOUND,
          logType: 'Speaker',
          success: true,
        }),
      );
      await this.rmqService.send('datasource_speaker_validation_updated', {
        ...centrieRes,
        eventSpeakerId: existing.ExternalId,
        eventId: existing.EventId,
        transactionName,
      });

      return await this.hcpEligibilityRepository.findOneBy({ Id });
    } catch (error) {
      console.log('🚀 ~ updateSpeakerValidation ~ error:', error);
      await this.transactionLogRepository.insert(
        mapTransactionLogPayload({
          name: transactionName,
          direction: TRANSACTION_DIRECTIONS.CENTRIS_INBOUND,
          logType: 'Speaker',
          success: false,
          errorMessage: error?.message,
        }),
      );
      return new BadRequestException(
        'Failed to update speaker validation data.',
      );
    }
  }
}
