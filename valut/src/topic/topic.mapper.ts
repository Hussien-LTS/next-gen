import { VeevaTopicDto } from './dtos/topic.dto';

export function mapTopicInputToVault(topic: VeevaTopicDto): any {
  const mapped = {
    em_catalog_name__v: topic.Id,
    legacy_crm_id__v: topic.ExternalId,
    external_id__v: topic.ExternalId,
    description__v: topic.Description,
    em_catalog_status__v: topic.Status ?? null,
  };

  const knownKeys = [
    'Id',
    'ExternalId',
    'Description',
    'Status',
    'ModifiedDateTime',
  ];

  const dynamicFields = Object.keys(topic)
    .filter((key) => !knownKeys.includes(key))
    .reduce((acc, key) => {
      acc[key] = topic[key];
      return acc;
    }, {} as Record<string, any>);

  return {
    ...mapped,
    ...dynamicFields,
  };
}