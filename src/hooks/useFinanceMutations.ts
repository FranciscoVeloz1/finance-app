import { useMutation, useQueryClient } from '@tanstack/react-query';
import { confirmProjection, createTransaction, patchTransaction } from '../api/finance-mutations';
import { invalidateAffectedPeriods, invalidatePeriod } from '../api/query-keys';
import type { PropagationChangeInput } from '../api/finance-types';

export function useFinanceMutations(periodId: string | undefined) {
  const queryClient = useQueryClient();

  const updateTransaction = useMutation({
    mutationFn: (input: { transactionId: string; patch: { amount?: string; concept?: string } }) => {
      return patchTransaction(input.transactionId, input.patch);
    },
    onSuccess: async () => {
      if (periodId) {
        await invalidatePeriod(queryClient, periodId);
        await queryClient.invalidateQueries({ queryKey: ['finance', 'periods'] });
        await queryClient.invalidateQueries({ queryKey: ['finance', 'accounts'] });
      }
    },
  });

  const addTransaction = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      return createTransaction(periodId!, body);
    },
    onSuccess: async () => {
      if (periodId) {
        await invalidatePeriod(queryClient, periodId);
        await queryClient.invalidateQueries({ queryKey: ['finance', 'periods'] });
        await queryClient.invalidateQueries({ queryKey: ['finance', 'accounts'] });
      }
    },
  });

  const confirm = useMutation({
    mutationFn: (input: {
      originPeriodId: string;
      expectedPeriodVersion: number;
      changes: PropagationChangeInput[];
    }) => {
      return confirmProjection(input.originPeriodId, input.expectedPeriodVersion, input.changes);
    },
    onSuccess: async (result) => {
      await invalidateAffectedPeriods(queryClient, result.affectedPeriodIds);
    },
  });

  return { updateTransaction, addTransaction, confirm };
}
