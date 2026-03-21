import { useQuery } from "@tanstack/react-query";
import { getRunDetails } from "../api/runs";

function isActiveStatus(status?: string | null): boolean {
  return status === "queued" || status === "running";
}

export function usePatchRunPolling(runId?: string | null) {
  return useQuery({
    queryKey: ["run-details", runId],
    queryFn: () => getRunDetails(runId as string),
    enabled: !!runId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return isActiveStatus(status) ? 2500 : false;
    },
    staleTime: 0,
    retry: 1,
  });
}