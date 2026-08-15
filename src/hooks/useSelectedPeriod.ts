import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UUID_V4_CANONICAL_PATTERN } from '../api/finance-types';
import { classifyPeriod, currentPeriodId, pickDefaultPeriod } from '../utils/dates';
import { useFinancePeriods } from './useFinancePeriods';
import type { PeriodId, TemporalClass } from '../types/finance';

const PERIOD_PARAM = 'periodo';

interface SelectedPeriod {
  periodId: string | undefined;
  temporal: TemporalClass;
  setPeriod: (periodId: PeriodId) => void;
  step: (months: number) => void;
}

export function useSelectedPeriod(): SelectedPeriod {
  const [searchParams, setSearchParams] = useSearchParams();
  const periodsQuery = useFinancePeriods();
  const periods = periodsQuery.data?.periods ?? [];
  const candidate = searchParams.get(PERIOD_PARAM);
  const fromUrl =
    candidate !== null && UUID_V4_CANONICAL_PATTERN.test(candidate) ? candidate : undefined;
  const periodId = periodsQuery.isSuccess
    ? fromUrl !== undefined && periods.some((period) => period.id === fromUrl)
      ? fromUrl
      : pickDefaultPeriod(periods)
    : undefined;

  const setPeriod = useCallback(
    (next: PeriodId) => {
      setSearchParams(
        (current) => {
          const params = new URLSearchParams(current);
          params.set(PERIOD_PARAM, next);
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const step = useCallback(
    (months: number) => {
      void months;
    },
    [],
  );

  return {
    periodId,
    temporal: classifyPeriod(currentPeriodId(), currentPeriodId()),
    setPeriod,
    step,
  };
}
