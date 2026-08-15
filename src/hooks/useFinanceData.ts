import { useCallback, useEffect, useState } from 'react';
import type { Movement, PeriodId, PeriodSummary, TimelineEntry, ZoneStatus } from '../types/finance';
import { buildMovements, buildPeriodSummary, buildTimeline } from '../data/placeholder';

export interface AsyncZone<TValue> {
  status: ZoneStatus;
  data: TValue | null;
  retry: () => void;
}

const SIMULATED_LATENCY_MS = 320;

/**
 * Single seam between the UI and the finance read models. The integration specs
 * replace the body with the HTTP client and cache; every page keeps consuming
 * the same `{ status, data, retry }` shape and its loading/empty/error states.
 */
function useZone<TValue>(load: () => TValue, isEmpty: (value: TValue) => boolean): AsyncZone<TValue> {
  const [status, setStatus] = useState<ZoneStatus>('loading');
  const [data, setData] = useState<TValue | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    const timer = window.setTimeout(() => {
      if (cancelled) {
        return;
      }

      try {
        const value = load();
        setData(value);
        setStatus(isEmpty(value) ? 'empty' : 'ready');
      } catch {
        setData(null);
        setStatus('error');
      }
    }, SIMULATED_LATENCY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // `load` is rebuilt per period by the callers below; `attempt` forces a retry.
  }, [load, isEmpty, attempt]);

  const retry = useCallback(() => {
    setAttempt((current) => {
      return current + 1;
    });
  }, []);

  return { status, data, retry };
}

function never(): boolean {
  return false;
}

export function usePeriodSummary(periodId: PeriodId): AsyncZone<PeriodSummary> {
  const load = useCallback(() => {
    return buildPeriodSummary(periodId);
  }, [periodId]);

  return useZone(load, never);
}

export function useTimeline(reference: PeriodId): AsyncZone<TimelineEntry[]> {
  const load = useCallback(() => {
    return buildTimeline(reference);
  }, [reference]);

  const isEmpty = useCallback((entries: TimelineEntry[]) => {
    return entries.length === 0;
  }, []);

  return useZone(load, isEmpty);
}

export function useMovements(periodId: PeriodId): AsyncZone<Movement[]> {
  const load = useCallback(() => {
    return buildMovements(periodId);
  }, [periodId]);

  const isEmpty = useCallback((movements: Movement[]) => {
    return movements.length === 0;
  }, []);

  return useZone(load, isEmpty);
}
