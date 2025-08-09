/* eslint-disable @typescript-eslint/await-thenable */
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { RabbitMQService } from 'src/shared/rabbitmq/rabbitmq.service';
import { CreateSpeakerQualificationsDto } from './DTOs/create-speaker-qualifications.dto';
import {
  TRANSACTION_SUCCESS_STATUSES,
  TRANSACTION_DIRECTIONS,
} from '../shared/constants/transaction-log-dirction';
import { sendVQL } from '../shared/vaultReq/sendVQL';

interface ErrorObject {
  message?: string;
}

@Injectable()
export class SpeakerQualificationService {
  private readonly logger = new Logger(SpeakerQualificationService.name);
  constructor(private readonly rmqService: RabbitMQService) {}

  private getHeaders(vaultCredentials: {
    sessionId: string;
    clientId: string;
    serverUrl: string;
  }) {
    return {
      Authorization: vaultCredentials?.sessionId || '',
      Accept: '*/*',
      'X-VaultAPI-ClientID': vaultCredentials?.clientId,
    };
  }

  private validateVaultResponse(payload?: Record<string, any>) {
    const payloadErrors = payload?.errors as Record<string, unknown>[];
    if (payloadErrors?.length) {
      throw new BadRequestException(
        `vault error: ${payloadErrors[0]?.message}`,
      );
    }

    const payloadData = payload?.data as Record<string, unknown>[];
    if (!payloadData?.length) {
      throw new BadRequestException(
        'something went wrong when connection to vault',
      );
    }

    payloadData.forEach((data) => {
      // const dataWarnings = data?.warnings as Record<string, unknown>[];
      // if (dataWarnings?.length) {
      //   throw new BadRequestException(
      //     `vault error: ${dataWarnings[0]?.message}`,
      //   );
      // }

      const dataErrors = data?.errors as Record<string, unknown>[];
      if (dataErrors?.length) {
        throw new BadRequestException(`vault error: ${dataErrors[0]?.message}`);
      }
    });
  }

