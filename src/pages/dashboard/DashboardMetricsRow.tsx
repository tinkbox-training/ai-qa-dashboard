import { MetricCard } from "../../components/common/MetricCard";

interface DashboardMetricsRowProps {
  totalRuns: number;
  activeRunsCount: number;
  failedRuns: number;
  completedRuns: number;
  passRate: string;
}

export function DashboardMetricsRow({
  totalRuns,
  activeRunsCount,
  failedRuns,
  completedRuns,
  passRate,
}: DashboardMetricsRowProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: "16px",
        marginBottom: "20px",
      }}
    >
      <MetricCard label="Total Runs" value={totalRuns} />
      <MetricCard label="Active Runs" value={activeRunsCount} />
      <MetricCard label="Failed Runs" value={failedRuns} />
      <MetricCard label="Completed Runs" value={completedRuns} />
      <MetricCard label="Pass Rate" value={`${passRate}%`} />
    </div>
  );
}