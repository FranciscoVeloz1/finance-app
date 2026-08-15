import { useQuery } from '@tanstack/react-query';
import { listBudgets } from '../api/finance';
import { financeKeys } from '../api/query-keys';

export function useFinanceBudgets(periodId: string | undefined) {
  return useQuery({
    queryKey: financeKeys.budgets(periodId ?? ''),
    queryFn: ({ signal }) => {
      return listBudgets(periodId!, signal);
    },
    enabled: Boolean(periodId),
    staleTime: 30_000,
  });
}
