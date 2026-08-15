import { describe, expect, it } from 'vitest';
import { amountTone, budgetLevel, formatSignedMXN, percentOf } from './money';

describe('formatSignedMXN', () => {
  it('keeps meaning without color by always rendering a sign', () => {
    expect(formatSignedMXN(1200)).toMatch(/^\+/);
    expect(formatSignedMXN(-1200)).toMatch(/^\u2212/);
  });

  it('renders zero without a sign', () => {
    expect(formatSignedMXN(0)).not.toMatch(/^[+\u2212]/);
  });
});

describe('amountTone', () => {
  it('maps sign to a semantic tone', () => {
    expect(amountTone(1)).toBe('positive');
    expect(amountTone(-1)).toBe('negative');
    expect(amountTone(0)).toBe('neutral');
  });
});

describe('budgetLevel', () => {
  it('warns near the limit and flags over-budget', () => {
    expect(budgetLevel(10, 100)).toBe('normal');
    expect(budgetLevel(90, 100)).toBe('warning');
    expect(budgetLevel(120, 100)).toBe('over');
  });

  it('stays normal when no limit applies', () => {
    expect(budgetLevel(120, null)).toBe('normal');
  });
});

describe('percentOf', () => {
  it('clamps to the track', () => {
    expect(percentOf(150, 100)).toBe(100);
    expect(percentOf(-10, 100)).toBe(0);
    expect(percentOf(10, 0)).toBe(0);
  });
});
