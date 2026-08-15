import { useQuery } from '@tanstack/react-query';
import { getPeriodSummary } from '../api/finance';
import { financeKeys } from '../api/query-keys';

export function useFinanceSummary(periodId: string | undefined) {
  return useQuery({
    queryKey: financeKeys.summary(periodId ?? ''),
    queryFn: ({ signal }) => {
      return getPeriodSummary(periodId!, signal);
    },
    enabled: Boolean(periodId),
    staleTime: 30_000,
  });
}
