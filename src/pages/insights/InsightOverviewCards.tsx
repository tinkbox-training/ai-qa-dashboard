import { MetricCard } from "../../components/common/MetricCard";
import type { InsightOverview } from "../../types/insights";

interface InsightOverviewCardsProps {
  overview: InsightOverview;
}

export function InsightOverviewCards({ overview }: InsightOverviewCardsProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 16,
      }}
    >
      <MetricCard label="Total Tests" value={overview.total_tests} />
      <MetricCard label="Stable Tests" value={overview.stable_tests} />
      <MetricCard label="Flaky Tests" value={overview.flaky_tests} />
      <MetricCard label="Unstable Tests" value={overview.unstable_tests} />
      <MetricCard label="Critical Tests" value={overview.critical_tests} />
      <MetricCard
        label="Top Failure Type"
        value={overview.top_failure_type ?? "—"}
      />
      <MetricCard
        label="Best Patch"
        value={overview.best_patch_id ?? "—"}
      />
    </div>
  );
}