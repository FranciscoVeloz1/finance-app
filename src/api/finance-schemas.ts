import { z } from 'zod';
import { PERIOD_SUMMARY_BREAKDOWN_KEYS, type PeriodSummaryBreakdownKey } from './finance-types';

export const UUID_V4_CANONICAL_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export const uuidV4Schema = z
  .string()
  .regex(UUID_V4_CANONICAL_PATTERN, 'Expected canonical UUID v4');

export const calendarDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');

export const moneySchema = z
  .string()
  .regex(/^\d+\.\d{2}$/, 'Expected decimal string with exactly 2 fractional digits');

export const signedMoneySchema = z
  .string()
  .regex(/^-?\d+\.\d{2}$/, 'Expected signed decimal string with exactly 2 fractional digits');

export const financeCategoryGroupSchema = z.enum([
  'MONTHLY_SERVICES',
  'GROCERIES',
  'OUTINGS',
  'EXTRAS',
  'INCOME',
  'TRANSFER',
  'CREDIT',
  'SAVINGS',
  'OTHER',
]);

export const financeTransactionTypeSchema = z.enum([
  'INCOME',
  'EXPENSE',
  'TRANSFER',
  'CREDIT_PURCHASE',
  'CREDIT_PAYMENT',
  'SAVINGS_DEPOSIT',
  'SAVINGS_WITHDRAWAL',
]);

export const planItemStatusSchema = z.enum(['PLANNED', 'REALIZED', 'CANCELLED']);

const uuidIdArraySchema = z.array(uuidV4Schema);

type PeriodSummaryBreakdownShape = {
  [key in PeriodSummaryBreakdownKey]: typeof uuidIdArraySchema;
};

const periodSummaryBreakdownShape: PeriodSummaryBreakdownShape = {
  expectedIncomePlanItems: uuidIdArraySchema,
  receivedIncomeTransactions: uuidIdArraySchema,
  expectedExpensePlanItems: uuidIdArraySchema,
  actualExpenseTransactions: uuidIdArraySchema,
  budgetIds: uuidIdArraySchema,
  budgetRemainingActualByCategory: uuidIdArraySchema,
  budgetRemainingProjectedByCategory: uuidIdArraySchema,
  accountOpeningBalanceAccountIds: uuidIdArraySchema,
  accountEntryTransactions: uuidIdArraySchema,
  accountExitTransactions: uuidIdArraySchema,
  accountClosingBalanceAccountIds: uuidIdArraySchema,
  creditPurchaseTransactions: uuidIdArraySchema,
  creditPaymentTransactions: uuidIdArraySchema,
  cashWithdrawalTransactions: uuidIdArraySchema,
  cashExpenseTransactions: uuidIdArraySchema,
  klarBalanceAccountIds: uuidIdArraySchema,
  klarDepositTransactions: uuidIdArraySchema,
  klarWithdrawalTransactions: uuidIdArraySchema,
  expectedSavingsAccountIds: uuidIdArraySchema,
  actualSavingsAccountIds: uuidIdArraySchema,
  plannedPlanItems: uuidIdArraySchema,
  realizedPlanItems: uuidIdArraySchema,
  realizedTransactions: uuidIdArraySchema,
};

void PERIOD_SUMMARY_BREAKDOWN_KEYS;

export const periodSummaryBreakdownsSchema = z.object(periodSummaryBreakdownShape).strict();

export const periodSummaryTotalsSchema = z
  .object({
    expectedIncome: moneySchema,
    receivedIncome: moneySchema,
    expectedExpense: moneySchema,
    actualExpense: moneySchema,
    expectedSavings: signedMoneySchema,
    actualSavings: signedMoneySchema,
    expectedConsumption: signedMoneySchema,
    cashRemaining: moneySchema,
    creditUsed: moneySchema,
    creditAvailable: moneySchema,
    projectedCreditAvailable: moneySchema,
    klarBalance: moneySchema,
  })
  .strict();

