import { ZodError, type ZodType } from 'zod';
import { request } from './http';
import { parseWithApiError } from './parse';
import { ApiError } from './types';
import {
  accountListParamsSchema,
  accountListResponseSchema,
  periodListFiltersSchema,
  periodListResponseSchema,
  periodSummaryResponseSchema,
  planItemListFiltersSchema,
  transactionListFiltersSchema,
  transactionListResponseSchema,
  uuidV4Schema,
} from './finance-schemas';
import type {
  AccountListParams,
  PeriodListFilters,
  PeriodSummaryResponse,
  PlanItemListFilters,
  TransactionListFilters,
} from './finance-types';

function parseQuery<T>(schema: ZodType<T>, value: unknown): T {
  try {
    return schema.parse(value);
  } catch (cause) {
    if (cause instanceof ZodError) {
      throw new ApiError(422, {
        error: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: cause.issues,
      });
    }
    throw cause;
  }
}

export function listAccountsUrl(params?: AccountListParams): string {
  const parsed = parseQuery(accountListParamsSchema, params ?? {});
  const query = new URLSearchParams();
  if (parsed.status !== undefined) {
    query.set('status', parsed.status);
  }
  if (parsed.periodId !== undefined && parsed.includeBalances) {
    query.set('periodId', parsed.periodId);
    query.set('includeBalances', 'true');
  }
  const suffix = query.toString();
  return suffix.length > 0 ? `/api/v1/finance/accounts?${suffix}` : '/api/v1/finance/accounts';
}

export async function listPeriods(filters?: PeriodListFilters, signal?: AbortSignal) {
  const parsed = parseQuery(periodListFiltersSchema, filters ?? {});
  const query = new URLSearchParams();
  if (parsed.fromYear !== undefined) {
    query.set('fromYear', String(parsed.fromYear));
  }
  if (parsed.fromMonth !== undefined) {
    query.set('fromMonth', String(parsed.fromMonth));
  }
  if (parsed.toYear !== undefined) {
    query.set('toYear', String(parsed.toYear));
  }
  if (parsed.toMonth !== undefined) {
    query.set('toMonth', String(parsed.toMonth));
  }
  const suffix = query.toString();
  const path = suffix.length > 0 ? `/api/v1/finance/periods?${suffix}` : '/api/v1/finance/periods';
  const raw = await request<unknown>(path, { signal });
  return parseWithApiError(periodListResponseSchema, raw);
}

export async function getPeriodSummary(
  periodId: string,
  signal?: AbortSignal,
): Promise<PeriodSummaryResponse> {
  const id = parseQuery(uuidV4Schema, periodId);
  const raw = await request<unknown>(`/api/v1/finance/periods/${id}/summary`, { signal });
  return parseWithApiError(periodSummaryResponseSchema, raw);
}

export async function listAccounts(params?: AccountListParams, signal?: AbortSignal) {
  const path = listAccountsUrl(params);
  const raw = await request<unknown>(path, { signal });
  return parseWithApiError(accountListResponseSchema, raw);
}

export async function listTransactions(
  periodId: string,
  filters?: TransactionListFilters,
  signal?: AbortSignal,
) {
  const parsed = parseQuery(transactionListFiltersSchema, filters ?? {});
  const query = new URLSearchParams();
  if (parsed.type !== undefined) {
    query.set('type', parsed.type);
  }
  if (parsed.accountId !== undefined) {
    query.set('accountId', parsed.accountId);
  }
  if (parsed.categoryId !== undefined) {
    query.set('categoryId', parsed.categoryId);
  }
  if (parsed.fromDate !== undefined) {
    query.set('fromDate', parsed.fromDate);
  }
  if (parsed.toDate !== undefined) {
    query.set('toDate', parsed.toDate);
  }
  if (parsed.includeHidden !== undefined) {
    query.set('includeHidden', parsed.includeHidden ? 'true' : 'false');
  }
  if (parsed.cursor !== undefined) {
    query.set('cursor', parsed.cursor);
  }
  if (parsed.limit !== undefined) {
    query.set('limit', String(parsed.limit));
  }
  const suffix = query.toString();
  const path =
    suffix.length > 0
      ? `/api/v1/finance/periods/${periodId}/transactions?${suffix}`
      : `/api/v1/finance/periods/${periodId}/transactions`;
  const raw = await request<unknown>(path, { signal });
  return parseWithApiError(transactionListResponseSchema, raw);
}

export async function listPlanItems(
  periodId: string,
  filters?: PlanItemListFilters,
  signal?: AbortSignal,
) {
  parseQuery(planItemListFiltersSchema, filters ?? {});
  const raw = await request<unknown>(`/api/v1/finance/periods/${periodId}/plan-items`, { signal });
  return raw;
}

export async function listBudgets(periodId: string, signal?: AbortSignal) {
  const raw = await request<unknown>(`/api/v1/finance/periods/${periodId}/budgets`, { signal });
  return raw;
}
