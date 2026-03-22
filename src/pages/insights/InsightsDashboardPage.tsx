import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  getInsightFailures,
  getInsightPatches,
  getInsightsSummary,
  getInsightRuns,
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [days, setDays] = useState(30);

  const classification = searchParams.get("classification") ?? undefined;
  const impactPriority = searchParams.get("impact_priority") ?? undefined;
  const failureType = searchParams.get("failure_type") ?? undefined;
  const search = searchParams.get("search") ?? undefined;

  const problemAreasRef = useRef<HTMLDivElement | null>(null);
  const testsTableRef = useRef<HTMLDivElement | null>(null);

  const summaryQuery = useQuery({
    queryKey: ["insights-summary", days],
    queryFn: () => getInsightsSummary(days, 10),
  });

  const testsQuery = useQuery({
    queryKey: ["insights-tests", days, classification, impactPriority, search],
    queryFn: () =>
      getInsightRuns({
        days,
        classification,
        impact_priority: impactPriority,
        search,
        sort_by: "flaky_score",
      }),
  });

  const failuresQuery = useQuery({
    queryKey: ["insights-failures", days, failureType],
    queryFn: () =>
      getInsightFailures({
        days,
        failure_type: failureType,
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
    testsQuery.isLoading ||
    failuresQuery.isLoading ||
    patchesQuery.isLoading;

  const isError =
    summaryQuery.isError ||
    testsQuery.isError ||
    failuresQuery.isError ||
    patchesQuery.isError;

  const errorMessage = useMemo(() => {
    return (
      (summaryQuery.error as Error | undefined)?.message ||
      (testsQuery.error as Error | undefined)?.message ||
      (failuresQuery.error as Error | undefined)?.message ||
      (patchesQuery.error as Error | undefined)?.message ||
      "Failed to load insights."
    );
  }, [
    summaryQuery.error,
    testsQuery.error,
    failuresQuery.error,
    patchesQuery.error,
  ]);

  const activeFilters = [
    classification
      ? { label: `classification: ${classification}`, key: "classification" }
      : null,
    impactPriority
      ? { label: `impact: ${impactPriority}`, key: "impact_priority" }
      : null,
    failureType
      ? { label: `failure: ${failureType}`, key: "failure_type" }
      : null,
    search ? { label: `search: ${search}`, key: "search" } : null,
  ].filter(Boolean) as { label: string; key: string }[];

  function clearAllFilters() {
    navigate("/insights");
  }

  useEffect(() => {
    if (isLoading) return;

    if (failureType && problemAreasRef.current) {
      problemAreasRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }

    if ((classification || impactPriority || search) && testsTableRef.current) {
      testsTableRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [classification, impactPriority, failureType, search, isLoading]);

  const bestPatchRunId =
    patchesQuery.data?.best_patch?.patch_id != null
      ? (patchesQuery.data.patches.find(
          (patch) => patch.patch_id === patchesQuery.data?.best_patch?.patch_id,
        )?.rerun_run_id ?? null)
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

        {activeFilters.length > 0 && (
          <>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {activeFilters.map((filter) => (
                <span
                  key={filter.key}
                  style={{
                    fontSize: 12,
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: "#eff6ff",
                    color: "#1d4ed8",
                    fontWeight: 600,
                  }}
                >
                  {filter.label}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={clearAllFilters}
              style={{
                border: "1px solid #d1d5db",
                background: "#fff",
                borderRadius: 8,
                padding: "8px 10px",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Clear filters
            </button>
          </>
        )}
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
              bestPatchRunId={bestPatchRunId}
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

            <div ref={problemAreasRef}>
              <InsightProblemAreasPanel
                items={failuresQuery.data?.failure_types ?? []}
              />
            </div>
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
              bestPatch={
                patchesQuery.data?.best_patch ?? {
                  patch_id: null,
                  reason: null,
                }
              }
            />
          </div>

          <div id="insights-tests-section" ref={testsTableRef}>
            <InsightTestsTable tests={testsQuery.data?.tests ?? []} />
          </div>
        </>
      )}
    </div>
  );
}