export const periodSummaryCompactSchema = z
  .object({
    expectedIncome: moneySchema,
    receivedIncome: moneySchema,
    expectedExpense: moneySchema,
    actualExpense: moneySchema,
    expectedSavings: signedMoneySchema,
    actualSavings: signedMoneySchema,
    cashRemaining: moneySchema,
    creditAvailable: moneySchema,
    projectedCreditAvailable: moneySchema,
  })
  .strict();

export const suggestionSchema = z
  .object({
    code: z.enum([
      'CASH_WITHDRAWAL_INSUFFICIENT',
      'CATEGORY_NEAR_LIMIT',
      'PROJECTED_SAVINGS_DROP',
      'CREDIT_PAYMENT_CASH_PRESSURE',
      'UNALLOCATED_CASH',
    ]),
    message: z.string(),
    source: z
      .object({
        periodId: uuidV4Schema.optional(),
        categoryGroup: financeCategoryGroupSchema.optional(),
        accountId: uuidV4Schema.optional(),
      })
      .strict(),
    severity: z.enum(['INFO', 'WARNING']),
  })
  .strict();

export const periodSummarySchema = z
  .object({
    totals: periodSummaryTotalsSchema,
    accounts: z.array(
      z
        .object({
          accountId: uuidV4Schema,
          openingBalance: signedMoneySchema,
          closingBalance: signedMoneySchema,
          entries: moneySchema,
          exits: moneySchema,
          debt: moneySchema.optional(),
          creditAvailable: moneySchema.optional(),
          creditLimit: moneySchema.optional(),
        })
        .strict(),
    ),
    categories: z.array(
      z
        .object({
          categoryGroup: financeCategoryGroupSchema,
          limit: moneySchema,
          expected: moneySchema,
          actual: moneySchema,
          remainingActual: signedMoneySchema,
          remainingProjected: signedMoneySchema,
        })
        .strict(),
    ),
    cashWithdrawal: z
      .object({
        withdrawnAmount: moneySchema,
        mandadoOutingsActualFromCash: moneySchema,
        status: z.enum(['SUFFICIENT', 'INSUFFICIENT', 'EXCESS']),
      })
      .strict(),
    breakdowns: periodSummaryBreakdownsSchema,
  })
  .strict();

export const periodSummaryResponseSchema = z
  .object({
    period: z
      .object({
        id: uuidV4Schema,
        year: z.number().int(),
        month: z.number().int().min(1).max(12),
        version: z.number().int(),
      })
      .strict(),
    summary: periodSummarySchema,
    suggestions: z.array(suggestionSchema),
  })
  .strict();

export const periodListItemSchema = z
  .object({
    id: uuidV4Schema,
    year: z.number().int(),
    month: z.number().int().min(1).max(12),
    label: z.string().nullable(),
    classification: z.enum(['PAST', 'CURRENT', 'FUTURE']),
    version: z.number().int(),
    summary: periodSummaryCompactSchema,
  })
  .strict();

export const periodListResponseSchema = z
  .object({
    periods: z.array(periodListItemSchema),
  })
  .strict();

export const accountDtoSchema = z
  .object({
    id: uuidV4Schema,
    name: z.string(),
    type: z.enum(['DEBIT', 'CASH', 'CREDIT', 'SAVINGS', 'OTHER']),
    status: z.enum(['ACTIVE', 'INACTIVE']),
    initialBalance: moneySchema,
    creditLimit: moneySchema.nullable(),
    openingDebt: moneySchema.nullable(),
    statementDay: z.number().int().nullable(),
    paymentDay: z.number().int().nullable(),
    includeInProjections: z.boolean(),
    startsOn: calendarDateSchema,
    derivedBalance: moneySchema.optional(),
    derivedDebt: moneySchema.optional(),
    derivedCreditAvailable: moneySchema.optional(),
  })
  .strict();

