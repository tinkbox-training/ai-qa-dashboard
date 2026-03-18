import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRuns } from "../../api/runs";
import { PageHeader } from "../../components/common/PageHeader";
import { MetricCard } from "../../components/common/MetricCard";
import { SectionCard } from "../../components/common/SectionCard";
import { StatusBadge } from "../../components/common/StatusBadge";
import { LoadingState } from "../../components/common/LoadingState";
import { ErrorState } from "../../components/common/ErrorState";
import { formatDateTime } from "../../lib/format";
import { Link } from "react-router-dom";
import { RunTriggerForm } from "./RunTriggerForm";
import { RunsPassFailChart } from "./RunsPassFailChart";

export function DashboardPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["runs"],
    queryFn: getRuns,
    refetchInterval: 5000,
  });

  const runs = data?.runs ?? [];

  const metrics = useMemo(() => {
    const totalRuns = runs.length;
    const activeRuns = runs.filter(
      (run) => run.status === "queued" || run.status === "running",
    ).length;
    const failedRuns = runs.filter((run) => run.status === "failed").length;
    const completedRuns = runs.filter(
      (run) => run.status === "completed",
    ).length;

    const totalTests = runs.reduce(
      (sum, run) => sum + (run.execution_summary?.total ?? 0),
      0,
    );
    const passedTests = runs.reduce(
      (sum, run) => sum + (run.execution_summary?.passed ?? 0),
      0,
    );
    const passRate =
      totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : "0.0";

    return {
      totalRuns,
      activeRuns,
      failedRuns,
      completedRuns,
      passRate,
    };
  }, [runs]);

  if (isLoading) return <LoadingState label="Loading dashboard..." />;
  if (isError)
    return <ErrorState message={(error as Error).message} onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of recent runs and system health"
      />

      <div style={{ marginBottom: "20px" }}>
        <RunTriggerForm />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <MetricCard label="Total Runs" value={metrics.totalRuns} />
        <MetricCard label="Active Runs" value={metrics.activeRuns} />
        <MetricCard label="Failed Runs" value={metrics.failedRuns} />
        <MetricCard label="Completed Runs" value={metrics.completedRuns} />
        <MetricCard label="Pass Rate" value={`${metrics.passRate}%`} />
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
      >
        <div style={{ display: "grid", gap: "16px" }}>
          <SectionCard title="Pass / Fail Trend (Latest 10 Runs)">
            <RunsPassFailChart runs={runs} />
          </SectionCard>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <SectionCard title="Active Runs">
              {runs.filter(
                (run) => run.status === "queued" || run.status === "running",
              ).length === 0 ? (
                <div>No active runs</div>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  {runs
                    .filter(
                      (run) =>
                        run.status === "queued" || run.status === "running",
                    )
                    .map((run) => (
                      <div
                        key={run.run_id}
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          padding: "12px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "8px",
                          }}
                        >
                          <Link to={`/runs/${run.run_id}`}>{run.run_id}</Link>
                          <StatusBadge status={run.status} />
                        </div>
                        <div style={{ color: "#64748b", fontSize: "14px" }}>
                          {formatDateTime(run.timestamp)}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </SectionCard>

            <SectionCard title="Recent Runs">
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th align="left">Run ID</th>
                      <th align="left">Status</th>
                      <th align="left">Passed</th>
                      <th align="left">Failed</th>
                      <th align="left">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runs.slice(0, 8).map((run) => (
                      <tr
                        key={run.run_id}
                        style={{ borderTop: "1px solid #e2e8f0" }}
                      >
                        <td style={{ padding: "10px 0" }}>
                          <Link to={`/runs/${run.run_id}`}>{run.run_id}</Link>
                        </td>
                        <td>
                          <StatusBadge status={run.status} />
                        </td>
                        <td>{run.execution_summary?.passed ?? 0}</td>
                        <td>{run.execution_summary?.failed ?? 0}</td>
                        <td>{formatDateTime(run.timestamp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
        </div>
        <SectionCard title="Recent Runs">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th align="left">Run ID</th>
                  <th align="left">Status</th>
                  <th align="left">Passed</th>
                  <th align="left">Failed</th>
                  <th align="left">Time</th>
                </tr>
              </thead>
              <tbody>
                {runs.slice(0, 8).map((run) => (
                  <tr
                    key={run.run_id}
                    style={{ borderTop: "1px solid #e2e8f0" }}
                  >
                    <td style={{ padding: "10px 0" }}>
                      <Link to={`/runs/${run.run_id}`}>{run.run_id}</Link>
                    </td>
                    <td>
                      <StatusBadge status={run.status} />
                    </td>
                    <td>{run.execution_summary?.passed ?? 0}</td>
                    <td>{run.execution_summary?.failed ?? 0}</td>
                    <td>{formatDateTime(run.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
