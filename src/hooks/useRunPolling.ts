import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getRunStatus } from "../api/runs";

export function useRunPolling(runId: string, enabled: boolean) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["runs", runId, "status"],
    queryFn: () => getRunStatus(runId),
    enabled: Boolean(runId) && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "queued" || status === "running") return 3000;
      return false;
    },
  });

  useEffect(() => {
    const status = query.data?.status;

    if (status === "completed" || status === "failed") {
      queryClient.invalidateQueries({ queryKey: ["runs", runId, "details"] });
      queryClient.invalidateQueries({ queryKey: ["runs"] });
    }
  }, [query.data?.status, queryClient, runId]);

  return query;
}