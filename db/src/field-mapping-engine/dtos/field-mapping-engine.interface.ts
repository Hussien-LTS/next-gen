export interface FieldMappingRule {
  destinationField: string;
  sourceValue: any;
}

export interface FieldMappingConfig {
  targetApiId: string;
  fieldMappings: FieldMappingRule[];
}

export class ApplyMappingDto {
  targetApiId: string;
  apiDirection: string; // 'inbound' | 'outbound' | 'bi-directional'
  payload: Record<string, any>;
}
