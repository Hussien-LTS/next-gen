import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpansionRuleService } from 'src/expansion-rule/expansion-rule.service';
import { FieldMappingEngineService } from 'src/field-mapping-engine/field-mapping-engine.service';
import {
  apiNames,
  apiDirections,
  speakerQualificationExpansionObjectNames,
} from '../shared/constants/expansion-rule';

import { TransactionLog } from 'src/entities/transaction_log.entity';
import { SpeakerQualification } from 'src/entities/speaker_qualification.entity';
import { Contract } from 'src/entities/contract.entity';
import { Topic } from 'src/entities/topic.entity';
import { Training } from 'src/entities/training.entity';

interface ErrorObject {
  message: string;
  code?: string;
}

interface ExpansionItem {
  outBoundField: string;
  actualValue: unknown;
}

interface SpeakerQualificationItem {
  expansionList: ExpansionItem[];
  vaultFields: [];
}

interface SpeakerQualificationData {
  trainingList?: SpeakerQualificationItem[];
  contractList?: SpeakerQualificationItem[];
  expansionList?: ExpansionItem[];
  speakerVaultFields: [];
}

@Injectable()
export class SpeakerQualificationService {
  private readonly logger = new Logger(SpeakerQualificationService.name);

  constructor(
    private readonly fieldMappingEngine: FieldMappingEngineService,
    private readonly expansion: ExpansionRuleService,

    @InjectRepository(TransactionLog)
    private transactionLogRepository: Repository<TransactionLog>,

    @InjectRepository(SpeakerQualification)
    private speakerQualificationRepository: Repository<SpeakerQualification>,

    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,

    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,

    @InjectRepository(Training)
    private trainingRepository: Repository<Training>,
  ) {}

  async getSpeakerQualificationsExpansionList(
    data: Record<string, unknown>,
  ): Promise<any> {
    try {
      this.logger.log(
        'the getSpeakerQualificationsExpansionList service has started',
      );

      const speakerQualificationsInfo =
        data?.speakerQualificationsInfo as SpeakerQualificationData[];

      const targetApiName = apiNames.SPEAKER_QUALIFICATION;
      const direction = apiDirections.CENTRIS_TO_AWS;
      const objectNames = speakerQualificationExpansionObjectNames;

      if (speakerQualificationsInfo?.length) {
        const expansionRules =
          await this.expansion.getExpansionRulesByApiNameGroupedByObject(
            targetApiName,
          );

        if (Object.keys(expansionRules)?.length) {
          // eslint-disable-next-line @typescript-eslint/await-thenable
          for await (const speakerQualificationData of speakerQualificationsInfo) {
            const speakerRules =
              await this.fieldMappingEngine.applyFieldMappings(
                expansionRules[objectNames.ACCOUNT] as Record<string, any>[],
                direction,
                speakerQualificationData,
              );

            speakerQualificationData.expansionList =
              speakerRules.centrisFields as ExpansionItem[];

            speakerQualificationData.speakerVaultFields =
              speakerRules.vaultFields as [];

            const trainingList = speakerQualificationData?.trainingList;
            if (trainingList?.length) {
              // eslint-disable-next-line @typescript-eslint/await-thenable
              for await (const training of trainingList) {
                const trainingRules =
                  (await this.fieldMappingEngine.applyFieldMappings(
                    expansionRules[objectNames.TRAINING] as Record<
                      string,
                      any
                    >[],
                    direction,
                    training,
                  )) as any;

                training.expansionList =
                  trainingRules.centrisFields as ExpansionItem[];

                training.vaultFields = trainingRules.vaultFields as [];
              }
            }

            const contractList = speakerQualificationData?.contractList;
            if (contractList?.length) {
              // eslint-disable-next-line @typescript-eslint/await-thenable
              for await (const contract of contractList) {
                const contractRules =
                  (await this.fieldMappingEngine.applyFieldMappings(
                    expansionRules[objectNames.CONTRACT] as Record<
                      string,
                      any
                    >[],
                    direction,
                    contract,
                  )) as any;

                contract.expansionList =
                  contractRules.centrisFields as ExpansionItem[];

                contract.vaultFields = contractRules.vaultFields as [];
              }
            }
          }
        }
      }

      const result = { speakerQualificationsInfo };

      this.logger.log(
        'the getSpeakerQualificationsExpansionList service has finished',
      );
      return result;
    } catch (err) {
      const error = err as ErrorObject;

      this.logger.error(
        'the getSpeakerQualificationsExpansionList service has error:',
        error.message,
      );

      return {
        isError: true,
        message: error.message,
      };
    }
  }

  async bulkUpsertSpeakerQualifications(
    data: Record<string, unknown>,
  ): Promise<void> {
    try {
      this.logger.log(
        'the bulkUpsertSpeakerQualifications service has started',
      );

      const fullData = data?.speakerQualificationsInfo as Record<
        string,
        unknown
      >[];

      // eslint-disable-next-line @typescript-eslint/await-thenable
      for await (const element of fullData) {
        const trainingList = element.trainingList as Record<string, unknown>[];
        const contractList = element.contractList as Record<string, unknown>[];

        // const speakerId = randomUUID() as string;
        await this.speakerQualificationRepository.save({
          Id: element?.SpeakerId,
          SpeakerStatus: element?.SpeakerStatus,
          NextYearStatus: element?.NextYearStatus,
          SpeakerLName: element?.SpeakerLName,
          SpeakerId: element?.SpeakerId,
          ExternalId: element?.SpeakerId,
          SpeakerFName: element?.SpeakerFName,
          SpeakerAddr: element?.SpeakerAddr,
          expansionList: element?.expansionList,
        } as SpeakerQualification);

        // eslint-disable-next-line @typescript-eslint/await-thenable
        for await (const contract of contractList) {
          await this.contractRepository.save({
            Id: contract?.MasterId,
            Status: contract?.status,
            StartDate: contract?.StartDate,
            ExternalId: contract?.MasterId,
            EndDate: contract?.EndDate,
            ContractTypeName: contract?.ContractTypeName,
            ContractTypeId: contract?.ContractTypeId,
            ContractName: contract?.ContractName,
            expansionList: contract?.expansionList,
          } as Contract);
        }

        // eslint-disable-next-line @typescript-eslint/await-thenable
        for await (const trainingData of trainingList) {
          const training = trainingData as Record<string, any>;

          await this.topicRepository.save({
            Id: training?.TopicID,
            ExternalId: training?.TopicID,
            Description: training?.TopicDescription,
            Status: training?.TopicStatus,
          } as Topic);

          await this.trainingRepository.save({
            Id: training?.TopicID,
            TrainingName: training?.TrainingName,
            ExternalId: training?.MasterId,
            StartDate: training?.StartDate,
            EndDate: training?.EndDate,
            TopicID: training?.TopicID,
            TopicType: training?.TopicType,
            TopicDescription: training?.TopicDescription,
            TopicStatus: training?.TopicStatus,
            TopicName: training?.TopicName,
            expansionList: training?.expansionList,
          } as Training);
        }
      }

      this.logger.log(
        'the bulkUpsertSpeakerQualifications service has finished',
      );
    } catch (err) {
      const error = err as ErrorObject;

      this.logger.error(
        'the bulkUpsertSpeakerQualifications service has error',
        error.message,
      );
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

      const transactionData = transaction?.identifiers?.[0];

      this.logger.log('the createTransactionLog service has ended');
      return transactionData;
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
