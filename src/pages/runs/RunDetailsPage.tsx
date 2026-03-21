import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getRunDetails } from "../../api/runs";
import { useRunPolling } from "../../hooks/useRunPolling";

import { PageHeader } from "../../components/common/PageHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { MetricCard } from "../../components/common/MetricCard";
import { SectionCard } from "../../components/common/SectionCard";
import { LoadingState } from "../../components/common/LoadingState";
import { ErrorState } from "../../components/common/ErrorState";

import { RunStatusBanner } from "../../components/run/RunStatusBanner";
import { RunTimeline } from "../../components/run/RunTimeline";

import { RunLifecycleCard } from "./RunLifecycleCard";
import { FailedTestsPanel } from "./FailedTestsPanel";
import { AiExplanationsPanel } from "./AiExplanationsPanel";
import { FailureClustersPanel } from "./FailureClustersPanel";
import { ArtifactsPanel } from "./ArtifactsPanel";
import {
  ExecutionResultsTable,
  type ExecutionResultRow,
} from "./ExecutionResultsTable";
import { FailureDetailsModal } from "./FailureDetailsModal";

import { ApplyPatchActionCard } from "../../components/patches/ApplyPatchActionCard";
import { PartialRerunWarning } from "../../components/patches/PartialRerunWarning";
import { PatchComparisonSummaryCard } from "../../components/patches/PatchComparisonSummaryCard";
import { BestPatchCard } from "../../components/patches/BestPatchCard";
import { PatchHistoryPanel } from "../../components/patches/PatchHistoryPanel";

import {
  applyPatchAndRerun,
  compareRuns,
  getPatchComparison,
  getPatchHistory,
  patchComparisonKey,
  patchHistoryKey,
  type PatchCandidate,
  type PatchHistoryItem,
  type PatchRerunResponse,
  normalizePatchSuggestions,
} from "../../api/patches";

type AiExplanation = {
  title?: string;
  [key: string]: any;
};

const metricLikeCard: React.CSSProperties = {
  padding: "16px",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  background: "#ffffff",
};

const metricLabel: React.CSSProperties = {
  fontSize: "13px",
  color: "#64748b",
  marginBottom: "8px",
};

const metricValue: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 600,
  color: "#0f172a",
  wordBreak: "break-word",
};

const metricLink: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 600,
  color: "#2563eb",
  textDecoration: "underline",
  wordBreak: "break-word",
};

const emptyStyle: React.CSSProperties = {
  fontSize: "16px",
  color: "#94a3b8",
};

function safeArray<T = any>(value: any): T[] {
  return Array.isArray(value) ? value : [];
}

