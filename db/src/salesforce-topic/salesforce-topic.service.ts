import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FieldMappingEngineService } from 'src/field-mapping-engine/field-mapping-engine.service';
import { Topic } from 'src/entities/topic.entity';
import { ExpansionRuleService } from 'src/expansion-rule/expansion-rule.service';
import { TransactionLogService } from 'src/transaction-log/transaction-log.service';
import { mapTransactionLogPayload } from 'src/shared/transactionLog/mapTransactionLogPayload';
import { TRANSACTION_DIRECTIONS } from 'src/shared/constants/transaction-log-dirction';

@Injectable()
export class SalesforceTopicService {
  private readonly logger = new Logger(SalesforceTopicService.name);
  private transactionId: string;

  constructor(
    private readonly fieldMappingEngine: FieldMappingEngineService,
    private readonly expansion: ExpansionRuleService,
    private readonly transactionLogService: TransactionLogService,

    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
  ) {}

  async handleTopicCreated(data: any): Promise<any> {
    console.log(
      '🚀 ~ SalesforceTopicService ~ handleTopicCreated ~ data:',
      data,
    );
    try {
      this.transactionId = data.TransactionId;
      const topicData = data?.TopicList;
      const targetApiId = 'topic';
      const direction = 'centrisToAWS';

      const fieldMappings =
        await this.expansion.getExpansionRulesByApiName(targetApiId);
      if (fieldMappings.length) {
        for (let index = 0; index < topicData.length; index++) {
          const element = topicData[index];
          const enrichedPayload =
            await this.fieldMappingEngine.applyFieldMappings(
              fieldMappings,
              direction,
              element,
            );
          console.log(
            '🚀 ~ SalesforceTopicService ~ handleTopicCreated ~ enrichedPayload:',
            enrichedPayload,
          );
        }
      }

      const { TopicList } = data;
      console.log(
        '🚀 ~ SalesforceTopicService ~ handleTopicCreated ~ data:',
        data,
      );

      const savedTopics: Topic[] = [];
      for (const t of TopicList) {
        const topic = this.topicRepository.create({
          Id: t.TopicID,
          ModifiedDateTime: new Date().toISOString(),
          ExternalId: t.ExternalId,
          Description: t.TopicDescription,
          Status: t.Status || null,
          expansionList: t.expansionList || null,
        });
        console.log(
          '🚀 ~ SalesforceTopicService ~ handleTopicCreated ~ topic:',
          topic,
        );
        const saved = await this.topicRepository.save(topic);
        savedTopics.push(saved);
      }
      const transactionLogData = mapTransactionLogPayload({
        name: this.transactionId,
        success: true,
        logType: 'Topic',
        direction: TRANSACTION_DIRECTIONS.CENTRIS_INBOUND,
      });
      return await this.transactionLogService.create(transactionLogData);
    } catch (error) {
      const transactionLogData = mapTransactionLogPayload({
        name: this.transactionId,
        success: false,
        errorMessage: error.message,
        logType: 'Topic',
        direction: TRANSACTION_DIRECTIONS.CENTRIS_INBOUND,
      });
      const res = await this.transactionLogService.create(transactionLogData);
      this.logger.error(error);
      return {
        isError: true,
        statusCode: 400,
        message: error.message,
        Id: res.Id,
      };
    }
  }
}
