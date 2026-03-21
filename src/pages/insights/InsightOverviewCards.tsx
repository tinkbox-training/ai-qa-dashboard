import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { MetricCard } from "../../components/common/MetricCard";
import type { InsightOverview } from "../../types/insights";

interface InsightOverviewCardsProps {
  overview: InsightOverview;
  bestPatchRunId?: string | null;
}

function safePercent(part: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

export function InsightOverviewCards({
  overview,
  bestPatchRunId,
}: InsightOverviewCardsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const total = overview.total_tests || 0;

  function isActiveTarget(target: string) {
    const [targetPath, targetSearch = ""] = target.split("?");
    const currentPath = location.pathname;
    const currentSearch = location.search.replace(/^\?/, "");

    if (currentPath !== targetPath) return false;
    if (!targetSearch) return currentSearch === "";

    return currentSearch === targetSearch;
  }

  function handleTotalTestsClick() {
    if (location.search) {
      navigate("/insights");
      return;
    }

    const testsSection = document.getElementById("insights-tests-section");
    if (testsSection) {
      testsSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  function clickableWrapper(
    target: string | null,
    child: ReactNode,
    title?: string,
    customClick?: () => void
  ) {
    const isActive = target ? isActiveTarget(target) : false;

    return (
      <div
        onClick={() => {
          if (customClick) {
            customClick();
            return;
          }
          if (target) navigate(target);
        }}
        title={title}
        style={{
          cursor: target || customClick ? "pointer" : "default",
          transition:
            "transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease, background 0.12s ease",
          borderRadius: 14,
          boxShadow: isActive ? "0 0 0 2px #bfdbfe" : "none",
          background: isActive ? "#f8fbff" : "transparent",
        }}
        onMouseEnter={(e) => {
          if (!target && !customClick) return;
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = isActive
            ? "0 0 0 2px #93c5fd, 0 6px 16px rgba(15, 23, 42, 0.08)"
            : "0 6px 16px rgba(15, 23, 42, 0.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = isActive
            ? "0 0 0 2px #bfdbfe"
            : "none";
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
        null,
        <MetricCard
          label="Total Tests"
          value={overview.total_tests}
          subtext="Tracked in insights"
        />,
        location.search ? "Clear filters" : "Jump to test insights",
        handleTotalTestsClick
      )}

      {clickableWrapper(
        "/insights?classification=stable",
        <MetricCard
          label="Stable Tests"
          value={overview.stable_tests}
          trendLabel={safePercent(overview.stable_tests, total)}
          trendDirection="up"
          subtext="Of total tests"
        />,
        "Filter stable tests"
      )}

      {clickableWrapper(
        "/insights?classification=flaky",
        <MetricCard
          label="Flaky Tests"
          value={overview.flaky_tests}
          trendLabel={safePercent(overview.flaky_tests, total)}
          trendDirection={overview.flaky_tests > 0 ? "down" : "neutral"}
          subtext="Need stabilization"
        />,
        "Filter flaky tests"
      )}

      {clickableWrapper(
        "/insights?classification=unstable",
        <MetricCard
          label="Unstable Tests"
          value={overview.unstable_tests}
          trendLabel={safePercent(overview.unstable_tests, total)}
          trendDirection={overview.unstable_tests > 0 ? "down" : "neutral"}
          subtext="Repeated failures"
        />,
        "Filter unstable tests"
      )}

      {clickableWrapper(
        "/insights?impact_priority=critical",
        <MetricCard
          label="Critical Tests"
          value={overview.critical_tests}
          trendLabel={safePercent(overview.critical_tests, total)}
          trendDirection={overview.critical_tests > 0 ? "down" : "neutral"}
          subtext="Highest CI impact"
        />,
        "Filter critical-impact tests"
      )}

      {clickableWrapper(
        overview.top_failure_type
          ? `/insights?failure_type=${encodeURIComponent(overview.top_failure_type)}`
          : null,
        <MetricCard
          label="Top Failure Type"
          value={overview.top_failure_type ?? "—"}
          subtext="Most frequent pattern"
        />,
        "Filter by top failure type"
      )}

      {clickableWrapper(
        bestPatchRunId ? `/runs/${bestPatchRunId}` : null,
        <MetricCard
          label="Best Patch"
          value={overview.best_patch_id ?? "—"}
          subtext="Top ranked patch"
        />,
        bestPatchRunId ? "Open best patch rerun details" : undefined
      )}
    </div>
  );
}