import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { getRuns } from "../../api/runs";
import { PageHeader } from "../../components/common/PageHeader";
import { LoadingState } from "../../components/common/LoadingState";
import { ErrorState } from "../../components/common/ErrorState";
import { SectionCard } from "../../components/common/SectionCard";

import { RunTriggerForm } from "./RunTriggerForm";
import { RunsPassFailChart } from "./RunsPassFailChart";
import { RunStatusDistributionChart } from "./RunStatusDistributionChart";
import { DashboardMetricsRow } from "./DashboardMetricsRow";
import { ActiveRunsPanel } from "./ActiveRunsPanel";
import { RecentRunsTable } from "./RecentRunsTable";

export function DashboardPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["runs"],
    queryFn: getRuns,
    refetchInterval: 5000,
  });

  const runs = data?.runs ?? [];

  const sortedRuns = useMemo(() => {
    return [...runs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [runs]);

  const activeRuns = useMemo(() => {
    return sortedRuns.filter(
      (run) => run.status === "queued" || run.status === "running",
    );
  }, [sortedRuns]);

  const recentRuns = useMemo(() => {
    return sortedRuns.slice(0, 8);
  }, [sortedRuns]);

  const metrics = useMemo(() => {
    const totalRuns = sortedRuns.length;
    const activeRunsCount = activeRuns.length;
    const failedRuns = sortedRuns.filter((run) => run.status === "failed").length;
    const completedRuns = sortedRuns.filter(
      (run) => run.status === "completed",
    ).length;

    const totalTests = sortedRuns.reduce(
      (sum, run) => sum + (run.execution_summary?.total ?? 0),
      0,
    );

    const passedTests = sortedRuns.reduce(
      (sum, run) => sum + (run.execution_summary?.passed ?? 0),
      0,
    );

    const passRate =
      totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : "0.0";

    return {
      totalRuns,
      activeRunsCount,
      failedRuns,
      completedRuns,
      passRate,
    };
  }, [sortedRuns, activeRuns]);

  if (isLoading) return <LoadingState label="Loading dashboard..." />;
  if (isError) {
    return <ErrorState message={(error as Error).message} onRetry={refetch} />;
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of recent runs and system health"
      />

      <div style={{ marginBottom: "20px" }}>
        <RunTriggerForm />
      </div>

      <DashboardMetricsRow
        totalRuns={metrics.totalRuns}
        activeRunsCount={metrics.activeRunsCount}
        failedRuns={metrics.failedRuns}
        completedRuns={metrics.completedRuns}
        passRate={metrics.passRate}
      />

      <div style={{ display: "grid", gap: "16px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "16px",
          }}
        >
          <SectionCard title="Pass / Fail Trend (Latest 10 Runs)">
            <RunsPassFailChart runs={sortedRuns} />
          </SectionCard>

          <SectionCard title="Run Status Distribution">
            <RunStatusDistributionChart runs={sortedRuns} />
          </SectionCard>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <ActiveRunsPanel runs={activeRuns} />
          <RecentRunsTable runs={recentRuns} />
        </div>
      </div>
    </div>
  );
}