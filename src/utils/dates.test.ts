import { describe, expect, it } from 'vitest';
import {
  classifyPeriod,
  formatPeriodLabel,
  nextCreatableYearMonth,
  pickDefaultPeriod,
  shiftPeriod,
} from './dates';

describe('formatPeriodLabel', () => {
  it('does not drift a month across time zones', () => {
    expect(formatPeriodLabel('2026-01')).toContain('2026');
    expect(formatPeriodLabel('2026-01').toLowerCase()).toContain('enero');
    expect(formatPeriodLabel('4bc02a91-6ad8-4627-8ab9-01c3ee0a1003')).toBe('Periodo');
  });
});

describe('shiftPeriod', () => {
  it('rolls over year boundaries in both directions', () => {
    expect(shiftPeriod('2026-12', 1)).toBe('2027-01');
    expect(shiftPeriod('2026-01', -1)).toBe('2025-12');
  });
});

describe('classifyPeriod', () => {
  it('classifies against the reference period', () => {
    expect(classifyPeriod('2026-07', '2026-08')).toBe('past');
    expect(classifyPeriod('2026-08', '2026-08')).toBe('current');
    expect(classifyPeriod('2026-09', '2026-08')).toBe('future');
  });
});

describe('nextCreatableYearMonth', () => {
  const january = { year: 2026, month: 1 };
  const march = { year: 2026, month: 3 };
  const december = { year: 2026, month: 12 };

  it('uses the calendar month when there are no periods', () => {
    expect(nextCreatableYearMonth([], new Date('2026-08-18T12:00:00'))).toEqual({
      year: 2026,
      month: 8,
    });
  });

  it('creates the month after the latest existing period', () => {
    expect(nextCreatableYearMonth([january, march], new Date('2026-08-18T12:00:00'))).toEqual({
      year: 2026,
      month: 4,
    });
  });

  it('rolls over December into the next year', () => {
    expect(nextCreatableYearMonth([december])).toEqual({ year: 2027, month: 1 });
  });
});

describe('pickDefaultPeriod', () => {
  const january = { id: 'jan', year: 2026, month: 1 };
  const march = { id: 'mar', year: 2026, month: 3 };
  const august = { id: 'aug', year: 2026, month: 8 };

  it('returns undefined for an empty list', () => {
    expect(pickDefaultPeriod([])).toBeUndefined();
  });

  it('prefers the calendar month when it exists', () => {
    expect(pickDefaultPeriod([january, march, august], new Date('2026-08-14T12:00:00'))).toBe('aug');
  });

  it('falls back to the latest period', () => {
    expect(pickDefaultPeriod([january, march], new Date('2026-08-14T12:00:00'))).toBe('mar');
  });
});
