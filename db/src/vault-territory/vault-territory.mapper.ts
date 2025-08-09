import { Territory } from '../entities/territory.entity';

export function mapApiResponseToTerritory(data: any): Territory {
  const territory = new Territory();
  territory.Id = data.id;
  territory.ModifiedDateTime = data.modified_date__v ?? null;
  territory.ExternalId = data.nni_territory_id__c ?? null;
  territory.ExternalParentId = data.parent_territory__v ?? null;
  territory.Name = data.name__v ?? null;
  return territory;
}

export function mapSalesforceTerritory(input: any): any {
  console.log('🚀 ~ mapSalesforceTerritory ~ input:', input);
  return {
    transactionId: input?.transaction_id__v || null,
    terDataList: [
      {
        parentMstrId: input?.parent_territory__v || null,
        name: input?.name__v || null,
        masterId: input?.id || null,
      },
    ],
  };
}
