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
  const periodsQuery = useFinancePeriods();
  const periods = periodsQuery.data?.periods ?? [];

  const summaryQuery = useFinanceSummary(periodId);
  const accountsQuery = useFinanceAccounts(
    periodId ? { periodId, includeBalances: true } : undefined,
    Boolean(periodId),
  );
  const transactionsQuery = useFinanceTransactions(periodId, { limit: 20 });

  const summary =
    summaryQuery.data && accountsQuery.data
      ? mapPeriodSummary(
          summaryQuery.data,
          accountsQuery.data.accounts,
          transactionsQuery.data?.transactions ?? [],
        )
      : null;

  const timeline = mapTimeline(periods);
  const detailPending =
    Boolean(periodId) && (summaryQuery.isPending || accountsQuery.isPending || transactionsQuery.isPending);

  return {
    periodId,
    setPeriod,
    periodVersion: summaryQuery.data?.period.version,
    year: summaryQuery.data?.period.year,
    month: summaryQuery.data?.period.month,
    summary,
    timeline,
    summaryZone: {
      status: zoneFromQuery(
        periodsQuery.isPending || detailPending,
        summaryQuery.isError,
        periodsQuery.isSuccess && periodId === undefined,
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
        periodsQuery.isSuccess && periods.length === 0,
      ),
      data: timeline,
      retry: () => {
        void periodsQuery.refetch();
      },
    },
  };
}
