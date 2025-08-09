export function mapBudgetInputToVault(input: {
  TransactionId: string;
  budgetList: {
    TotalBudget: string;
    Territory: string;
    StartDate: string;
    ExternalId: string;
    EndDate: string;
    BudgetName: string;
  }[];
}): any[] {
  return input.budgetList.map((budget) => ({
    name__v: budget.BudgetName,
    end_date__v: budget.EndDate,
    external_id__v: budget.ExternalId,
    start_date__v: budget.StartDate,
    territory__v: budget.Territory,
    total_budget__v: Number(budget.TotalBudget),
    legacy_crm_id__v: budget.ExternalId,
  }));
}

export function mapVaultBudgetToCentries(vaultData) {
  const mappedBudget = {
    budgetList: [
      {
        TotalBudget: vaultData.total_budget__v?.toString() ?? '0.0',
        Territory: vaultData.territory__v,
        StartDate: vaultData?.start_date__v ?? '',
        ExternalId: vaultData?.external_id__v ?? '',
        EndDate: vaultData?.end_date__v ?? '',
        BudgetName: vaultData?.name__v ?? '',
      },
    ],
  };

  return mappedBudget;
}
