import { useFinanceAccounts } from './useFinanceAccounts';
import { useFinancePeriods } from './useFinancePeriods';
import { useFinanceSummary } from './useFinanceSummary';
import { useFinanceTransactions } from './useFinanceTransactions';
import { useSelectedPeriod } from './useSelectedPeriod';
import { mapPeriodSummary, mapTimeline } from '../utils/map-finance';
import type { ZoneStatus } from '../types/finance';

function zoneFromQuery(isPending: boolean, isError: boolean, isEmpty: boolean): ZoneStatus {
  if (isPending) {
    return 'loading';
  }
  if (isError) {
    return 'error';
  }
  if (isEmpty) {
    return 'empty';
  }
  return 'ready';
}

export function useDashboardData() {
  const { periodId, setPeriod } = useSelectedPeriod();
  const periodsQuery = useFinancePeriods({ fromYear: 2026, fromMonth: 1, toYear: 2026, toMonth: 5 });
  const periods = periodsQuery.data?.periods ?? [];
  const selected =
    periods.some((period) => period.id === periodId) || periods.length === 0
      ? periodId
      : (periods.find((period) => period.year === 2026 && period.month === 3)?.id ?? periods[0]?.id);

  const summaryQuery = useFinanceSummary(periods.length > 0 ? selected : undefined);
  const accountsQuery = useFinanceAccounts(
    selected ? { periodId: selected, includeBalances: true } : undefined,
    Boolean(selected) && periods.length > 0,
  );
  const transactionsQuery = useFinanceTransactions(selected, { limit: 20 });

  const summary =
    summaryQuery.data && accountsQuery.data
      ? mapPeriodSummary(
          summaryQuery.data,
          accountsQuery.data.accounts,
          transactionsQuery.data?.transactions ?? [],
        )
      : null;

  const timeline = mapTimeline(periods);

  return {
    periodId: selected ?? periodId,
    setPeriod,
    periodVersion: summaryQuery.data?.period.version,
    year: summaryQuery.data?.period.year,
    month: summaryQuery.data?.period.month,
    summary,
    timeline,
    summaryZone: {
      status: zoneFromQuery(
        summaryQuery.isPending,
        summaryQuery.isError,
        !summaryQuery.isPending && summary === null && periods.length === 0,
      ),
      data: summary,
      retry: () => {
        void summaryQuery.refetch();
      },
    },
    timelineZone: {
      status: zoneFromQuery(
        periodsQuery.isPending,
        periodsQuery.isError,
        !periodsQuery.isPending && periods.length === 0,
      ),
      data: timeline,
      retry: () => {
        void periodsQuery.refetch();
      },
    },
  };
}
