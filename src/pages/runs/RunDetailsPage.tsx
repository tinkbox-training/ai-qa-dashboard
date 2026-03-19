import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

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
import { PatchComparisonPanel } from "../../components/run/PatchComparisonPanel";

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

import {
  compareRuns,
  getPatchComparison,
  patchComparisonKey,
} from "../../api/patches";

type AiExplanation = {
  title?: string;
  [key: string]: any;
};

export function RunDetailsPage() {
  const { runId = "" } = useParams();

  const [selectedFailure, setSelectedFailure] =
    useState<ExecutionResultRow | null>(null);
  const [selectedFailureOpen, setSelectedFailureOpen] = useState(false);

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

  console.log("comparison ids", {
    patchId,
    originalRunId,
    rerunRunId,
  });

  const patchComparisonQuery = useQuery({
    queryKey: ["patch-comparison", patchId, originalRunId, rerunRunId],
    queryFn: async () => {
      if (originalRunId && rerunRunId) {
        return compareRuns(originalRunId, rerunRunId);
      }

      if (patchId) {
        // fallback (optional)
        return getPatchComparison(patchId);
      }

      throw new Error("Comparison data is not available for this rerun.");
    },
    enabled: canCompare,
    staleTime: 30_000,
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

  return (
    <div>
      <PageHeader
        title={`Run ${data.run_id}`}
        subtitle="Execution details, failures, artifacts, and AI analysis"
        actions={<StatusBadge status={data.status} />}
      />

      <RunStatusBanner
        status={data.status}
        created_at={data.created_at}
        started_at={data.started_at}
        completed_at={data.completed_at}
      />

      <RunTimeline
        status={data.status}
        created_at={data.created_at}
        started_at={data.started_at}
        completed_at={data.completed_at}
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
          created_at={data.created_at}
          started_at={data.started_at}
          completed_at={data.completed_at}
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

        <ExecutionResultsTable
          results={executionResults}
          onSelectFailure={(result) => {
            setSelectedFailure(result);
            setSelectedFailureOpen(true);
          }}
        />

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

        {isAiRerun && patchComparisonQuery.data && (
          <PatchComparisonPanel comparison={patchComparisonQuery.data} />
        )}

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