  async createSpeakerQualifications(
    vaultCredentials: {
      sessionId: string;
      clientId: string;
      serverUrl: string;
    },
    user: Record<string, unknown>,
    payload: CreateSpeakerQualificationsDto,
  ): Promise<any> {
    try {
      this.logger.log('createSpeakerQualifications service has started');

      const { sessionId, clientId, serverUrl } = vaultCredentials;

      if (!sessionId || !clientId || !serverUrl) {
        throw new BadRequestException('Missing Vault auth');
      }

      let payloadWithExpansionList = payload as Record<string, unknown>;

      payloadWithExpansionList = (await this.rmqService.send(
        'expansion-create-speaker-qualifications',
        {
          speakerQualificationsInfo: payload.HCPDataList,
        },
      )) as Record<string, unknown>;

      if (payloadWithExpansionList?.isError) {
        throw new BadRequestException(payloadWithExpansionList?.message);
      }

      const speakerQualificationsInfo =
        (payloadWithExpansionList?.speakerQualificationsInfo || []) as Record<
          string,
          unknown
        >[];

      if (!speakerQualificationsInfo?.length) {
        throw new BadRequestException(
          'error while getting data from expansion list',
        );
      }

      const allData = [] as Record<string, unknown>[];

      for await (const item of speakerQualificationsInfo) {
        const speakerData = [] as Record<string, unknown>[];
        const topicsData = [] as Record<string, unknown>[];
        const speakerQualificationsData = [] as Record<string, unknown>[];

        const trainingList = item?.trainingList as Record<string, any>[];
        const contractList = item?.contractList as Record<string, unknown>[];

        const speakerExpansionList = item?.speakerVaultFields as Record<
          string,
          unknown
        >[];

        const reshapedSpeakerExpansionList = speakerExpansionList?.reduce(
          (acc, current) => {
            return { ...acc, ...current };
          },
          {},
        );

        speakerData.push({
          external_id__v: item?.SpeakerId,
          em_speaker_status__v: item?.SpeakerStatus
            ? [item.SpeakerStatus]
            : undefined,
          next_year_status__v: item?.NextYearStatus
            ? [item.NextYearStatus]
            : undefined,
          first_name__v: item?.SpeakerFName,
          last_name__v: item?.SpeakerLName,
          // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
          name__v: `${item?.SpeakerLName || ''}, ${item?.SpeakerFName || ''}`,
          address__v: item?.SpeakerAddr,
          ...reshapedSpeakerExpansionList,
        });

        if (trainingList?.length) {
          for await (const training of trainingList) {
            const trainingExpansionList = training?.vaultFields as Record<
              string,
              unknown
            >[];

            const reshapedTrainingExpansionList = trainingExpansionList?.reduce(
              (acc, current) => {
                return { ...acc, ...current };
              },
              {},
            );

            let objectId;
            if (training?.TopicType) {
              objectId = await this.getTopicObjectTypeIdByName(
                vaultCredentials,
                training.TopicType as string,
              );

              this.logger.debug(`TopicType objectTypeId is:\n ${objectId}`);

              if (!objectId) {
                throw new BadRequestException(
                  `TopicType ${training.TopicType} is Invalid`,
                );
              }
            }

            topicsData.push({
              external_id__v: training?.TopicID,
              object_type__v: objectId,
              em_catalog_name__v: training?.TopicName,
              description__v: training?.TopicDescription,
              em_catalog_status__v: training?.TopicStatus
                ? [training.TopicStatus]
                : undefined,
            });

            speakerQualificationsData.push({
              external_id__v: training?.MasterId,
              // qualification_name__v: training?.TrainingName, // ! we have an issue with it
              start_date__v: training?.StartDate,
              end_date__v: training?.EndDate,
              // * the reason that we add the trainingExpansionList for the speakerQualificationsData and not topic is because the expansion for the trainingList is only for the em_speaker_qualification__v event
              ...reshapedTrainingExpansionList,
            });
          }
        }

        if (contractList?.length) {
          contractList.forEach((contract) => {
            const contractExpansionList = contract?.vaultFields as Record<
              string,
              unknown
            >[];

            const reshapedContractExpansionList = contractExpansionList?.reduce(
              (acc, current) => {
                return { ...acc, ...current };
              },
              {},
            );

            topicsData.push({
              external_id__v: contract?.ContractTypeId,
              em_catalog_name__v: contract?.ContractTypeName,
            });

            speakerQualificationsData.push({
              status__v: contract?.status ? [contract.status] : undefined,
              start_date__v: contract?.StartDate,
              end_date__v: contract?.EndDate,
              external_id__v: contract?.MasterId,
              // qualification_name__v: contract?.ContractName, // ! we have an issue with it
              ...reshapedContractExpansionList,
            });
          });
        }

        allData.push({ speakerData, topicsData, speakerQualificationsData });
      }

      if (allData?.length) {
        // eslint-disable-next-line @typescript-eslint/await-thenable
        for await (const item of allData) {
          let speakerId = '';
          if (item?.speakerData) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const speakerData = await this.syncSpeakerDataToVault(
              item?.speakerData as Record<string, unknown>[],
              vaultCredentials,
            );

            this.logger.debug('speakerData is:', speakerData);

            speakerId = speakerData?.id as string;
            if (!speakerId) {
              throw new BadRequestException('Speaker Was not created');
            }
          }

          const topicIds = [] as string[];
          if (item?.topicsData) {
            const topicsData = await this.syncTopicsDataToVault(
              item?.topicsData as Record<string, unknown>[],
              vaultCredentials,
            );

            this.logger.debug('topicsData is:', topicsData);

            topicsData.forEach((topic) => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              const topicId = topic?.data?.id;
              topicIds.push(topicId);
            });
          }

          if (item?.speakerQualificationsData) {
            const speakerQualificationsData =
              await this.syncSpeakerQualificationsDataToVault(
                item?.speakerQualificationsData as Record<string, unknown>[],
                vaultCredentials,
                speakerId,
                topicIds,
              );

            this.logger.debug(
              'speakerQualificationsData is:',
              speakerQualificationsData,
            );
          }
        }
      }

      await this.rmqService.emit('vault-create-speaker-qualifications', {
        speakerQualificationsInfo: speakerQualificationsInfo,
      });

      await this.rmqService.send(
        'create-speaker-qualification-transaction-log',
        {
          transactionLog: {
            Name: payload.TransactionId,
            Success: TRANSACTION_SUCCESS_STATUSES.TRUE,
            LogType: 'Speaker Qualification',
            Owner: `${user?.username || ''}`,
            Direction: TRANSACTION_DIRECTIONS.VAULT_OUTBOUND,
          },
        },
      );

