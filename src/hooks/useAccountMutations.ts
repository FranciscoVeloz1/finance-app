import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createAccount,
  deactivateAccount,
  patchAccount,
} from '../api/finance-mutations';
import { financeKeys } from '../api/query-keys';
import type { CreateAccountBody, PatchAccountBody } from '../api/finance-schemas';
import { ApiError } from '../api/types';
import type { AccountDraft } from '../components/forms/AccountFormDialog';
import { ACCOUNT_TYPE_TO_API } from '../utils/map-finance';
import { toUnsignedMoneyString } from '../utils/money';

export class AccountDraftError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AccountDraftError';
  }
}

function optionalDay(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  const value = Number(trimmed);
  if (!Number.isInteger(value) || value < 1 || value > 31) {
    throw new AccountDraftError('El día debe ser un entero entre 1 y 31.');
  }

  return value;
}

function requireMoney(raw: string, label: string): string {
  const money = toUnsignedMoneyString(raw);
  if (money === null) {
    throw new AccountDraftError(`Escribe un ${label} válido.`);
  }

  return money;
}

export function accountDraftToCreateBody(draft: AccountDraft, startsOn: string): CreateAccountBody {
  const type = ACCOUNT_TYPE_TO_API[draft.type];
  const body: CreateAccountBody = {
    name: draft.label.trim(),
    type,
    initialBalance: requireMoney(draft.openingBalance, 'saldo inicial'),
    includeInProjections: draft.includedInProjections,
    startsOn,
  };

  if (type === 'CREDIT') {
    if (draft.creditLimit.trim().length === 0) {
      throw new AccountDraftError('El límite de crédito es obligatorio.');
    }
    body.creditLimit = requireMoney(draft.creditLimit, 'límite de crédito');
    if (draft.creditDebt.trim().length > 0) {
      body.openingDebt = requireMoney(draft.creditDebt, 'deuda inicial');
    }
    const statementDay = optionalDay(draft.statementDay);
    const paymentDay = optionalDay(draft.paymentDay);
    if (statementDay !== undefined) {
      body.statementDay = statementDay;
    }
    if (paymentDay !== undefined) {
      body.paymentDay = paymentDay;
    }
  }

  return body;
}

export function accountDraftToPatchBody(draft: AccountDraft): PatchAccountBody {
  const type = ACCOUNT_TYPE_TO_API[draft.type];
  const patch: PatchAccountBody = {
    name: draft.label.trim(),
    initialBalance: requireMoney(draft.openingBalance, 'saldo inicial'),
    includeInProjections: draft.includedInProjections,
  };

  if (type === 'CREDIT') {
    if (draft.creditLimit.trim().length === 0) {
      throw new AccountDraftError('El límite de crédito es obligatorio.');
    }
    patch.creditLimit = requireMoney(draft.creditLimit, 'límite de crédito');
    if (draft.creditDebt.trim().length > 0) {
      patch.openingDebt = requireMoney(draft.creditDebt, 'deuda inicial');
    }
    const statementDay = optionalDay(draft.statementDay);
    const paymentDay = optionalDay(draft.paymentDay);
    if (statementDay !== undefined) {
      patch.statementDay = statementDay;
    }
    if (paymentDay !== undefined) {
      patch.paymentDay = paymentDay;
    }
  }

  return patch;
}

async function invalidateAccounts(queryClient: ReturnType<typeof useQueryClient>) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: [...financeKeys.all, 'accounts'] }),
    queryClient.invalidateQueries({ queryKey: [...financeKeys.all, 'summary'] }),
    queryClient.invalidateQueries({ queryKey: [...financeKeys.all, 'periods'] }),
  ]);
}

function mutationErrorMessage(cause: unknown, fallback: string): string {
  if (cause instanceof AccountDraftError) {
    return cause.message;
  }
  if (cause instanceof ApiError && cause.status === 409) {
    return 'Ya existe una cuenta activa con ese nombre.';
  }
  if (cause instanceof Error) {
    return cause.message;
  }
  return fallback;
}

export function useAccountMutations() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (input: { draft: AccountDraft; startsOn: string }) => {
      return createAccount(accountDraftToCreateBody(input.draft, input.startsOn));
    },
    onSuccess: async () => {
      await invalidateAccounts(queryClient);
    },
  });

  const update = useMutation({
    mutationFn: (input: { accountId: string; draft: AccountDraft }) => {
      return patchAccount(input.accountId, accountDraftToPatchBody(input.draft));
    },
    onSuccess: async () => {
      await invalidateAccounts(queryClient);
    },
  });

  const deactivate = useMutation({
    mutationFn: (accountId: string) => {
      return deactivateAccount(accountId);
    },
    onSuccess: async () => {
      await invalidateAccounts(queryClient);
    },
  });

  return { create, update, deactivate, mutationErrorMessage };
}
