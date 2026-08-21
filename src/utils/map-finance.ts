import type {
  AccountDto,
  FinanceAccountType,
  PeriodListItem,
  PeriodSummaryResponse,
  SuggestionDto,
  TransactionDto,
} from '../api/finance-types';
import type {
  Account,
  AccountType,
  BudgetGroupId,
  CategoryBudget,
  CoverageStatus,
  Movement,
  MovementKind,
  PeriodAlert,
  PeriodSummary,
  Suggestion,
  TemporalClass,
  TimelineEntry,
} from '../types/finance';
import { BUDGET_GROUP_LABEL } from './labels';
import { moneyToNumber } from './money';

const GROUP_TO_UI: Partial<Record<string, BudgetGroupId>> = {
  MONTHLY_SERVICES: 'services',
  GROCERIES: 'groceries',
  OUTINGS: 'outings',
  EXTRAS: 'extras',
};

const ACCOUNT_TYPE_TO_UI: Record<string, AccountType> = {
  DEBIT: 'debit',
  CASH: 'cash',
  CREDIT: 'credit',
  SAVINGS: 'savings-fund',
  OTHER: 'other',
};

export const ACCOUNT_TYPE_TO_API: Record<AccountType, FinanceAccountType> = {
  debit: 'DEBIT',
  cash: 'CASH',
  credit: 'CREDIT',
  'savings-fund': 'SAVINGS',
  other: 'OTHER',
};

const KIND_TO_UI: Record<string, MovementKind> = {
  INCOME: 'income',
  EXPENSE: 'expense',
  TRANSFER: 'transfer',
  CREDIT_PURCHASE: 'credit-purchase',
  CREDIT_PAYMENT: 'credit-payment',
  SAVINGS_DEPOSIT: 'transfer',
  SAVINGS_WITHDRAWAL: 'transfer',
};

const SUGGESTION_TITLE: Record<string, string> = {
  CASH_WITHDRAWAL_INSUFFICIENT: 'Retiro de efectivo insuficiente',
  CATEGORY_NEAR_LIMIT: 'Categoría cerca del límite',
  PROJECTED_SAVINGS_DROP: 'Caída del ahorro esperado',
  CREDIT_PAYMENT_CASH_PRESSURE: 'Pago de tarjeta con poca liquidez',
  UNALLOCATED_CASH: 'Efectivo sin asignar a ahorro',
};

function coverageOf(status: string): CoverageStatus {
  if (status === 'INSUFFICIENT') {
    return 'insufficient';
  }
  if (status === 'EXCESS') {
    return 'surplus';
  }
  return 'sufficient';
}

export function temporalFromApi(value: 'PAST' | 'CURRENT' | 'FUTURE'): TemporalClass {
  if (value === 'PAST') {
    return 'past';
  }
  if (value === 'FUTURE') {
    return 'future';
  }
  return 'current';
}

export function mapSuggestion(dto: SuggestionDto): Suggestion {
  return {
    id: dto.code,
    title: SUGGESTION_TITLE[dto.code] ?? dto.code,
    explanation: dto.message,
    origin: dto.source.categoryGroup ?? dto.source.accountId ?? dto.source.periodId ?? 'periodo',
  };
}

const CATEGORY_ID_TO_GROUP: Record<string, BudgetGroupId> = {
  '9bde3079-486b-44f1-97d5-49a0d3e91002': 'services',
  '9bde3079-486b-44f1-97d5-49a0d3e91003': 'groceries',
  '9bde3079-486b-44f1-97d5-49a0d3e91004': 'outings',
  '9bde3079-486b-44f1-97d5-49a0d3e91005': 'extras',
};

export function mapTransaction(dto: TransactionDto, accounts: AccountDto[]): Movement {
  const account = accounts.find((candidate) => candidate.id === dto.accountId);
  const categoryId = dto.categoryId ? CATEGORY_ID_TO_GROUP[dto.categoryId] : undefined;
  return {
    id: dto.id,
    date: dto.occurredOn,
    concept: dto.concept,
    kind: KIND_TO_UI[dto.type] ?? 'expense',
    status: 'realized',
    amount: moneyToNumber(dto.amount),
    accountId: dto.accountId,
    accountLabel: account?.name ?? 'Cuenta',
    categoryId,
    notes: dto.notes ?? undefined,
  };
}

