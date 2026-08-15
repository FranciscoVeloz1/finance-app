import { useQuery } from '@tanstack/react-query';
import { previewProjection } from '../api/finance-mutations';
import { financeKeys } from '../api/query-keys';
import type { PropagationChangeInput } from '../api/finance-types';

export function useProjectionPreview(
  originPeriodId: string | undefined,
  changes: PropagationChangeInput[] | null,
) {
  const hash = changes === null ? '' : JSON.stringify(changes);
  return useQuery({
    queryKey: financeKeys.projectionPreview(originPeriodId ?? '', hash),
    queryFn: ({ signal }) => {
      return previewProjection(originPeriodId!, changes!, signal);
    },
    enabled: Boolean(originPeriodId) && changes !== null && changes.length > 0,
    staleTime: 0,
  });
}
