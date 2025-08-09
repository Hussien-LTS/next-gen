import { TerritoryDto } from './DTOs/territory.dto';

export function mapApiResponseToTerritory(
  data: any,
  transactionName,
): TerritoryDto {
  return {
    Id: data.id,
    ModifiedDateTime: data.modified_date__v ?? null,
    ExternalId: data.nni_territory_id__c ?? null,
    ExternalParentId: data.parent_territory__v ?? null,
    Name: data.name__v ?? null,
    transactionName,
  };
}