export function mapAccounts(dtos: AccountDto[]): Account[] {
  return dtos.map((dto) => {
    const type = ACCOUNT_TYPE_TO_UI[dto.type] ?? 'other';
    const derived =
      dto.type === 'CREDIT'
        ? moneyToNumber(dto.derivedDebt ?? dto.openingDebt ?? '0.00')
        : moneyToNumber(dto.derivedBalance ?? dto.initialBalance);
    return {
      id: dto.id,
      label: dto.name,
      type,
      active: dto.status === 'ACTIVE',
      openingBalance: moneyToNumber(dto.initialBalance),
      derivedBalance: derived,
      includedInProjections: dto.includeInProjections,
      creditLimit: dto.creditLimit ? moneyToNumber(dto.creditLimit) : undefined,
      creditDebt: dto.derivedDebt ? moneyToNumber(dto.derivedDebt) : undefined,
      statementDay: dto.statementDay ?? undefined,
      paymentDay: dto.paymentDay ?? undefined,
    };
  });
}

export function mapTimeline(periods: PeriodListItem[]): TimelineEntry[] {
  return periods.map((period) => {
    return {
      periodId: period.id,
      year: period.year,
      month: period.month,
      expectedSavings: moneyToNumber(period.summary.expectedSavings),
      hasAlert: moneyToNumber(period.summary.expectedSavings) < 0,
    };
  });
}

export function mapPeriodSummary(
  response: PeriodSummaryResponse,
  accounts: AccountDto[],
  transactions: TransactionDto[],
): PeriodSummary {
  const { summary, period, suggestions } = response;
  const totals = summary.totals;
  const accountById = new Map(accounts.map((account) => [account.id, account]));
  const debit = accounts.find((account) => account.type === 'DEBIT');
  const cash = accounts.find((account) => account.type === 'CASH');
  const klar = accounts.find((account) => account.type === 'SAVINGS');

  const categories: CategoryBudget[] = summary.categories.flatMap((category) => {
    const id = GROUP_TO_UI[category.categoryGroup];
    if (id === undefined) {
      return [];
    }
    return [
      {
        id,
        label: BUDGET_GROUP_LABEL[id],
        planned: moneyToNumber(category.expected),
        real: moneyToNumber(category.actual),
        limit: moneyToNumber(category.limit),
        remainingReal: moneyToNumber(category.remainingActual),
        remainingProjected: moneyToNumber(category.remainingProjected),
      },
    ];
  });

  const credit = summary.accounts.flatMap((row) => {
    const account = accountById.get(row.accountId);
    if (account?.type !== 'CREDIT') {
      return [];
    }
    const purchases = transactions.filter((tx) => tx.type === 'CREDIT_PURCHASE');
    const payments = transactions.filter((tx) => tx.type === 'CREDIT_PAYMENT');
    return [
      {
        accountId: row.accountId,
        label: account.name,
        limit: moneyToNumber(row.creditLimit ?? '0.00'),
        debt: moneyToNumber(row.debt ?? '0.00'),
        used: moneyToNumber(row.debt ?? '0.00'),
        available: moneyToNumber(row.creditAvailable ?? totals.creditAvailable),
        availableProjected: moneyToNumber(totals.projectedCreditAvailable),
        purchases: purchases.map((tx) => mapTransaction(tx, accounts)),
        payments: payments.map((tx) => mapTransaction(tx, accounts)),
      },
    ];
  });

  const alerts: PeriodAlert[] = suggestions
    .filter((suggestion) => suggestion.severity === 'WARNING')
    .slice(0, 2)
    .map((suggestion) => {
      return {
        id: suggestion.code,
        level: suggestion.code === 'CASH_WITHDRAWAL_INSUFFICIENT' ? 'negative' : 'warning',
        title: SUGGESTION_TITLE[suggestion.code] ?? suggestion.code,
        detail: suggestion.message,
      };
    });

  return {
    periodId: period.id,
    expectedSavings: moneyToNumber(totals.expectedSavings),
    realSavings: moneyToNumber(totals.actualSavings),
    availableCash: moneyToNumber(totals.actualSavings),
    income: {
      expected: moneyToNumber(totals.expectedIncome),
      real: moneyToNumber(totals.receivedIncome),
    },
    expense: {
      expected: moneyToNumber(totals.expectedExpense),
      real: moneyToNumber(totals.actualExpense),
    },
    categories,
    accounts: mapAccounts(accounts),
    credit,
    savingsFund: klar
      ? {
          accountId: klar.id,
          label: klar.name,
          accumulatedBalance: moneyToNumber(totals.klarBalance),
          movements: transactions
            .filter((tx) => tx.type === 'SAVINGS_DEPOSIT' || tx.type === 'SAVINGS_WITHDRAWAL')
            .map((tx) => mapTransaction(tx, accounts)),
        }
      : null,
    withdrawal:
      cash && debit
        ? {
            amount: moneyToNumber(summary.cashWithdrawal.withdrawnAmount),
            sourceAccountLabel: debit.name,
            targetAccountLabel: cash.name,
            coverage: coverageOf(summary.cashWithdrawal.status),
            cashRemaining: moneyToNumber(totals.cashRemaining),
            overridden: false,
          }
        : null,
    alerts,
    suggestions: suggestions.map(mapSuggestion),
  };
}
