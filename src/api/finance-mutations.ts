import { request } from './http';
import { parseWithApiError } from './parse';
import {
  createAccountBodySchema,
  createPeriodBodySchema,
  periodEnvelopeSchema,
  patchAccountBodySchema,
  accountEnvelopeSchema,
  projectionConfirmResponseSchema,
  projectionPreviewResponseSchema,
  transactionEnvelopeSchema,
  uuidV4Schema,
  type CreateAccountBody,
  type CreatePeriodBody,
  type PatchAccountBody,
} from './finance-schemas';
import type {
  AccountDto,
  PeriodDto,
  ProjectionConfirmResponse,
  ProjectionPreviewResponse,
  PropagationChangeInput,
  TransactionDto,
} from './finance-types';

export { parseWithApiError } from './parse';

export async function createPeriod(body: CreatePeriodBody): Promise<{ period: PeriodDto }> {
  const parsed = createPeriodBodySchema.parse(body);
  const raw = await request<unknown>('/api/v1/finance/periods', {
    method: 'POST',
    body: JSON.stringify(parsed),
  });
  return parseWithApiError(periodEnvelopeSchema, raw);
}

export async function createAccount(body: CreateAccountBody): Promise<{ account: AccountDto }> {
  const parsed = createAccountBodySchema.parse(body);
  const raw = await request<unknown>('/api/v1/finance/accounts', {
    method: 'POST',
    body: JSON.stringify(parsed),
  });
  return parseWithApiError(accountEnvelopeSchema, raw);
}

export async function patchAccount(
  accountId: string,
  body: PatchAccountBody,
): Promise<{ account: AccountDto }> {
  const id = uuidV4Schema.parse(accountId);
  const parsed = patchAccountBodySchema.parse(body);
  const raw = await request<unknown>(`/api/v1/finance/accounts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(parsed),
  });
  return parseWithApiError(accountEnvelopeSchema, raw);
}

export async function deactivateAccount(accountId: string): Promise<void> {
  const id = uuidV4Schema.parse(accountId);
  await request(`/api/v1/finance/accounts/${id}/deactivate`, { method: 'POST' });
}

export async function patchTransaction(
  transactionId: string,
  patch: { amount?: string; concept?: string },
): Promise<{ transaction: TransactionDto }> {
  const raw = await request<unknown>(`/api/v1/finance/transactions/${transactionId}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  return parseWithApiError(transactionEnvelopeSchema, raw);
}

export async function createTransaction(
  periodId: string,
  body: Record<string, unknown>,
): Promise<{ transaction: TransactionDto }> {
  const raw = await request<unknown>(`/api/v1/finance/periods/${periodId}/transactions`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return parseWithApiError(transactionEnvelopeSchema, raw);
}

export async function previewProjection(
  originPeriodId: string,
  changes: PropagationChangeInput[],
  signal?: AbortSignal,
): Promise<ProjectionPreviewResponse> {
  const raw = await request<unknown>('/api/v1/finance/projection/preview', {
    method: 'POST',
    body: JSON.stringify({ originPeriodId, changes }),
    signal,
  });
  return parseWithApiError(projectionPreviewResponseSchema, raw);
}

export async function confirmProjection(
  originPeriodId: string,
  expectedPeriodVersion: number,
  changes: PropagationChangeInput[],
): Promise<ProjectionConfirmResponse> {
  const raw = await request<unknown>('/api/v1/finance/projection/confirm', {
    method: 'POST',
    body: JSON.stringify({ originPeriodId, expectedPeriodVersion, changes }),
  });
  return parseWithApiError(projectionConfirmResponseSchema, raw);
}
