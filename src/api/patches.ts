import api from "./client";

export interface RunSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  pass_rate: number;
}

export interface ComparedTestItem {
  test_key?: string | null;
  title?: string | null;
  suite?: string | null;
  original_status?: string | null;
  rerun_status?: string | null;
  original_error_message?: string | null;
  rerun_error_message?: string | null;
  original_screenshot_url?: string | null;
  rerun_screenshot_url?: string | null;
  original_trace_url?: string | null;
  rerun_trace_url?: string | null;
}

export interface PatchComparisonSummary {
  original: RunSummary;
  rerun: RunSummary;
  pass_rate_improvement: number;
  fixed_count: number;
  remaining_count: number;
  new_failures_count: number;
  still_passing_count: number;
  effectiveness_score?: number | null;
  effectiveness_label?: string | null;
}

export interface PatchComparisonMetadata {
  original_trigger_source?: string | null;
  rerun_trigger_source?: string | null;
  comparable_tests_count: number;
  notes: string[];
}

export interface PatchComparisonResponse {
  patch_id?: string | null;
  original_run_id: string;
  rerun_run_id: string;
  comparison_generated_at: string;
  summary: PatchComparisonSummary;
  fixed_failures: ComparedTestItem[];
  remaining_failures: ComparedTestItem[];
  new_failures: ComparedTestItem[];
  still_passing: ComparedTestItem[];
  metadata: PatchComparisonMetadata;
}

export async function getPatchComparison(
  patchId: string
): Promise<PatchComparisonResponse> {
  try {
    const { data } = await api.get(`/patches/${patchId}/comparison`);
    return data;
  } catch (error: any) {
    console.error("Failed to fetch patch comparison:", error);
    throw new Error(
      error?.response?.data?.detail || "Failed to fetch patch comparison"
);
  }
}

export async function compareRuns(
  originalRunId: string,
  rerunRunId: string
): Promise<PatchComparisonResponse> {
  try {
    const { data } = await api.get("/compare", {
      params: {
        original_run_id: originalRunId,
        rerun_run_id: rerunRunId,
      },
    });
    return data;
  } catch (error: any) {
    console.error("Failed to compare runs:", error);
    throw new Error(
      error?.response?.data?.detail || "Failed to compare runs"
    );
  }
}

export async function getPatchComparisonSafe(
  patchId: string
): Promise<PatchComparisonResponse | null> {
  try {
    return await getPatchComparison(patchId);
  } catch {
    return null;
  }
}

export const patchComparisonKey = (
  patchId?: string | null,
  originalRunId?: string | null,
  rerunRunId?: string | null
) => ["patch-comparison", patchId, originalRunId, rerunRunId] as const;

export function isPatchEffective(summary: PatchComparisonSummary) {
  return (
    summary.pass_rate_improvement > 0 &&
    summary.new_failures_count === 0
  );
}