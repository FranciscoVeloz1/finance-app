import type { AccountType, BudgetGroupId } from '../types/finance';

export const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = {
  debit: 'Débito',
  cash: 'Efectivo',
  credit: 'Crédito',
  'savings-fund': 'Fondo de ahorro',
  other: 'Otro',
};

export const BUDGET_GROUP_LABEL: Record<BudgetGroupId, string> = {
  services: 'Servicios',
  groceries: 'Mandado',
  outings: 'Salidas',
  extras: 'Extras',
};
