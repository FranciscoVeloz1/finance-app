import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPeriod } from '../api/finance-mutations';
import { financeKeys } from '../api/query-keys';
import { ApiError } from '../api/types';
import { formatYearMonth, nextCreatableYearMonth } from '../utils/dates';
import { useFinancePeriods } from './useFinancePeriods';
import { useSelectedPeriod } from './useSelectedPeriod';
import { useToast } from './useToast';

export function useCreateNextPeriod() {
  const queryClient = useQueryClient();
  const { setPeriod } = useSelectedPeriod();
  const periodsQuery = useFinancePeriods();
  const { notify } = useToast();

  const mutation = useMutation({
    mutationFn: () => {
      return createPeriod(nextCreatableYearMonth(periodsQuery.data?.periods ?? []));
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: [...financeKeys.all, 'periods'] });
      setPeriod(result.period.id);
      notify(
        'success',
        `Periodo ${formatYearMonth(result.period.year, result.period.month)} creado.`,
      );
    },
    onError: (cause: unknown) => {
      if (cause instanceof ApiError && cause.status === 409) {
        notify('negative', 'Ese periodo ya existe.');
        return;
      }
      const message = cause instanceof Error ? cause.message : 'No se pudo crear el periodo.';
      notify('negative', message);
    },
  });

  return {
    createNextPeriod: () => {
      mutation.mutate();
    },
    isCreating: mutation.isPending,
  };
}
