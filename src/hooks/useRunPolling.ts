import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getRunStatus } from '../api/runs';

export function useRunPolling(runId: string, enabled: boolean) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['runs', runId, 'status'],
    queryFn: () => getRunStatus(runId),
    enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'queued' || status === 'running') return 3000;
      return false;
    },
    onSuccess: (data) => {
      if (data.status === 'completed' || data.status === 'failed') {
        queryClient.invalidateQueries({ queryKey: ['runs', runId, 'details'] });
        queryClient.invalidateQueries({ queryKey: ['runs'] });
      }
    },
  });
}