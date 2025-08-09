export class BudgetDto {
  Id: string;
  ModifiedDateTime: string;
  ExternalId: string;
  StartDate: string;
  EndDate: string;
  TotalBudget: string;
  BudgetName: string;
  Territory: string;
  Source: string;
}

export class CreateBudgetDto {
  TransactionId: string;
  budgetList: BudgetDto[];
}