      this.logger.log('createSpeakerQualifications service has finished');
      return {
        success: true,
        message:
          'Speaker Qualification information successfully saved in AWS Instance',
      };
    } catch (error) {
      const err = error as ErrorObject;
      this.logger.error(
        'createSpeakerQualifications service has error:',
        err?.message,
      );

      await this.rmqService.send(
        'create-speaker-qualification-transaction-log',
        {
          transactionLog: {
            Name: payload.TransactionId,
            Success: TRANSACTION_SUCCESS_STATUSES.FALSE,
            LogType: 'Speaker Qualification',
            Owner: `${user?.username || ''}`,
            Direction: TRANSACTION_DIRECTIONS.VAULT_OUTBOUND,
            ErrorMessage: err?.message,
          },
        },
      );

      throw new BadRequestException(err?.message || 'Something Went Wrong');
    }
  }

  async syncSpeakerDataToVault(
    speakerData: Record<string, unknown>[],
    vaultCredentials: {
      sessionId: string;
      clientId: string;
      serverUrl: string;
    },
  ): Promise<Record<string, unknown>> {
    if (!speakerData.length) {
      throw new BadRequestException('there is no speaker data');
    }

    const result = await axios.post(
      `${vaultCredentials?.serverUrl}/vobjects/em_speaker__v?idParam=external_id__v`,
      speakerData,
      {
        headers: this.getHeaders(vaultCredentials),
      },
    );

    this.validateVaultResponse(result?.data);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return result?.data?.data?.[0]?.data;
  }

  async syncTopicsDataToVault(
    topicsData: Record<string, unknown>[],
    vaultCredentials: {
      sessionId: string;
      clientId: string;
      serverUrl: string;
    },
  ): Promise<Record<string, any>[]> {
    if (!topicsData?.length) {
      return [];
    }

    const result = await axios.post(
      `${vaultCredentials?.serverUrl}/vobjects/em_catalog__v?idParam=external_id__v`,
      topicsData,
      {
        headers: this.getHeaders(vaultCredentials),
      },
    );

    this.validateVaultResponse(result?.data);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return result?.data?.data;
  }

  async syncSpeakerQualificationsDataToVault(
    speakerQualifications: Record<string, unknown>[],
    vaultCredentials: {
      sessionId: string;
      clientId: string;
      serverUrl: string;
    },
    speakerId: string,
    topicIds: string[],
  ): Promise<Record<string, unknown>[]> {
    if (!speakerQualifications?.length) {
      return [];
    }

    speakerQualifications.forEach((qualification, index) => {
      qualification.speaker__v = speakerId || null;
      qualification.qualification__v = topicIds?.[index] || null;
    });

    const result = await axios.post(
      `${vaultCredentials?.serverUrl}/vobjects/em_speaker_qualification__v?idParam=external_id__v`,
      speakerQualifications,
      {
        headers: this.getHeaders(vaultCredentials),
      },
    );

    this.validateVaultResponse(result?.data);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return result?.data?.data;
  }

  async getTopicObjectTypeIdByName(
    vaultCredentials: {
      sessionId: string;
      clientId: string;
      serverUrl: string;
    },
    TopicType: string,
  ): Promise<string> {
    const { sessionId, clientId, serverUrl } = vaultCredentials;
    const query = `
              SELECT id, name__v, object_name__v 
                FROM object_type__v 
              WHERE (name__v = '${TopicType}' AND object_name__v = 'em_catalog__v')`; // ? the reason that we added object_name__v = 'em_catalog__v' is because if we get an object type with id not related to em_catalog the create speaker_qualification API will throw an error

    const result = (await sendVQL(serverUrl, clientId, query, sessionId)) as {
      errors?: [{ message?: string }];
      data?: unknown;
    };

    const { errors } = result;
    if (errors?.length) {
      throw new BadRequestException(errors[0]?.message);
    }

    const objectType = result?.data?.[0] as { id: string };

    return objectType?.id;
  }

  async createSpeakerQualificationTransactionLog(
    data: Record<string, unknown>,
  ) {
    try {
      this.logger.log(
        'createSpeakerQualificationTransactionLog service has started',
      );

      const transaction = (await this.rmqService.send(
        `create-speaker-qualification-transaction-log`,
        {
          transactionLog: data?.transactionLog,
        },
      )) as Record<string, unknown>;

      if (transaction?.isError) {
        throw new BadRequestException(transaction?.message);
      }

      return transaction;
    } catch (err) {
      const error = err as { message: string; code?: string };

      this.logger.error(
        'the createSpeakerQualificationTransactionLog service has error:',
        error.message,
      );

      return {
        isError: true,
        message: error.message,
      };
    }
  }
}
