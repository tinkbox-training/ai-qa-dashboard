import { useNavigate } from "react-router-dom";

import { MetricCard } from "../../components/common/MetricCard";
import type { InsightOverview } from "../../types/insights";

interface InsightOverviewCardsProps {
  overview: InsightOverview;
}

function safePercent(part: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

export function InsightOverviewCards({ overview }: InsightOverviewCardsProps) {
  const navigate = useNavigate();
  const total = overview.total_tests || 0;

  function clickableWrapper(onClick: () => void, child: React.ReactNode) {
    return (
      <div
        onClick={onClick}
        style={{
          cursor: "pointer",
          transition: "transform 0.12s ease, box-shadow 0.12s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow =
            "0 4px 12px rgba(0,0,0,0.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {child}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 16,
      }}
    >
      {clickableWrapper(
        () => navigate("/runs"),
        <MetricCard
          label="Total Tests"
          value={overview.total_tests}
          subtext="Tracked in insights"
        />
      )}

      {clickableWrapper(
        () => navigate("/runs?classification=stable"),
        <MetricCard
          label="Stable Tests"
          value={overview.stable_tests}
          trendLabel={safePercent(overview.stable_tests, total)}
          trendDirection="up"
          subtext="Of total tests"
        />
      )}

      {clickableWrapper(
        () => navigate("/runs?classification=flaky"),
        <MetricCard
          label="Flaky Tests"
          value={overview.flaky_tests}
          trendLabel={safePercent(overview.flaky_tests, total)}
          trendDirection={overview.flaky_tests > 0 ? "down" : "neutral"}
          subtext="Need stabilization"
        />
      )}

      {clickableWrapper(
        () => navigate("/runs?classification=unstable"),
        <MetricCard
          label="Unstable Tests"
          value={overview.unstable_tests}
          trendLabel={safePercent(overview.unstable_tests, total)}
          trendDirection={overview.unstable_tests > 0 ? "down" : "neutral"}
          subtext="Repeated failures"
        />
      )}

      {clickableWrapper(
        () => navigate("/runs?impact_priority=critical"),
        <MetricCard
          label="Critical Tests"
          value={overview.critical_tests}
          trendLabel={safePercent(overview.critical_tests, total)}
          trendDirection={overview.critical_tests > 0 ? "down" : "neutral"}
          subtext="Highest CI impact"
        />
      )}

      {clickableWrapper(
        () =>
          overview.top_failure_type
            ? navigate(
                `/runs?failure_type=${encodeURIComponent(
                  overview.top_failure_type
                )}`
              )
            : undefined,
        <MetricCard
          label="Top Failure Type"
          value={overview.top_failure_type ?? "—"}
          subtext="Most frequent pattern"
        />
      )}

      {clickableWrapper(
        () => navigate("/insights"),
        <MetricCard
          label="Best Patch"
          value={overview.best_patch_id ?? "—"}
          subtext="Top ranked patch"
        />
      )}
    </div>
  );
}