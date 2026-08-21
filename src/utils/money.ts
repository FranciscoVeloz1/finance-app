export type AmountTone = 'positive' | 'negative' | 'neutral';

export function assertMoneyString(value: unknown): asserts value is string {
  if (typeof value !== 'string' || !/^-?\d+\.\d{2}$/.test(value)) {
    throw new Error('Expected decimal string with exactly 2 fractional digits');
  }
}

export function parseMoney(value: string): bigint {
  assertMoneyString(value);
  const negative = value.startsWith('-');
  const digits = negative ? value.slice(1) : value;
  const [whole = '0', fraction = '00'] = digits.split('.');
  const cents = BigInt(whole) * 100n + BigInt(fraction.slice(0, 2).padEnd(2, '0'));
  return negative ? -cents : cents;
}

export function moneyToNumber(value: string): number {
  return Number(parseMoney(value)) / 100;
}

export function formatMoneyMx(value: string): string {
  return formatMXN(moneyToNumber(value));
}

/** Hoisted: constructing an Intl formatter costs more than the format call. */
const MXN_FORMATTER = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const MINUS_SIGN = '\u2212';

export function formatMXN(amount: number): string {
  return MXN_FORMATTER.format(amount);
}

/**
 * Signed presentation. Accessibility requires meaning to survive without color,
 * so the sign is always rendered (15-ux-ui-responsive-and-accessibility CA-05).
 */
export function formatSignedMXN(amount: number): string {
  if (amount === 0) {
    return MXN_FORMATTER.format(0);
  }

  const magnitude = MXN_FORMATTER.format(Math.abs(amount));

  if (amount > 0) {
    return `+${magnitude}`;
  }

  return `${MINUS_SIGN}${magnitude}`;
}

export function toUnsignedMoneyString(raw: string): string | null {
  const normalized = raw.trim().replace(',', '.');
  if (normalized.length === 0) {
    return '0.00';
  }

  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) {
    return null;
  }

  return value.toFixed(2);
}

export function amountTone(amount: number): AmountTone {
  if (amount > 0) {
    return 'positive';
  }

  if (amount < 0) {
    return 'negative';
  }

  return 'neutral';
}

/** Spoken form for screen readers, where "+" and "−" are unreliable. */
export function describeAmount(amount: number): string {
  const magnitude = MXN_FORMATTER.format(Math.abs(amount));

  if (amount < 0) {
    return `menos ${magnitude}`;
  }

  return magnitude;
}

export function percentOf(value: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, (value / total) * 100));
}

export type BudgetLevel = 'normal' | 'warning' | 'over';

/** Shared thresholds so the bar, the badge and the alert never disagree. */
export function budgetLevel(consumed: number, limit: number | null): BudgetLevel {
  if (limit === null || limit <= 0) {
    return 'normal';
  }

  if (consumed > limit) {
    return 'over';
  }

  if (consumed / limit >= 0.85) {
    return 'warning';
  }

  return 'normal';
}
