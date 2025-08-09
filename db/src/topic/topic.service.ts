import {
  Injectable,
  Logger,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Topic } from 'src/entities/topic.entity';
import { ExpansionRuleService } from 'src/expansion-rule/expansion-rule.service';
import { FieldMappingEngineService } from 'src/field-mapping-engine/field-mapping-engine.service';
import { In, Repository } from 'typeorm';

@Injectable()
export class TopicService {
  private readonly logger = new Logger(TopicService.name);

  constructor(
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
    private readonly fieldMappingEngine: FieldMappingEngineService,
    private readonly expansion: ExpansionRuleService,
  ) {}

  async handleTopicCreatedVV(topicIds: string[]): Promise<any> {
    this.logger.log(
      '🚀 ~ TopicService ~ handleTopicCreatedVV ~ topicIds:',
      topicIds,
    );
    let shapedTopic = {};
    if (!Array.isArray(topicIds) || topicIds.length === 0) {
      this.logger.error('No topic IDs provided');
      throw new HttpException('No topic IDs provided', 400);
    }

    const topicRecord = await this.topicRepository.find({
      where: { Id: In(topicIds) },
    });

    if (topicRecord.length === 0) {
      return {
        success: false,
        errorMessage: 'Topic ID(s) do not exist in the database',
      };
    }

    const targetApiId = 'topic';
    const direction = 'awsToVault';

    const fieldMappings =
      await this.expansion.getExpansionRulesByApiName(targetApiId);
    console.log(
      '🚀 ~ TopicService ~ handleTopicCreatedVV ~ fieldMappings:',
      fieldMappings,
    );

    const veevaTopicsShape: any[] = [];

    for (const record of topicRecord) {
      console.log('🚀 ~ TopicService ~ handleTopicCreatedVV ~ record:', record);
      if (record.expansionList) {
        const enrichedPayload =
          await this.fieldMappingEngine.applyFieldMappings(
            fieldMappings,
            direction,
            record,
          );
        console.log(
          '🚀 ~ TopicService ~ handleTopicCreatedVV ~ enrichedPayload:',
          enrichedPayload,
        );

        const flattenedFields = Object.assign(
          {},
          ...enrichedPayload.vaultFields,
          console.log(
            '🚀 ~ TopicService ~ handleTopicCreatedVV ~ enrichedPayload.vaultFields:',
            enrichedPayload.vaultFields,
          ),
        );
        shapedTopic = {
          Id: record?.Id,
          ModifiedDateTime: record?.ModifiedDateTime,
          ExternalId: record?.ExternalId,
          Description: record?.Description,
          Status: record?.Status,
          ...flattenedFields,
        };
        veevaTopicsShape.push(shapedTopic);
      } else {
        shapedTopic = {
          Id: record?.Id,
          ModifiedDateTime: record?.ModifiedDateTime,
          ExternalId: record?.ExternalId,
          Description: record?.Description,
          Status: record?.Status,
        };
        veevaTopicsShape.push(shapedTopic);
      }
    }
    console.log(
      '🚀 ~ TopicService ~ handleTopicCreatedVV ~ veevaTopicsShape:',
      veevaTopicsShape,
    );

    return {
      success: true,
      message: 'Topic(s) details are updated successfully in Vault',
      data: veevaTopicsShape,
      errorMessage: [],
    };
  }
}
