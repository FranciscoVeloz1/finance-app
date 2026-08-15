import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { periodSummaryResponseSchema } from '../../api/finance-schemas';

const fixture = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'fixtures/march-summary.json'), 'utf8'),
) as Record<string, unknown>;

describe('periodSummaryResponseSchema', () => {
  it('accepts the canonical March fixture', () => {
    const parsed = periodSummaryResponseSchema.parse(fixture);
    expect(parsed.summary.totals.expectedExpense).toBe('19400.00');
    expect(parsed.summary.totals.expectedConsumption).toBe('-9400.00');
    expect(parsed.summary.totals.expectedSavings).toBe('29650.00');
    expect(parsed.suggestions.map((suggestion) => suggestion.code)).toContain(
      'CREDIT_PAYMENT_CASH_PRESSURE',
    );
  });

  it('rejects numeric amounts and incomplete decimals', () => {
    const clone = structuredClone(fixture) as { summary: { totals: { expectedExpense: unknown } } };
    clone.summary.totals.expectedExpense = 19400;
    expect(() => periodSummaryResponseSchema.parse(clone)).toThrow();
    clone.summary.totals.expectedExpense = '1234.5';
    expect(() => periodSummaryResponseSchema.parse(clone)).toThrow();
    clone.summary.totals.expectedExpense = '1234.567';
    expect(() => periodSummaryResponseSchema.parse(clone)).toThrow();
  });

  it('rejects a missing or extra breakdown key', () => {
    const missing = structuredClone(fixture) as {
      summary: { breakdowns: Record<string, string[]> };
    };
    delete missing.summary.breakdowns.budgetIds;
    expect(() => periodSummaryResponseSchema.parse(missing)).toThrow();

    const extra = structuredClone(fixture) as {
      summary: { breakdowns: Record<string, string[]> };
    };
    extra.summary.breakdowns.unexpected = [];
    expect(() => periodSummaryResponseSchema.parse(extra)).toThrow();
  });

  it('rejects a non v4 id in breakdowns', () => {
    const clone = structuredClone(fixture) as {
      summary: { breakdowns: { plannedPlanItems: string[] } };
    };
    clone.summary.breakdowns.plannedPlanItems = ['not-a-uuid'];
    expect(() => periodSummaryResponseSchema.parse(clone)).toThrow();
  });
});
