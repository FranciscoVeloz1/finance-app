import { useQuery } from '@tanstack/react-query';
import { listTransactions } from '../api/finance';
import { financeKeys } from '../api/query-keys';
import type { TransactionListFilters } from '../api/finance-types';

export function useFinanceTransactions(
  periodId: string | undefined,
  filters?: TransactionListFilters,
) {
  return useQuery({
    queryKey: financeKeys.transactions(periodId ?? '', filters),
    queryFn: ({ signal }) => {
      return listTransactions(periodId!, filters, signal);
    },
    enabled: Boolean(periodId),
    staleTime: 30_000,
  });
}
