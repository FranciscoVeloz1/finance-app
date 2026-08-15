import { request } from './http';
import { parseWithApiError } from './parse';
import {
  projectionConfirmResponseSchema,
  projectionPreviewResponseSchema,
  transactionEnvelopeSchema,
} from './finance-schemas';
import type {
  ProjectionConfirmResponse,
  ProjectionPreviewResponse,
  PropagationChangeInput,
  TransactionDto,
} from './finance-types';

export { parseWithApiError } from './parse';

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