function safeNumber(value: any, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getExecutionSummary(data: any) {
  return {
    total: safeNumber(data?.execution_summary?.total ?? data?.total_tests ?? 0),
    passed: safeNumber(
      data?.execution_summary?.passed ?? data?.passed_tests ?? 0,
    ),
    failed: safeNumber(
      data?.execution_summary?.failed ?? data?.failed_tests ?? 0,
    ),
    skipped: safeNumber(
      data?.execution_summary?.skipped ?? data?.skipped_tests ?? 0,
    ),
    pass_rate: safeNumber(data?.execution_summary?.pass_rate ?? 0),
  };
}

function getPatchCandidatesFromRun(data: any): PatchCandidate[] {
  const directCandidates = normalizePatchSuggestions(
    data?.patch_suggestions ??
      data?.suggested_patches ??
      data?.ai_patches ??
      data?.patches ??
      data?.failure_analysis?.patches ??
      [],
  );

  if (directCandidates.length > 0) {
    return directCandidates;
  }

  const explanations = Array.isArray(data?.ai_failure_explanations)
    ? data.ai_failure_explanations
    : [];

  const derivedFromExplanations: PatchCandidate[] = explanations.flatMap(
    (explanation: any, explanationIndex: number) => {
      const fixes = Array.isArray(explanation?.specific_fixes)
        ? explanation.specific_fixes
        : [];

      return fixes.map((fix: any, fixIndex: number) => ({
        patch_id:
          fix?.patch_id ??
          `derived_patch_${data?.run_id ?? "run"}_${explanationIndex}_${fixIndex}`,
        title: fix?.title ?? fix?.type ?? `Suggested fix ${fixIndex + 1}`,
        summary:
          fix?.change ??
          fix?.fix ??
          explanation?.why_it_failed ??
          explanation?.what_happened ??
          null,
        rationale:
          explanation?.notes_for_qa ??
          explanation?.notes ??
          explanation?.likely_root_cause ??
          null,
        confidence_score:
          typeof fix?.confidence_score === "number"
            ? fix.confidence_score
            : null,
        risk_level: fix?.risk_level ?? "unknown",
        status: "suggested",
        file_path: fix?.file_path ?? null,
        requirement_title: explanation?.title ?? fix?.requirement_title ?? null,
        diff_preview:
          typeof fix?.example_patch === "string"
            ? fix.example_patch
            : typeof fix?.example_code === "string"
              ? fix.example_code
              : typeof fix?.code_change_example === "string"
                ? fix.code_change_example
                : fix?.example_patch
                  ? JSON.stringify(fix.example_patch, null, 2)
                  : null,
        code_patch:
          typeof fix?.example_patch === "string"
            ? fix.example_patch
            : typeof fix?.example_code === "string"
              ? fix.example_code
              : typeof fix?.code_change_example === "string"
                ? fix.code_change_example
                : fix?.example_patch
                  ? JSON.stringify(fix.example_patch, null, 2)
                  : null,
        is_best_patch: fixIndex === 0 ? true : false,
        metadata: {
          source: "ai_failure_explanations.specific_fixes",
          explanation_index: explanationIndex,
          fix_index: fixIndex,
        },
      }));
    },
  );

  return derivedFromExplanations;
}

function sortPatchHistory(items: PatchHistoryItem[]): PatchHistoryItem[] {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.updated_at ?? a.created_at ?? 0).getTime();
    const bTime = new Date(b.updated_at ?? b.created_at ?? 0).getTime();
    return bTime - aTime;
  });
}

function getBestPatch(
  candidates: PatchCandidate[],
  history: PatchHistoryItem[],
): PatchHistoryItem | null {
  const bestHistory = [...history]
    .filter((item) => item.comparison || item.is_best_patch)
    .sort((a, b) => {
      const deltaA = safeNumber(a.comparison?.pass_rate_delta, -9999);
      const deltaB = safeNumber(b.comparison?.pass_rate_delta, -9999);
      return deltaB - deltaA;
    })[0];

  if (bestHistory) return bestHistory;

  const bestCandidate =
    candidates.find((item) => item.is_best_patch) ?? candidates[0] ?? null;

  if (!bestCandidate) return null;

  return {
    patch_id: bestCandidate.patch_id,
    patch_title: bestCandidate.title ?? null,
    patch_summary: bestCandidate.summary ?? null,
    status: bestCandidate.status ?? "suggested",
    confidence_score: bestCandidate.confidence_score ?? null,
    risk_level: bestCandidate.risk_level ?? null,
    comparison: null,
    is_best_patch: bestCandidate.is_best_patch ?? null,
  };
}

