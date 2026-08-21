import type { CalendarDate, PeriodId, TemporalClass } from '../types/finance';

// Formatting in UTC too: the dates below are built as UTC midnight, and a local
// render would push them back a day (and sometimes a month) west of Greenwich.
const MONTH_FORMATTER = new Intl.DateTimeFormat('es-MX', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

const DAY_FORMATTER = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: 'short',
  timeZone: 'UTC',
});

/**
 * Period ids are calendar values (`YYYY-MM`). They are parsed as UTC on purpose:
 * a local-time parse shifts `2026-01` into December for negative offsets.
 */
function toUtcDate(periodId: PeriodId): Date {
  const [year, month] = periodId.split('-');
  return new Date(Date.UTC(Number(year), Number(month) - 1, 1));
}

const YEAR_MONTH_PATTERN = /^\d{4}-\d{2}$/;

export function formatPeriodLabel(periodId: PeriodId): string {
  if (!YEAR_MONTH_PATTERN.test(periodId)) {
    return 'Periodo';
  }

  const label = MONTH_FORMATTER.format(toUtcDate(periodId));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatYearMonth(year: number, month: number): string {
  const padded = String(month).padStart(2, '0');
  return formatPeriodLabel(`${year}-${padded}`);
}

export function formatCalendarDate(date: CalendarDate): string {
  const [year, month, day] = date.split('-');
  return DAY_FORMATTER.format(
    new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))),
  );
}

export function currentPeriodId(now: Date = new Date()): PeriodId {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${month}`;
}

export function shiftPeriod(periodId: PeriodId, months: number): PeriodId {
  const date = toUtcDate(periodId);
  date.setUTCMonth(date.getUTCMonth() + months);
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${date.getUTCFullYear()}-${month}`;
}

/** Informative only — a past period stays fully editable. */
export function classifyPeriod(
  periodId: PeriodId,
  reference: PeriodId = currentPeriodId(),
): TemporalClass {
  if (periodId === reference) {
    return 'current';
  }

  if (periodId < reference) {
    return 'past';
  }

  return 'future';
}

export function comparePeriods(a: PeriodId, b: PeriodId): number {
  if (a === b) {
    return 0;
  }

  return a < b ? -1 : 1;
}

export function nextCreatableYearMonth(
  periods: Array<{ year: number; month: number }>,
  now: Date = new Date(),
): { year: number; month: number } {
  const first = periods[0];
  if (first === undefined) {
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }

  let latest = first;
  for (let index = 1; index < periods.length; index += 1) {
    const period = periods[index];
    if (period === undefined) {
      continue;
    }
    if (period.year > latest.year || (period.year === latest.year && period.month > latest.month)) {
      latest = period;
    }
  }

  const nextId = shiftPeriod(`${latest.year}-${String(latest.month).padStart(2, '0')}`, 1);
  const [year, month] = nextId.split('-');
  return { year: Number(year), month: Number(month) };
}

export function pickDefaultPeriod<T extends { id: string; year: number; month: number }>(
  periods: T[],
  now: Date = new Date(),
): string | undefined {
  if (periods.length === 0) {
    return undefined;
  }

  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const current = periods.find((period) => period.year === year && period.month === month);
  if (current !== undefined) {
    return current.id;
  }

  let latest = periods[0];
  for (let index = 1; index < periods.length; index += 1) {
    const period = periods[index];
    if (period.year > latest.year || (period.year === latest.year && period.month > latest.month)) {
      latest = period;
    }
  }

  return latest.id;
}
