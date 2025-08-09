import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venue } from 'src/entities/venue.entity';
import { VenueDto } from './DTOs/create-venue.dto';
import { FieldMappingEngineService } from 'src/field-mapping-engine/field-mapping-engine.service';
import { ExpansionRuleService } from 'src/expansion-rule/expansion-rule.service';
import { TransactionLogService } from 'src/transaction-log/transaction-log.service';
import { TRANSACTION_DIRECTIONS } from 'src/shared/constants/transaction-log-dirction';
import { mapTransactionLogPayload } from 'src/shared/transactionLog/mapTransactionLogPayload';
import { RabbitMQService } from 'src/shared/rabbitmq/rabbitmq.service';

@Injectable()
export class VenueService {
  constructor(
    private readonly fieldMappingEngine: FieldMappingEngineService,
    private readonly expansion: ExpansionRuleService,
    private readonly transactionLogService: TransactionLogService,

    @InjectRepository(Venue)
    private venueRepository: Repository<Venue>,
    private readonly rmqService: RabbitMQService,
  ) {}

  async handleVenueCreated(venueData: VenueDto) {
    try {
      const targetApiId = 'venue';
      const direction = 'awsToVault';

      const fieldMappings =
        await this.expansion.getExpansionRulesByApiName(targetApiId);

      if (fieldMappings.length) {
        for (const element of venueData.VenueList) {
          await this.fieldMappingEngine.applyFieldMappings(
            fieldMappings,
            direction,
            element,
          );
        }
      }
      for (const item of venueData.VenueList) {
        const existing = await this.venueRepository.findOneBy({
          ExternalId: item.ExternalId,
        });
        console.log(
          '🚀 ~ VenueService ~ handleVenueCreated ~ existing:',
          existing,
        );
        if (!existing) {
          const venue = this.venueRepository.create({
            Id: item.Id,
            ModifiedDateTime: new Date().toISOString(),
            ExternalId: item.ExternalId,
            Name: item.VenueName,
            Status: item.Status,
            AddressLine1: item.AddressLine1,
            AddressLine2: item.AddressLine2,
            City: item.City,
            State: item.State,
            PostalCode: item.PostalCode,
            ExpansionList:
              item?.expansionList && item?.expansionList?.length > 0
                ? JSON.stringify(item.expansionList)
                : undefined,
          });

          await this.venueRepository.save(venue);
        } else {
          const { VenueName, expansionList, ...venueData } = item;
          await this.venueRepository.update(
            { ExternalId: item.ExternalId },
            {
              ...venueData,
              Name: VenueName,
              ExpansionList:
                expansionList && expansionList?.length > 0
                  ? JSON.stringify(expansionList)
                  : undefined,
            },
          );
        }
      }

      const transactionLogData = mapTransactionLogPayload({
        name: venueData.TransactionId,
        success: true,
        logType: 'Venue',
        direction: TRANSACTION_DIRECTIONS.CENTRIS_INBOUND,
      });
      await this.rmqService.emit(`vault_venue`, venueData);

      return await this.transactionLogService.create(transactionLogData);
    } catch (error) {
      console.log('🚀 ~ VenueService ~ handleVenueCreated ~ error:', error);
      const transactionLogData = mapTransactionLogPayload({
        name: venueData.TransactionId,
        success: false,
        errorMessage: error.message,
        logType: 'Venue',
        direction: TRANSACTION_DIRECTIONS.CENTRIS_INBOUND,
      });
      const res = await this.transactionLogService.create(transactionLogData);
      return {
        isError: true,
        statusCode: 400,
        message: error.message,
        Id: res.Id,
      };
    }
  }
}
