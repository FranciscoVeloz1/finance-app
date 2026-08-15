import { useQuery } from '@tanstack/react-query';
import { listPlanItems } from '../api/finance';
import { financeKeys } from '../api/query-keys';
import type { PlanItemListFilters } from '../api/finance-types';

export function useFinancePlanItems(periodId: string | undefined, filters?: PlanItemListFilters) {
  return useQuery({
    queryKey: financeKeys.planItems(periodId ?? '', filters),
    queryFn: ({ signal }) => {
      return listPlanItems(periodId!, filters, signal);
    },
    enabled: Boolean(periodId),
    staleTime: 30_000,
  });
}
