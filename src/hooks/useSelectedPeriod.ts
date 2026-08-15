import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MARCH_PERIOD_ID, UUID_V4_CANONICAL_PATTERN } from '../api/finance-types';
import { classifyPeriod, currentPeriodId } from '../utils/dates';
import type { PeriodId, TemporalClass } from '../types/finance';

const PERIOD_PARAM = 'periodo';

interface SelectedPeriod {
  periodId: PeriodId;
  temporal: TemporalClass;
  setPeriod: (periodId: PeriodId) => void;
  step: (months: number) => void;
}

export function useSelectedPeriod(): SelectedPeriod {
  const [searchParams, setSearchParams] = useSearchParams();
  const candidate = searchParams.get(PERIOD_PARAM);
  const periodId =
    candidate !== null && UUID_V4_CANONICAL_PATTERN.test(candidate) ? candidate : MARCH_PERIOD_ID;

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
