export class CreateExpansionRuleDto {
  ruleName: string;
  targetApiId: number;
  customLogic?: string;

  objectName: string;
  centrisField: string;
  vaultField: string;
  dataType: string;
  allowNull: boolean;
  fieldValue: string;
}

export class UpdateExpansionRuleDto {
  ruleName?: string;
  customLogic?: string;

  objectName?: string;
  centrisField?: string;
  vaultField?: string;
  dataType?: string;
  allowNull?: boolean;
  fieldValue?: string;
}
