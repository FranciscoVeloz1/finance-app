/**
 * UI-facing domain contracts.
 * Amounts are plain numbers here only for presentation; the backend remains the
 * calculation authority (docs/architecture/finance-app/architecture.md §3.6).
 */

export type AccountType = 'debit' | 'cash' | 'credit' | 'savings-fund' | 'other';

export type ItemStatus = 'planned' | 'realized' | 'cancelled';

export type TemporalClass = 'past' | 'current' | 'future';

export type CoverageStatus = 'sufficient' | 'insufficient' | 'surplus';

export type BudgetGroupId = 'services' | 'groceries' | 'outings' | 'extras';

export type MovementKind =
  | 'income'
  | 'expense'
  | 'transfer'
  | 'credit-purchase'
  | 'credit-payment';

export type AlertLevel = 'info' | 'warning' | 'negative';

/** `YYYY-MM` — a calendar period, never a timestamp. */
export type PeriodId = string;

/** `YYYY-MM-DD` — a calendar date, never a timestamp. */
export type CalendarDate = string;

export interface Account {
  id: string;
  label: string;
  type: AccountType;
  active: boolean;
  openingBalance: number;
  derivedBalance: number;
  includedInProjections: boolean;
  creditLimit?: number;
  creditDebt?: number;
  statementDay?: number;
  paymentDay?: number;
}

export interface PlanVsRealTotals {
  expected: number;
  real: number;
}

export interface CategoryBudget {
  id: BudgetGroupId;
  label: string;
  planned: number;
  real: number;
  limit: number | null;
  /** Remaining against what has actually been consumed. */
  remainingReal: number;
  /** Remaining if every pending planned item is realized; null when none pending. */
  remainingProjected: number | null;
}

export interface Movement {
  id: string;
  date: CalendarDate;
  concept: string;
  kind: MovementKind;
  status: ItemStatus;
  amount: number;
  accountId: string;
  accountLabel: string;
  categoryId?: BudgetGroupId;
  categoryLabel?: string;
  /** Differs from the recurring template that generated it. */
  overridden?: boolean;
  notes?: string;
}

export interface CreditCardSummary {
  accountId: string;
  label: string;
  limit: number;
  debt: number;
  used: number;
  available: number;
  availableProjected: number | null;
  purchases: Movement[];
  payments: Movement[];
}

export interface SavingsFundSummary {
  accountId: string;
  label: string;
  accumulatedBalance: number;
  movements: Movement[];
}

export interface CashWithdrawalSummary {
  amount: number;
  sourceAccountLabel: string;
  targetAccountLabel: string;
  coverage: CoverageStatus;
  cashRemaining: number;
  overridden: boolean;
}

export interface PeriodAlert {
  id: string;
  level: AlertLevel;
  title: string;
  detail: string;
}

export interface Suggestion {
  id: string;
  title: string;
  explanation: string;
  origin: string;
}

export interface PeriodSummary {
  periodId: PeriodId;
  expectedSavings: number;
  realSavings: number;
  availableCash: number;
  income: PlanVsRealTotals;
  expense: PlanVsRealTotals;
  categories: CategoryBudget[];
  accounts: Account[];
  credit: CreditCardSummary[];
  savingsFund: SavingsFundSummary | null;
  withdrawal: CashWithdrawalSummary | null;
  alerts: PeriodAlert[];
  suggestions: Suggestion[];
}

export interface TimelineEntry {
  periodId: PeriodId;
  year?: number;
  month?: number;
  expectedSavings: number;
  hasAlert: boolean;
}

export interface Category {
  id: string;
  label: string;
  group: BudgetGroupId;
  custom: boolean;
  active: boolean;
  usageCount?: number;
}

export interface RecurringRule {
  id: string;
  label: string;
  group: BudgetGroupId;
  kind: 'service' | 'base-budget' | 'withdrawal';
  baseAmount: number;
  effectiveFrom: PeriodId;
  paused: boolean;
}

export interface PropagationDelta {
  periodId: PeriodId;
  concept: string;
  expenseDelta: number;
  savingsDelta: number;
  balanceDelta: number;
}

export interface PropagationConflict {
  periodId: PeriodId;
  concept: string;
  reason: string;
}

export type TableDensity = 'comfortable' | 'compact';

export interface Preferences {
  density: TableDensity;
  hideCancelledByDefault: boolean;
  hidePlannedByDefault: boolean;
  showTemporalClassifier: boolean;
  reducedMotion: boolean;
}

/** Every async zone renders one of these; error keeps a retry affordance. */
export type ZoneStatus = 'loading' | 'ready' | 'empty' | 'error';
