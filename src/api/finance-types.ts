export const UUID_V4_CANONICAL_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export const MARCH_PERIOD_ID = '4bc02a91-6ad8-4627-8ab9-01c3ee0a1003';
export const EXTRAS_TX_ID = 'e8c54f93-3b6d-4c28-8e8b-4fcd709e4011';

export const PERIOD_SUMMARY_BREAKDOWN_KEYS = [
  'expectedIncomePlanItems',
  'receivedIncomeTransactions',
  'expectedExpensePlanItems',
  'actualExpenseTransactions',
  'budgetIds',
  'budgetRemainingActualByCategory',
  'budgetRemainingProjectedByCategory',
  'accountOpeningBalanceAccountIds',
  'accountEntryTransactions',
  'accountExitTransactions',
  'accountClosingBalanceAccountIds',
  'creditPurchaseTransactions',
  'creditPaymentTransactions',
  'cashWithdrawalTransactions',
  'cashExpenseTransactions',
  'klarBalanceAccountIds',
  'klarDepositTransactions',
  'klarWithdrawalTransactions',
  'expectedSavingsAccountIds',
  'actualSavingsAccountIds',
  'plannedPlanItems',
  'realizedPlanItems',
  'realizedTransactions',
] as const;

export type PeriodSummaryBreakdownKey = (typeof PERIOD_SUMMARY_BREAKDOWN_KEYS)[number];

export type FinanceAccountType = 'DEBIT' | 'CASH' | 'CREDIT' | 'SAVINGS' | 'OTHER';
export type FinanceAccountStatus = 'ACTIVE' | 'INACTIVE';
export type FinanceCategoryGroup =
  | 'MONTHLY_SERVICES'
  | 'GROCERIES'
  | 'OUTINGS'
  | 'EXTRAS'
  | 'INCOME'
  | 'TRANSFER'
  | 'CREDIT'
  | 'SAVINGS'
  | 'OTHER';
export type FinanceTransactionType =
  | 'INCOME'
  | 'EXPENSE'
  | 'TRANSFER'
  | 'CREDIT_PURCHASE'
  | 'CREDIT_PAYMENT'
  | 'SAVINGS_DEPOSIT'
  | 'SAVINGS_WITHDRAWAL';
export type PlanItemStatus = 'PLANNED' | 'REALIZED' | 'CANCELLED';
export type SuggestionCode =
  | 'CASH_WITHDRAWAL_INSUFFICIENT'
  | 'CATEGORY_NEAR_LIMIT'
  | 'PROJECTED_SAVINGS_DROP'
  | 'CREDIT_PAYMENT_CASH_PRESSURE'
  | 'UNALLOCATED_CASH';

export interface PeriodListFilters {
  fromYear?: number;
  fromMonth?: number;
  toYear?: number;
  toMonth?: number;
}

export interface AccountListParams {
  status?: 'ACTIVE' | 'INACTIVE' | 'ALL';
  periodId?: string;
  includeBalances?: boolean;
}

export interface TransactionListFilters {
  type?: FinanceTransactionType;
  accountId?: string;
  categoryId?: string;
  fromDate?: string;
  toDate?: string;
  includeHidden?: boolean;
  cursor?: string;
  limit?: number;
}

export interface PlanItemListFilters {
  status?: PlanItemStatus;
  categoryGroup?: FinanceCategoryGroup;
  accountId?: string;
  includeHidden?: boolean;
}

export interface CategoryListFilters {
  activeOnly?: boolean;
}

