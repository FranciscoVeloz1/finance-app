import { useQuery } from '@tanstack/react-query';
import { listAccounts } from '../api/finance';
import { financeKeys } from '../api/query-keys';
import type { AccountListParams } from '../api/finance-types';

export function useFinanceAccounts(params?: AccountListParams, enabled = true) {
  return useQuery({
    queryKey: financeKeys.accounts(params),
    queryFn: ({ signal }) => {
      return listAccounts(params, signal);
    },
    enabled,
    staleTime: 30_000,
  });
}