export function RunDetailsPage() {
  const { runId = "" } = useParams();
  const queryClient = useQueryClient();

  const [selectedFailure, setSelectedFailure] =
    useState<ExecutionResultRow | null>(null);
  const [selectedFailureOpen, setSelectedFailureOpen] = useState(false);

  const [activePatchId, setActivePatchId] = useState<string | null>(null);
  const [activeRerunRunId, setActiveRerunRunId] = useState<string | null>(null);
  const [selectedHistoryPatchId, setSelectedHistoryPatchId] = useState<
    string | null
  >(null);
  const [latestApplyResponse, setLatestApplyResponse] =
    useState<PatchRerunResponse | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["runs", runId, "details"],
    queryFn: () => getRunDetails(runId),
    enabled: Boolean(runId),
  });

  const shouldPoll = useMemo(() => {
    return data?.status === "queued" || data?.status === "running";
  }, [data?.status]);

  useRunPolling(runId, shouldPoll);

  const aiExplanations: AiExplanation[] = Array.isArray(
    data?.ai_failure_explanations,
  )
    ? data.ai_failure_explanations
    : [];

  const selectedExplanation = useMemo(() => {
    if (!selectedFailure?.title) return null;

    return (
      aiExplanations.find((item) => item.title === selectedFailure.title) ??
      null
    );
  }, [selectedFailure, aiExplanations]);

  const patchId = data?.patch_id ?? data?.patch?.patch_id ?? null;
  const originalRunId =
    data?.original_run_id ??
    data?.patch?.original_run_id ??
    data?.source_run_id ??
    null;
  const rerunRunId = data?.run_id ?? null;
  const isAiRerun = data?.trigger_source === "ai_rerun";
  const canCompare = Boolean(patchId || (originalRunId && rerunRunId));

  const patchCandidates = useMemo(() => {
    return getPatchCandidatesFromRun(data);
  }, [data]);

  const patchHistoryQuery = useQuery({
    queryKey: patchHistoryKey(runId),
    queryFn: () => getPatchHistory(runId),
    enabled: Boolean(runId),
    staleTime: 15_000,
    retry: false,
  });

  const patchHistory = useMemo(() => {
    return sortPatchHistory(safeArray<PatchHistoryItem>(patchHistoryQuery.data));
  }, [patchHistoryQuery.data]);

  const effectivePatchRerunRunId =
    activeRerunRunId ??
    latestApplyResponse?.rerun_run_id ??
    patchHistory.find((item) => item.patch_id === selectedHistoryPatchId)
      ?.rerun_run_id ??
    (data?.trigger_source === "ai_rerun" ? data?.run_id : null);

  const patchComparisonQuery = useQuery({
    queryKey: patchComparisonKey(
      patchId,
      originalRunId,
      effectivePatchRerunRunId ?? rerunRunId,
    ),
    queryFn: async () => {
      const effectiveRerunRunId = effectivePatchRerunRunId ?? rerunRunId;

      if (originalRunId && effectiveRerunRunId) {
        return compareRuns(originalRunId, effectiveRerunRunId);
      }

      if (patchId) {
        return getPatchComparison(patchId);
      }

      throw new Error("Comparison data is not available for this rerun.");
    },
    enabled: Boolean(
      (isAiRerun && canCompare) ||
        (originalRunId && (effectivePatchRerunRunId ?? rerunRunId)),
    ),
    staleTime: 30_000,
  });

  const rerunDetailsQuery = useQuery({
    queryKey: ["runs", effectivePatchRerunRunId, "details"],
    queryFn: () => getRunDetails(effectivePatchRerunRunId as string),
    enabled: Boolean(effectivePatchRerunRunId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "queued" || status === "running" ? 2500 : false;
    },
  });

  useEffect(() => {
    const rerunStatus = rerunDetailsQuery.data?.status;
    if (rerunStatus === "completed" || rerunStatus === "failed") {
      queryClient.invalidateQueries({ queryKey: ["runs", runId, "details"] });
      queryClient.invalidateQueries({ queryKey: patchHistoryKey(runId) });
      queryClient.invalidateQueries({
        queryKey: patchComparisonKey(
          patchId,
          originalRunId,
          effectivePatchRerunRunId ?? rerunRunId,
        ),
      });
    }
  }, [
    rerunDetailsQuery.data?.status,
    queryClient,
    runId,
    patchId,
    originalRunId,
    effectivePatchRerunRunId,
    rerunRunId,
  ]);

  const applyPatchMutation = useMutation({
    mutationFn: (patch: PatchCandidate) =>
      applyPatchAndRerun({
        runId,
        patchId: patch.patch_id,
        requirementTitles: patch.requirement_title
          ? [patch.requirement_title]
          : [],
      }),
    onMutate: (patch) => {
      setActivePatchId(patch.patch_id);
      setSelectedHistoryPatchId(patch.patch_id);
      setLatestApplyResponse(null);
    },
    onSuccess: async (response) => {
      setLatestApplyResponse(response);
      setActivePatchId(response?.patch_id ?? activePatchId);
      setActiveRerunRunId(response?.rerun_run_id ?? null);
      setSelectedHistoryPatchId(response?.patch_id ?? activePatchId ?? null);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["runs", runId, "details"] }),
        queryClient.invalidateQueries({ queryKey: patchHistoryKey(runId) }),
      ]);
    },
  });

  if (isLoading) {
    return <LoadingState label="Loading run details..." />;
  }

  if (isError) {
    return <ErrorState message={(error as Error).message} onRetry={refetch} />;
  }

  if (!data) {
    return <ErrorState message="Run not found" />;
  }

  const failedTestDetails = Array.isArray(data.failed_test_details)
    ? data.failed_test_details
    : [];

  const clusters = Array.isArray(data.failure_clusters?.clusters)
    ? data.failure_clusters.clusters
    : [];

  const rawExecutionResults: ExecutionResultRow[] = Array.isArray(
    data.execution_results,
  )
    ? data.execution_results
    : [];

  const passRate = Number(data.execution_summary?.pass_rate ?? 0);
  const formattedPassRate = `${passRate.toFixed(1)}%`;

  const executionResults: ExecutionResultRow[] = rawExecutionResults.map(
    (result) => ({
      ...result,
      screenshot_url: result.screenshot_url,
      trace_url: result.trace_url,
    }),
  );

  const totalTests = Number(
    data.execution_summary?.total ?? data.total_tests ?? 0,
  );

  const passRateTone =
    passRate === 0 || totalTests === 0
      ? "default"
      : passRate < 70
        ? "danger"
        : passRate <= 80
          ? "warning"
          : "success";

  const bestPatch = getBestPatch(patchCandidates, patchHistory);

  const selectedHistoryComparison =
    patchHistory.find((item) => item.patch_id === selectedHistoryPatchId)
      ?.comparison ?? null;

  const displayedComparison =
    patchComparisonQuery.data ?? selectedHistoryComparison ?? null;

  const latestPartialRerun =
    latestApplyResponse?.partial_rerun ??
    patchHistory.find((item) => item.patch_id === selectedHistoryPatchId)
      ?.partial_rerun ??
    false;

  const latestRerunScope =
    latestApplyResponse?.rerun_scope ??
    patchHistory.find((item) => item.patch_id === selectedHistoryPatchId)
      ?.rerun_scope ??
    [];

  const latestWarning =
    latestApplyResponse?.warning ??
    (latestPartialRerun
      ? "This rerun only covers a subset of the original scope. Validate final quality with a broader rerun after confirming the patch."
      : null);

  const latestRerunData = rerunDetailsQuery.data;
  const latestRerunSummary = getExecutionSummary(latestRerunData);

  const linkedOriginalRunId =
    data?.original_run_id ?? data?.source_run_id ?? null;

  const latestRelatedRerunId =
    patchHistory.find((item) => item.rerun_run_id)?.rerun_run_id ?? null;

  const latestImprovedRerunId =
    patchHistory.find(
      (item) =>
        item.rerun_run_id && item.comparison?.verdict === "improved",
    )?.rerun_run_id ?? null;

  return (
    <div>
      <PageHeader
        title={`Run ${data.run_id}`}
        subtitle="Execution details, failures, artifacts, AI analysis, and patch rerun workflow"
        actions={<StatusBadge status={data.status} />}
      />

      <RunStatusBanner
        status={data.status}
        created_at={data.created_at ?? undefined}
        started_at={data.started_at ?? undefined}
        completed_at={data.completed_at ?? undefined}
      />

      <RunTimeline
        status={data.status}
        created_at={data.created_at ?? undefined}
        started_at={data.started_at ?? undefined}
        completed_at={data.completed_at ?? undefined}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        <MetricCard
          label="Total"
          value={data.execution_summary?.total ?? data.total_tests ?? 0}
        />
        <MetricCard
          label="Passed"
          value={data.execution_summary?.passed ?? data.passed_tests ?? 0}
          tone={
            (data.execution_summary?.passed ?? data.passed_tests ?? 0) > 0
              ? "success"
              : "default"
          }
        />
        <MetricCard
          label="Failed"
          value={data.execution_summary?.failed ?? data.failed_tests ?? 0}
          tone={
            (data.execution_summary?.failed ?? data.failed_tests ?? 0) > 0
              ? "danger"
              : "default"
          }
        />
        <MetricCard
          label="Pass Rate"
          value={formattedPassRate}
          tone={passRateTone}
        />
      </div>

      <div style={{ display: "grid", gap: "16px" }}>
        <RunLifecycleCard
          run_id={data.run_id}
          status={data.status}
          created_at={data.created_at ?? undefined}
          started_at={data.started_at ?? undefined}
          completed_at={data.completed_at ?? undefined}
          trigger_source={data.trigger_source}
          details_available={data.details_available}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <SectionCard title="Requirements">
            {Array.isArray(data.requirements) &&
            data.requirements.length > 0 ? (
              <ul>
                {data.requirements.map((item: string) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <div>No requirements</div>
            )}
          </SectionCard>

          <SectionCard title="Executed Files">
            {Array.isArray(data.executed_files) &&
            data.executed_files.length > 0 ? (
              <ul>
                {data.executed_files.map((file: string) => (
                  <li key={file}>{file}</li>
                ))}
              </ul>
            ) : (
              <div>No executed files</div>
            )}
          </SectionCard>
        </div>

        <SectionCard title="Generated Tests">
          {Array.isArray(data.generated_tests) &&
          data.generated_tests.length > 0 ? (
            <div style={{ display: "grid", gap: "12px" }}>
              {data.generated_tests.map((test: any, index: number) => (
                <div
                  key={`${test.file ?? "generated"}-${index}`}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "12px",
                  }}
                >
                  <div>
                    <strong>Requirement:</strong> {test.requirement ?? "-"}
                  </div>
                  <div>
                    <strong>Status:</strong> {test.status ?? "-"}
                  </div>
                  <div>
                    <strong>Flow:</strong> {test.flow ?? "-"}
                  </div>
                  <div>
                    <strong>File:</strong> {test.file ?? "-"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>No generated tests</div>
          )}
        </SectionCard>

        <SectionCard title="Linked Runs">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "16px",
            }}
          >
            <div style={metricLikeCard}>
              <div style={metricLabel}>Original Run</div>
              {linkedOriginalRunId ? (
                <Link to={`/runs/${linkedOriginalRunId}`} style={metricLink}>
                  {linkedOriginalRunId}
                </Link>
              ) : (
                <div style={emptyStyle}>—</div>
              )}
            </div>

            <div style={metricLikeCard}>
              <div style={metricLabel}>Patch ID</div>
              {data?.patch_id ? (
                <div style={metricValue}>{data.patch_id}</div>
              ) : (
                <div style={emptyStyle}>—</div>
              )}
            </div>

            <div style={metricLikeCard}>
              <div style={metricLabel}>Latest Rerun</div>
              {latestRelatedRerunId ? (
                <Link to={`/runs/${latestRelatedRerunId}`} style={metricLink}>
                  {latestRelatedRerunId}
                </Link>
              ) : (
                <div style={emptyStyle}>—</div>
              )}
            </div>

            <div style={metricLikeCard}>
              <div style={metricLabel}>Improved Rerun</div>
              {latestImprovedRerunId ? (
                <Link to={`/runs/${latestImprovedRerunId}`} style={metricLink}>
                  {latestImprovedRerunId}
                </Link>
              ) : (
                <div style={emptyStyle}>—</div>
              )}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Apply Patch and Rerun">
          <div style={{ display: "grid", gap: "16px" }}>
            {effectivePatchRerunRunId && (
              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "12px",
                  background: "#ffffff",
                }}
              >
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#0f172a",
                    marginBottom: "10px",
                  }}
                >
                  Patch Rerun Status
                </div>

                {rerunDetailsQuery.isLoading ? (
                  <div>Loading rerun status...</div>
                ) : rerunDetailsQuery.isError ? (
                  <div style={{ color: "#b91c1c" }}>
                    Failed to load rerun details:{" "}
                    {rerunDetailsQuery.error instanceof Error
                      ? rerunDetailsQuery.error.message
                      : "Unknown error"}
                  </div>
                ) : latestRerunData ? (
                  <div style={{ display: "grid", gap: "12px" }}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "16px",
                      }}
                    >
                      <MetricCard label="Total" value={latestRerunSummary.total} />
                      <MetricCard
                        label="Passed"
                        value={latestRerunSummary.passed}
                        tone={
                          latestRerunSummary.passed > 0 ? "success" : "default"
                        }
                      />
                      <MetricCard
                        label="Failed"
                        value={latestRerunSummary.failed}
                        tone={
                          latestRerunSummary.failed > 0 ? "danger" : "default"
                        }
                      />
                      <MetricCard
                        label="Pass Rate"
                        value={`${latestRerunSummary.pass_rate.toFixed(1)}%`}
                        tone={
                          latestRerunSummary.pass_rate === 0 ||
                          latestRerunSummary.total === 0
                            ? "default"
                            : latestRerunSummary.pass_rate < 70
                              ? "danger"
                              : latestRerunSummary.pass_rate <= 80
                                ? "warning"
                                : "success"
                        }
                      />
                    </div>

                    <div>
                      <strong>Latest patch rerun:</strong>{" "}
                      {latestRerunData.run_id ?? "-"} <br />
                      <strong>Status:</strong> {latestRerunData.status ?? "-"}
                    </div>
                  </div>
                ) : (
                  <div>Rerun not available.</div>
                )}
              </div>
            )}

            <ApplyPatchActionCard
              patches={patchCandidates}
              isApplying={applyPatchMutation.isPending}
              activePatchId={activePatchId}
              disabled={data.status === "queued" || data.status === "running"}
              onApplyPatch={(patch) => {
                applyPatchMutation.mutate(patch);
              }}
            />

            {applyPatchMutation.isError ? (
              <div
                style={{
                  color: "#b91c1c",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  padding: "10px",
                }}
              >
                {(applyPatchMutation.error as Error)?.message ??
                  "Failed to apply patch and rerun."}
              </div>
            ) : null}

            {latestApplyResponse?.message ? (
              <div
                style={{
                  color: "#1d4ed8",
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "8px",
                  padding: "10px",
                }}
              >
                {latestApplyResponse.message}
              </div>
            ) : null}

            <PartialRerunWarning
              partialRerun={latestPartialRerun}
              rerunScope={latestRerunScope}
              warning={latestWarning}
            />
          </div>
        </SectionCard>

        {isAiRerun && !canCompare && (
          <SectionCard title="Patch Comparison">
            <div style={{ color: "#92400e" }}>
              Comparison unavailable: rerun is missing patch_id or
              original_run_id/source_run_id in the run details response.
            </div>
          </SectionCard>
        )}

        {isAiRerun && patchComparisonQuery.isLoading && (
          <SectionCard title="Patch Comparison">
            <div>Loading patch comparison...</div>
          </SectionCard>
        )}

        {isAiRerun && patchComparisonQuery.isError && (
          <SectionCard title="Patch Comparison">
            <div style={{ color: "#b91c1c" }}>
              Failed to load patch comparison:{" "}
              {patchComparisonQuery.error instanceof Error
                ? patchComparisonQuery.error.message
                : JSON.stringify(patchComparisonQuery.error)}
            </div>
          </SectionCard>
        )}

        <PatchComparisonSummaryCard comparison={displayedComparison} />

        <BestPatchCard patch={bestPatch} />

        <PatchHistoryPanel
          items={patchHistory}
          isLoading={patchHistoryQuery.isLoading}
          selectedPatchId={selectedHistoryPatchId}
          onSelectPatch={(item) => {
            setSelectedHistoryPatchId(item.patch_id);
            if (item.rerun_run_id) {
              setActiveRerunRunId(item.rerun_run_id);
            }
          }}
        />

        <ExecutionResultsTable
          results={executionResults}
          onSelectFailure={(result) => {
            setSelectedFailure(result);
            setSelectedFailureOpen(true);
          }}
        />

        <FailedTestsPanel failedTests={failedTestDetails} />
        <AiExplanationsPanel explanations={aiExplanations} />
        <FailureClustersPanel clusters={clusters} />
        <ArtifactsPanel artifacts={data.artifacts} />

        <SectionCard title="Raw Run JSON">
          <pre style={{ whiteSpace: "pre-wrap", overflowX: "auto" }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </SectionCard>
      </div>

      <FailureDetailsModal
        open={selectedFailureOpen}
        onClose={() => {
          setSelectedFailureOpen(false);
          setSelectedFailure(null);
        }}
        result={selectedFailure}
        explanation={selectedExplanation}
        runId={runId}
      />
    </div>
  );
}