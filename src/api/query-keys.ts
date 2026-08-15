import type { QueryClient } from '@tanstack/react-query';
import type {
  AccountListParams,
  CategoryListFilters,
  PeriodListFilters,
  PlanItemListFilters,
  TransactionListFilters,
} from './finance-types';

export const financeKeys = {
  all: ['finance'] as const,
  periods: (filters?: PeriodListFilters) => [...financeKeys.all, 'periods', filters ?? {}] as const,
  period: (periodId: string) => [...financeKeys.all, 'period', periodId] as const,
  summary: (periodId: string) => [...financeKeys.all, 'summary', periodId] as const,
  accounts: (params?: AccountListParams) => [...financeKeys.all, 'accounts', params ?? {}] as const,
  transactions: (periodId: string, filters?: TransactionListFilters) =>
    [...financeKeys.all, 'transactions', periodId, filters ?? {}] as const,
  planItems: (periodId: string, filters?: PlanItemListFilters) =>
    [...financeKeys.all, 'planItems', periodId, filters ?? {}] as const,
  budgets: (periodId: string) => [...financeKeys.all, 'budgets', periodId] as const,
  categories: (filters?: CategoryListFilters) => [...financeKeys.all, 'categories', filters ?? {}] as const,
  recurringRules: () => [...financeKeys.all, 'recurringRules'] as const,
  projectionPreview: (originPeriodId: string, hash: string) =>
    [...financeKeys.all, 'projectionPreview', originPeriodId, hash] as const,
};

export function invalidatePeriod(queryClient: QueryClient, periodId: string) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: financeKeys.summary(periodId) }),
    queryClient.invalidateQueries({ queryKey: financeKeys.period(periodId) }),
    queryClient.invalidateQueries({ queryKey: financeKeys.transactions(periodId) }),
    queryClient.invalidateQueries({ queryKey: financeKeys.planItems(periodId) }),
    queryClient.invalidateQueries({ queryKey: financeKeys.budgets(periodId) }),
  ]);
}

export function invalidateAffectedPeriods(queryClient: QueryClient, periodIds: string[]) {
  return Promise.all([
    ...periodIds.map((periodId) => invalidatePeriod(queryClient, periodId)),
    queryClient.invalidateQueries({ queryKey: [...financeKeys.all, 'periods'] }),
    queryClient.invalidateQueries({ queryKey: [...financeKeys.all, 'accounts'] }),
  ]);
}