export interface PeriodDto {
  id: string;
  year: number;
  month: number;
  label: string | null;
  notes: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface PeriodListItem {
  id: string;
  year: number;
  month: number;
  label: string | null;
  classification: 'PAST' | 'CURRENT' | 'FUTURE';
  version: number;
  summary: PeriodSummaryCompact;
}

export interface PeriodSummaryCompact {
  expectedIncome: string;
  receivedIncome: string;
  expectedExpense: string;
  actualExpense: string;
  expectedSavings: string;
  actualSavings: string;
  cashRemaining: string;
  creditAvailable: string;
  projectedCreditAvailable: string;
}

export interface PeriodSummaryTotals {
  expectedIncome: string;
  receivedIncome: string;
  expectedExpense: string;
  actualExpense: string;
  expectedSavings: string;
  actualSavings: string;
  expectedConsumption: string;
  cashRemaining: string;
  creditUsed: string;
  creditAvailable: string;
  projectedCreditAvailable: string;
  klarBalance: string;
}

export interface AccountBalanceBreakdownDto {
  accountId: string;
  openingBalance: string;
  closingBalance: string;
  entries: string;
  exits: string;
  debt?: string;
  creditAvailable?: string;
  creditLimit?: string;
}

export interface CategoryTotalsDto {
  categoryGroup: FinanceCategoryGroup;
  limit: string;
  expected: string;
  actual: string;
  remainingActual: string;
  remainingProjected: string;
}

export interface CashWithdrawalCoverageDto {
  withdrawnAmount: string;
  mandadoOutingsActualFromCash: string;
  status: 'SUFFICIENT' | 'INSUFFICIENT' | 'EXCESS';
}

export interface PeriodSummaryDto {
  totals: PeriodSummaryTotals;
  accounts: AccountBalanceBreakdownDto[];
  categories: CategoryTotalsDto[];
  cashWithdrawal: CashWithdrawalCoverageDto;
  breakdowns: Record<PeriodSummaryBreakdownKey, string[]>;
}

export interface SuggestionDto {
  code: SuggestionCode;
  message: string;
  source: { periodId?: string; categoryGroup?: string; accountId?: string };
  severity: 'INFO' | 'WARNING';
}

export interface PeriodSummaryResponse {
  period: { id: string; year: number; month: number; version: number };
  summary: PeriodSummaryDto;
  suggestions: SuggestionDto[];
}

export interface TransactionDto {
  id: string;
  periodId: string;
  type: FinanceTransactionType;
  accountId: string;
  counterpartyAccountId: string | null;
  categoryId: string | null;
  occurredOn: string;
  amount: string;
  concept: string;
  notes: string | null;
  isHidden: boolean;
  planItemId: string | null;
}

export interface AccountDto {
  id: string;
  name: string;
  type: FinanceAccountType;
  status: FinanceAccountStatus;
  initialBalance: string;
  creditLimit: string | null;
  openingDebt: string | null;
  statementDay: number | null;
  paymentDay: number | null;
  includeInProjections: boolean;
  startsOn: string;
  derivedBalance?: string;
  derivedDebt?: string;
  derivedCreditAvailable?: string;
}

export interface ProjectionDiffDto {
  periodId: string;
  year: number;
  month: number;
  deltaExpectedExpense: string;
  deltaActualExpense: string;
  deltaExpectedSavings: string;
  accountDeltas: Record<string, { opening: string; closing: string }>;
  deltaDebt: string;
  deltaCreditAvailable: string;
}

export interface ProjectionPreviewResponse {
  originPeriodId: string;
  affectedPeriodIds: string[];
  diffs: ProjectionDiffDto[];
  warnings: string[];
}

export interface ProjectionConfirmResponse {
  affectedPeriodIds: string[];
  summaries: Array<{ periodId: string; summary: PeriodSummaryCompact }>;
}

export type PropagationChangeInput =
  | {
      kind: 'UPDATE_TRANSACTION';
      transactionId: string;
      patch: { amount?: string; concept?: string };
    }
  | {
      kind: 'UPDATE_PLAN_ITEM';
      planItemId: string;
      patch: Record<string, unknown>;
    }
  | {
      kind: 'UPDATE_BUDGET';
      categoryGroup: string;
      limitAmount: string;
      scope: 'THIS_PERIOD' | 'FUTURE';
    }
  | {
      kind: 'UPDATE_RECURRING_RULE';
      ruleId: string;
      patch: { amount?: string; occurrencesPerMonth?: number };
      scope: 'FUTURE';
    };
