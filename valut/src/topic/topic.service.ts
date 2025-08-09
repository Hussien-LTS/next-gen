import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { RabbitMQService } from '../shared/rabbitmq/rabbitmq.service';
import { mapTopicInputToVault } from './topic.mapper';
import { mapTransactionLogPayload } from 'src/shared/transactionLog/mapTransactionLogPayload';
import { TRANSACTION_DIRECTIONS } from 'src/shared/constants/transaction-log-dirction';
import { TopicListRequestDto } from './dtos/topic.dto';

@Injectable()
export class TopicService {
  private readonly logger = new Logger(TopicService.name);
  private readonly clientId: string | undefined;
  private readonly baseUrl: string | undefined;
  private transactionId: string;
  constructor(
    private readonly configService: ConfigService,
    private rmqService: RabbitMQService,
  ) {
    this.baseUrl = this.configService.get<string>('VAULT_BASE_URL');
    this.clientId = this.configService.get<string>('VAULT_CLIENT_ID');
  }

  async syncTopicCreatedToVV(
    vaultAuth: any,
    topicIds: string[],
    topicDto: TopicListRequestDto,
  ): Promise<any> {
    this.logger.log(
      '🚀 ~ TopicService ~ syncTopicCreatedToVV ~ topicDto:',
      topicDto,
    );

    if ('TransactionId' in topicDto) {
      this.transactionId = topicDto.TransactionId;
    }
    const { sessionId, clientId, serverUrl } = vaultAuth;
    if (!sessionId || !clientId || !serverUrl) {
      throw new UnauthorizedException('Missing Vault auth');
    }
    if (!Array.isArray(topicIds) || topicIds.length === 0) {
      throw new BadRequestException('No topic IDs provided');
    }

    try {
      const res = await this.rmqService.send(`expansion_topic_data`, topicIds);
      this.logger.log('🚀 ~ TopicService ~ syncTopicCreatedToVV ~ res:', res);
      if (!res?.data?.success || !Array.isArray(res?.data?.data)) {
        await this.rmqService.send(
          'transaction-log',
          mapTransactionLogPayload({
            name: this.transactionId,
            direction: TRANSACTION_DIRECTIONS.VAULT_OUTBOUND,
            logType: 'Topic',
            success: 'false',
            errorMessage: res?.data,
            owner: vaultAuth?.userId?.toString(),
          }),
        );
        return {
          success: res?.data?.success,
          errorMessage: res?.data?.errorMessage,
        };
      }
      const enrichedTopics = res.data.data;
      const veevaResponses: {
        success: boolean;
        veevaResponse?: any;
        errorMessage?: any;
      }[] = [];

      console.log('🚀 ~ TopicService ~ enrichedTopics:', enrichedTopics);
      for (const topic of enrichedTopics) {
        try {
          console.log('🚀 ~ TopicService ~ topic:before:', topic);

          const veevaTopic = mapTopicInputToVault(topic);
          console.log('🚀 ~ TopicService ~ topic:after', veevaTopic);
          const veevaRes = await axios.post(
            `${this.baseUrl}/vobjects/em_catalog__v?idParam=legacy_crm_id__v`,
            veevaTopic,
            {
              headers: {
                Authorization: sessionId as string,
                Accept: '*/*',
                'X-VaultAPI-ClientID': clientId,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            },
          );

          if (veevaRes?.data[0]?.errors)
            await this.rmqService.send(
              'transaction-log',
              mapTransactionLogPayload({
                name: this.transactionId,
                direction: TRANSACTION_DIRECTIONS.VAULT_OUTBOUND,
                logType: 'Topic',
                success: 'false',
                errorMessage: veevaRes?.data[0]?.errors[0]?.message,
                owner: vaultAuth?.userId?.toString(),
              }),
            );
          else {
            await this.rmqService.send(
              'transaction-log',
              mapTransactionLogPayload({
                name: this.transactionId,
                direction: TRANSACTION_DIRECTIONS.VAULT_OUTBOUND,
                logType: 'Topic',
                success: 'true',
                owner: vaultAuth?.userId?.toString(),
              }),
            );
          }
          this.logger.log(' Veeva sync success:', veevaRes.data);

          veevaResponses.push({
            success: veevaRes.data.responseStatus,
            veevaResponse: veevaRes.data,
          });
        } catch (veevaError) {
          this.logger.error(` Failed to sync topic ${topic.Id} to Veeva`);

          veevaResponses.push({
            success: false,
            errorMessage: veevaError?.response?.data || veevaError.message,
          });
        }
      }

      return {
        results: veevaResponses,
      };
    } catch (error) {
      await this.rmqService.send(
        'transaction-log',
        mapTransactionLogPayload({
          name: this.transactionId,
          direction: TRANSACTION_DIRECTIONS.VAULT_OUTBOUND,
          logType: 'Topic',
          success: 'false',
          errorMessage: error?.message,
          owner: vaultAuth?.userId?.toString(),
        }),
      );
      this.logger.error(' Failed during topic sync process:', error);

      return {
        success: false,
        errorMessage: error?.message || 'Unknown error',
      };
    }
  }
}
