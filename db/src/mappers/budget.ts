export interface Budget {
    TransactionId: string;
    budgetList:    BudgetList[];
}

export interface BudgetList {
    TotalBudget: string;
    Territory:   string;
    StartDate:   Date;
    ExternalId:  string;
    EndDate:     Date;
    BudgetName:  string;
}
