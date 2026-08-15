import { describe, expect, it } from 'vitest';
import { classifyPeriod, formatPeriodLabel, shiftPeriod } from './dates';

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
