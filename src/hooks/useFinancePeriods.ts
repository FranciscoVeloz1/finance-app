import { useQuery } from '@tanstack/react-query';
import { listPeriods } from '../api/finance';
import { financeKeys } from '../api/query-keys';
import type { PeriodListFilters } from '../api/finance-types';

export function useFinancePeriods(filters?: PeriodListFilters) {
  return useQuery({
    queryKey: financeKeys.periods(filters),
    queryFn: ({ signal }) => {
      return listPeriods(filters, signal);
    },
    staleTime: 30_000,
  });
}
