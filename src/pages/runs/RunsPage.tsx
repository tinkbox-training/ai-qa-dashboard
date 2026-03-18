import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getRuns } from "../../api/runs";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { LoadingState } from "../../components/common/LoadingState";
import { ErrorState } from "../../components/common/ErrorState";
import { SectionCard } from "../../components/common/SectionCard";
import { formatDateTime } from "../../lib/format";
import { RunsFilters } from "./RunsFilters";

export function RunsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["runs"],
    queryFn: getRuns,
    refetchInterval: 5000,
  });

  const runs = data?.runs ?? [];

  const filteredRuns = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    let result = [...runs];

    if (selectedStatus !== "all") {
      result = result.filter((run) => run.status === selectedStatus);
    }

    if (normalizedSearch) {
      result = result.filter((run) => {
        const runIdMatch = run.run_id.toLowerCase().includes(normalizedSearch);
        const requirementMatch = (run.requirements ?? []).some((req) =>
          req.toLowerCase().includes(normalizedSearch),
        );
        return runIdMatch || requirementMatch;
      });
    }

    result.sort((a, b) => {
      const aTime = new Date(a.timestamp).getTime();
      const bTime = new Date(b.timestamp).getTime();

      if (sortOrder === "oldest") {
        return aTime - bTime;
      }

      return bTime - aTime;
    });

    return result;
  }, [runs, searchTerm, selectedStatus, sortOrder]);

  function handleReset() {
    setSearchTerm("");
    setSelectedStatus("all");
    setSortOrder("newest");
  }

  if (isLoading) return <LoadingState label="Loading runs..." />;
  if (isError)
    return <ErrorState message={(error as Error).message} onRetry={refetch} />;

  return (
    <div>
      <PageHeader title="Runs" subtitle="All executions" />

      <div style={{ marginBottom: "20px" }}>
        <SectionCard title="Filters">
          <RunsFilters
            searchTerm={searchTerm}
            selectedStatus={selectedStatus}
            sortOrder={sortOrder}
            onSearchChange={setSearchTerm}
            onStatusChange={setSelectedStatus}
            onSortChange={setSortOrder}
            onReset={handleReset}
          />
        </SectionCard>
      </div>

      <SectionCard
        title="Run History"
        rightSlot={
          <div style={{ fontSize: "14px", color: "#64748b" }}>
            Showing {filteredRuns.length} of {runs.length}
          </div>
        }
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">Run ID</th>
                <th align="left">Status</th>
                <th align="left">Passed</th>
                <th align="left">Failed</th>
                <th align="left">Total</th>
                <th align="left">Requirements</th>
                <th align="left">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredRuns.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{ padding: "20px 0", color: "#64748b" }}
                  >
                    No runs matched your filters.
                  </td>
                </tr>
              ) : (
                filteredRuns.map((run) => (
                  <tr
                    key={run.run_id}
                    style={{ borderTop: "1px solid #e2e8f0" }}
                  >
                    <td style={{ padding: "12px 0" }}>
                      <Link to={`/runs/${run.run_id}`}>{run.run_id}</Link>
                    </td>
                    <td>
                      <StatusBadge status={run.status} />
                    </td>
                    <td>{run.execution_summary?.passed ?? 0}</td>
                    <td>{run.execution_summary?.failed ?? 0}</td>
                    <td>{run.execution_summary?.total ?? 0}</td>
                    <td style={{ maxWidth: "320px" }}>
                      {run.requirements?.length
                        ? `${run.requirements[0]}${run.requirements.length > 1 ? ` +${run.requirements.length - 1} more` : ""}`
                        : "-"}
                    </td>
                    <td>{formatDateTime(run.timestamp)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