export const accountListResponseSchema = z
  .object({
    periodId: uuidV4Schema.optional(),
    accounts: z.array(accountDtoSchema),
  })
  .strict();

export const transactionDtoSchema = z
  .object({
    id: uuidV4Schema,
    periodId: uuidV4Schema,
    type: financeTransactionTypeSchema,
    accountId: uuidV4Schema,
    counterpartyAccountId: uuidV4Schema.nullable(),
    categoryId: uuidV4Schema.nullable(),
    occurredOn: calendarDateSchema,
    amount: moneySchema,
    concept: z.string(),
    notes: z.string().nullable(),
    isHidden: z.boolean(),
    planItemId: uuidV4Schema.nullable(),
  })
  .strict();

export const transactionListResponseSchema = z
  .object({
    transactions: z.array(transactionDtoSchema),
    nextCursor: z.string().nullable(),
  })
  .strict();

export const transactionEnvelopeSchema = z
  .object({
    transaction: transactionDtoSchema,
  })
  .strict();

export const periodListFiltersSchema = z
  .object({
    fromYear: z.number().int().min(2000).max(9999).optional(),
    fromMonth: z.number().int().min(1).max(12).optional(),
    toYear: z.number().int().min(2000).max(9999).optional(),
    toMonth: z.number().int().min(1).max(12).optional(),
  })
  .strict();

export const accountListParamsSchema = z
  .object({
    status: z.enum(['ACTIVE', 'INACTIVE', 'ALL']).optional(),
    periodId: uuidV4Schema.optional(),
    includeBalances: z.boolean().optional().default(false),
  })
  .strict()
  .superRefine((params, ctx) => {
    if (params.includeBalances && !params.periodId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['periodId'],
        message: 'periodId is required when includeBalances=true',
      });
    }
    if (!params.includeBalances && params.periodId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['includeBalances'],
        message: 'periodId requires includeBalances=true',
      });
    }
  });

export const transactionListFiltersSchema = z
  .object({
    type: financeTransactionTypeSchema.optional(),
    accountId: uuidV4Schema.optional(),
    categoryId: uuidV4Schema.optional(),
    fromDate: calendarDateSchema.optional(),
    toDate: calendarDateSchema.optional(),
    includeHidden: z.boolean().optional(),
    cursor: z.string().min(1).optional(),
    limit: z.number().int().min(1).max(100).optional(),
  })
  .strict();

export const planItemListFiltersSchema = z
  .object({
    status: planItemStatusSchema.optional(),
    categoryGroup: financeCategoryGroupSchema.optional(),
    accountId: uuidV4Schema.optional(),
    includeHidden: z.boolean().optional(),
  })
  .strict();

export const categoryListFiltersSchema = z
  .object({
    activeOnly: z.boolean().optional(),
  })
  .strict();

export const projectionDiffSchema = z
  .object({
    periodId: uuidV4Schema,
    year: z.number().int(),
    month: z.number().int().min(1).max(12),
    deltaExpectedExpense: signedMoneySchema,
    deltaActualExpense: signedMoneySchema,
    deltaExpectedSavings: signedMoneySchema,
    accountDeltas: z.record(
      uuidV4Schema,
      z
        .object({
          opening: signedMoneySchema,
          closing: signedMoneySchema,
        })
        .strict(),
    ),
    deltaDebt: signedMoneySchema,
    deltaCreditAvailable: signedMoneySchema,
  })
  .strict();

export const projectionPreviewResponseSchema = z
  .object({
    originPeriodId: uuidV4Schema,
    affectedPeriodIds: z.array(uuidV4Schema),
    diffs: z.array(projectionDiffSchema),
    warnings: z.array(z.string()),
  })
  .strict();

export const projectionConfirmResponseSchema = z
  .object({
    affectedPeriodIds: z.array(uuidV4Schema),
    summaries: z.array(
      z
        .object({
          periodId: uuidV4Schema,
          summary: periodSummaryCompactSchema,
        })
        .strict(),
    ),
  })
  .strict();
