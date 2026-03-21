import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  getInsightFailures,
  getInsightPatches,
  getInsightsSummary,
  getInsightTests,
} from "../../api/insights";

import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { PageHeader } from "../../components/common/PageHeader";

import { InsightOverviewCards } from "./InsightOverviewCards";
import { InsightPatchesPanel } from "./InsightPatchesPanel";
import { InsightProblemAreasPanel } from "./InsightProblemAreasPanel";
import { InsightRecommendationsPanel } from "./InsightRecommendationsPanel";
import { InsightTestsTable } from "./InsightTestsTable";
import { InsightTrendPanel } from "./InsightTrendPanel";

export default function InsightsDashboardPage() {
  const [days, setDays] = useState(30);

  const summaryQuery = useQuery({
    queryKey: ["insights-summary", days],
    queryFn: () => getInsightsSummary(days, 10),
  });

  const previousSummaryQuery = useQuery({
    queryKey: ["insights-summary-previous", days],
    queryFn: () => getInsightsSummary(days * 2, 10),
  });

  const testsQuery = useQuery({
    queryKey: ["insights-tests", days],
    queryFn: () =>
      getInsightTests({
        days,
        sort_by: "flaky_score",
      }),
  });

  const failuresQuery = useQuery({
    queryKey: ["insights-failures", days],
    queryFn: () =>
      getInsightFailures({
        days,
        limit: 10,
      }),
  });

  const patchesQuery = useQuery({
    queryKey: ["insights-patches", days],
    queryFn: () =>
      getInsightPatches({
        days,
        limit: 10,
      }),
  });

  const isLoading =
    summaryQuery.isLoading ||
    previousSummaryQuery.isLoading ||
    testsQuery.isLoading ||
    failuresQuery.isLoading ||
    patchesQuery.isLoading;

  const isError =
    summaryQuery.isError ||
    previousSummaryQuery.isError ||
    testsQuery.isError ||
    failuresQuery.isError ||
    patchesQuery.isError;

  const errorMessage = useMemo(() => {
    return (
      (summaryQuery.error as Error | undefined)?.message ||
      (previousSummaryQuery.error as Error | undefined)?.message ||
      (testsQuery.error as Error | undefined)?.message ||
      (failuresQuery.error as Error | undefined)?.message ||
      (patchesQuery.error as Error | undefined)?.message ||
      "Failed to load insights."
    );
  }, [
    summaryQuery.error,
    previousSummaryQuery.error,
    testsQuery.error,
    failuresQuery.error,
    patchesQuery.error,
  ]);

  const previousOverview =
    previousSummaryQuery.data?.overview != null && summaryQuery.data?.overview != null
      ? previousSummaryQuery.data.overview
      : null;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <PageHeader
        title="Insights Dashboard"
        subtitle="AI-powered quality insights across stability, failures, CI impact, and patch effectiveness."
      />

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <label style={{ fontSize: 14, fontWeight: 500 }}>Time Range</label>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          style={{
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            background: "white",
          }}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last 365 days</option>
        </select>
      </div>

      {isLoading ? (
        <LoadingState label="Loading insights dashboard..." />
      ) : isError ? (
        <ErrorState message={errorMessage} />
      ) : (
        <>
          {summaryQuery.data && (
            <InsightOverviewCards
              overview={summaryQuery.data.overview}
              previousOverview={previousOverview}
            />
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr)",
              gap: 16,
              alignItems: "start",
            }}
          >
            <InsightTrendPanel daily={summaryQuery.data?.trends.daily ?? []} />
            <InsightProblemAreasPanel
              items={failuresQuery.data?.failure_types ?? []}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
              gap: 16,
              alignItems: "start",
            }}
          >
            <InsightRecommendationsPanel
              recommendations={summaryQuery.data?.ai_recommendations ?? []}
            />
            <InsightPatchesPanel
              patches={patchesQuery.data?.patches ?? []}
              bestPatch={patchesQuery.data?.best_patch ?? { patch_id: null, reason: null }}
            />
          </div>

          <InsightTestsTable tests={testsQuery.data?.tests ?? []} />
        </>
      )}
    </div>
  );
}