import api from "./client";

export type PatchLifecycleStatus =
  | "draft"
  | "suggested"
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "applied"
  | "rejected"
  | "unknown";

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
  original_run_id?: string | null;
  rerun_run_id?: string | null;
  patch_id?: string | null;
  patch_title?: string | null;
  improved_failures?: number | null;
  remaining_failures?: number | null;
  regressions?: number | null;
  newly_passed?: number | null;
  pass_rate_before?: number | null;
  pass_rate_after?: number | null;
  pass_rate_delta?: number | null;
  total_before?: number | null;
  total_after?: number | null;
  summary?: string | null;
  verdict?: "improved" | "same" | "regressed" | "unknown" | null;
  comparison_items?: ComparedTestItem[] | null;
}

export interface PatchComparisonMetadata {
  original_trigger_source?: string | null;
  rerun_trigger_source?: string | null;
  comparable_tests_count?: number;
  notes?: string[];
}

export interface PatchComparisonResponse {
  patch_id?: string | null;
  original_run_id: string;
  rerun_run_id: string;
  comparison_generated_at?: string | null;

  summary?: {
    original?: RunSummary;
    rerun?: RunSummary;
    pass_rate_improvement?: number;
    fixed_count?: number;
    remaining_count?: number;
    new_failures_count?: number;
    still_passing_count?: number;
    effectiveness_score?: number | null;
    effectiveness_label?: string | null;
  } | null;

  fixed_failures?: ComparedTestItem[];
  remaining_failures?: ComparedTestItem[];
  new_failures?: ComparedTestItem[];
  still_passing?: ComparedTestItem[];
  metadata?: PatchComparisonMetadata;

  /**
   * Flattened fields for existing patch UI components
   */
  improved_failures?: number | null;
  remaining_failures_count?: number | null;
  regressions?: number | null;
  newly_passed?: number | null;
  pass_rate_before?: number | null;
  pass_rate_after?: number | null;
  pass_rate_delta?: number | null;
  total_before?: number | null;
  total_after?: number | null;
  verdict?: "improved" | "same" | "regressed" | "unknown" | null;
  comparison_text?: string | null;
}

export interface PatchCandidate {
  patch_id: string;
  title?: string | null;
  summary?: string | null;
  rationale?: string | null;
  confidence_score?: number | null;
  risk_level?: string | null;
  status?: PatchLifecycleStatus | null;
  file_path?: string | null;
  requirement_title?: string | null;
  diff_preview?: string | null;
  code_patch?: string | null;
  is_best_patch?: boolean | null;
  metadata?: Record<string, any> | null;
  raw?: any;
}

export interface PatchRerunResponse {
  ok?: boolean;
  status?: string | null;
  message?: string | null;
  patch_id?: string | null;
  original_run_id?: string | null;
  rerun_run_id?: string | null;
  partial_rerun?: boolean | null;
  rerun_scope?: string[] | null;
  warning?: string | null;
  [key: string]: any;
}

export interface PatchHistoryItem {
  patch_id: string;
  patch_title?: string | null;
  patch_summary?: string | null;
  status?: PatchLifecycleStatus | null;
  created_at?: string | null;
  updated_at?: string | null;
  applied_at?: string | null;
  original_run_id?: string | null;
  rerun_run_id?: string | null;
  comparison?: PatchComparisonSummary | null;
  confidence_score?: number | null;
  risk_level?: string | null;
  partial_rerun?: boolean | null;
  rerun_scope?: string[] | null;
  error_message?: string | null;
  is_best_patch?: boolean | null;
  metadata?: Record<string, any> | null;
  raw?: any;
}

function getErrorMessage(error: any, fallback: string) {
  return (
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

async function tryGet<T>(paths: string[], config?: any): Promise<T> {
  let lastError: any = null;

  for (const path of paths) {
    try {
      const { data } = await api.get(path, config);
      return data;
    } catch (error: any) {
      lastError = error;
      const status = error?.response?.status;

      if (status && status !== 404) {
        throw new Error(getErrorMessage(error, `Failed GET ${path}`));
      }
    }
  }

  throw new Error(getErrorMessage(lastError, "GET request failed"));
}

async function tryPost<T>(paths: string[], body?: any, config?: any): Promise<T> {
  let lastError: any = null;

  for (const path of paths) {
    try {
      const { data } = await api.post(path, body, config);
      return data;
    } catch (error: any) {
      lastError = error;
      const status = error?.response?.status;

      if (status && status !== 404) {
        throw new Error(getErrorMessage(error, `Failed POST ${path}`));
      }
    }
  }

  throw new Error(getErrorMessage(lastError, "POST request failed"));
}

function safeNumber(value: any): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function inferVerdict(delta?: number | null, regressions?: number | null) {
  if ((regressions ?? 0) > 0) return "regressed";
  if ((delta ?? 0) > 0) return "improved";
  if ((delta ?? 0) === 0) return "same";
  return "unknown";
}

export function normalizePatchComparison(input: any): PatchComparisonSummary | null {
  if (!input) return null;

  const original =
    input?.summary?.original ??
    input?.original ??
    null;

  const rerun =
    input?.summary?.rerun ??
    input?.rerun ??
    null;

  const improvedFailures =
    safeNumber(input?.improved_failures) ??
    safeNumber(input?.summary?.fixed_count) ??
    safeNumber(input?.fixed_count) ??
    0;

  const remainingFailures =
    safeNumber(input?.remaining_failures) ??
    safeNumber(input?.remaining_failures_count) ??
    safeNumber(input?.summary?.remaining_count) ??
    safeNumber(input?.remaining_count) ??
    0;

  const regressions =
    safeNumber(input?.regressions) ??
    safeNumber(input?.summary?.new_failures_count) ??
    safeNumber(input?.new_failures_count) ??
    0;

  const newlyPassed =
    safeNumber(input?.newly_passed) ??
    safeNumber(input?.summary?.fixed_count) ??
    safeNumber(input?.fixed_count) ??
    0;

  const passRateBefore =
    safeNumber(input?.pass_rate_before) ??
    safeNumber(original?.pass_rate) ??
    0;

  const passRateAfter =
    safeNumber(input?.pass_rate_after) ??
    safeNumber(rerun?.pass_rate) ??
    0;

  const passRateDelta =
    safeNumber(input?.pass_rate_delta) ??
    safeNumber(input?.summary?.pass_rate_improvement) ??
    (passRateBefore != null && passRateAfter != null
      ? passRateAfter - passRateBefore
      : null);

  const totalBefore =
    safeNumber(input?.total_before) ??
    safeNumber(original?.total) ??
    0;

  const totalAfter =
    safeNumber(input?.total_after) ??
    safeNumber(rerun?.total) ??
    0;

  return {
    original_run_id: input?.original_run_id ?? null,
    rerun_run_id: input?.rerun_run_id ?? null,
    patch_id: input?.patch_id ?? null,
    patch_title: input?.patch_title ?? null,
    improved_failures: improvedFailures,
    remaining_failures: remainingFailures,
    regressions,
    newly_passed: newlyPassed,
    pass_rate_before: passRateBefore,
    pass_rate_after: passRateAfter,
    pass_rate_delta: passRateDelta,
    total_before: totalBefore,
    total_after: totalAfter,
    summary:
      input?.summary_text ??
      input?.comparison_text ??
      input?.summary?.effectiveness_label ??
      null,
    verdict:
      input?.verdict ??
      inferVerdict(passRateDelta, regressions),
    comparison_items:
      input?.comparison_items ??
      input?.fixed_failures ??
      null,
  };
}

export function normalizePatchSuggestion(item: any): PatchCandidate | null {
  const patchId = item?.patch_id ?? item?.id ?? null;
  if (!patchId) return null;

  return {
    patch_id: patchId,
    title: item?.title ?? item?.patch_title ?? item?.name ?? null,
    summary: item?.summary ?? item?.patch_summary ?? null,
    rationale: item?.rationale ?? item?.reason ?? null,
    confidence_score:
      typeof item?.confidence_score === "number"
        ? item.confidence_score
        : typeof item?.confidence === "number"
          ? item.confidence
          : null,
    risk_level: item?.risk_level ?? null,
    status: item?.status ?? "suggested",
    file_path: item?.file_path ?? item?.path ?? null,
    requirement_title:
      item?.requirement_title ??
      item?.requirement ??
      item?.requirement_name ??
      null,
    diff_preview: item?.diff_preview ?? item?.diff ?? item?.patch ?? null,
    code_patch: item?.code_patch ?? item?.patch ?? null,
    is_best_patch:
      typeof item?.is_best_patch === "boolean" ? item.is_best_patch : null,
    metadata: item?.metadata ?? null,
    raw: item,
  };
}

export function normalizePatchSuggestions(input: any): PatchCandidate[] {
  const raw = Array.isArray(input)
    ? input
    : Array.isArray(input?.patches)
      ? input.patches
      : Array.isArray(input?.patch_suggestions)
        ? input.patch_suggestions
        : Array.isArray(input?.suggested_patches)
          ? input.suggested_patches
          : Array.isArray(input?.ai_patches)
            ? input.ai_patches
            : Array.isArray(input?.fixes)
              ? input.fixes
              : [];

  return raw
    .map(normalizePatchSuggestion)
    .filter((item: PatchCandidate | null): item is PatchCandidate => Boolean(item));
}

export function normalizePatchHistoryItem(item: any): PatchHistoryItem | null {
  const patchId = item?.patch_id ?? item?.id ?? null;
  if (!patchId) return null;

  return {
    patch_id: patchId,
    patch_title: item?.patch_title ?? item?.title ?? null,
    patch_summary: item?.patch_summary ?? item?.summary ?? null,
    status: item?.status ?? "unknown",
    created_at: item?.created_at ?? null,
    updated_at: item?.updated_at ?? null,
    applied_at: item?.applied_at ?? null,
    original_run_id: item?.original_run_id ?? null,
    rerun_run_id: item?.rerun_run_id ?? item?.run_id ?? null,
    comparison: normalizePatchComparison(item?.comparison),
    confidence_score:
      typeof item?.confidence_score === "number"
        ? item.confidence_score
        : typeof item?.confidence === "number"
          ? item.confidence
          : null,
    risk_level: item?.risk_level ?? null,
    partial_rerun:
      typeof item?.partial_rerun === "boolean" ? item.partial_rerun : null,
    rerun_scope: Array.isArray(item?.rerun_scope) ? item.rerun_scope : null,
    error_message: item?.error_message ?? null,
    is_best_patch:
      typeof item?.is_best_patch === "boolean" ? item.is_best_patch : null,
    metadata: item?.metadata ?? null,
    raw: item,
  };
}

export function normalizePatchHistory(input: any): PatchHistoryItem[] {
  const raw = Array.isArray(input)
    ? input
    : Array.isArray(input?.history)
      ? input.history
      : Array.isArray(input?.patch_history)
        ? input.patch_history
        : Array.isArray(input?.items)
          ? input.items
          : Array.isArray(input?.patches)
            ? input.patches
            : [];

  return raw
    .map(normalizePatchHistoryItem)
    .filter((item: PatchHistoryItem | null): item is PatchHistoryItem => Boolean(item));
}

export async function getPatchComparison(
  patchId: string,
): Promise<PatchComparisonSummary | null> {
  try {
    const data = await tryGet<any>([
      `/patches/${patchId}/comparison`,
    ]);
    return normalizePatchComparison(data);
  } catch (error: any) {
    console.error("Failed to fetch patch comparison:", error);
    throw new Error(getErrorMessage(error, "Failed to fetch patch comparison"));
  }
}

export async function compareRuns(
  originalRunId: string,
  rerunRunId: string,
): Promise<PatchComparisonSummary | null> {
  try {
    const { data } = await api.get("/compare", {
      params: {
        original_run_id: originalRunId,
        rerun_run_id: rerunRunId,
      },
    });

    return normalizePatchComparison({
      ...data,
      original_run_id: data?.original_run_id ?? originalRunId,
      rerun_run_id: data?.rerun_run_id ?? rerunRunId,
    });
  } catch (error: any) {
    console.error("Failed to compare runs:", error);
    throw new Error(getErrorMessage(error, "Failed to compare runs"));
  }
}

export async function applyPatchAndRerun(params: {
  runId: string;
  patchId: string;
  requirementTitles?: string[];
}): Promise<PatchRerunResponse> {
  const body = {
    patch_id: params.patchId,
    requirement_titles: params.requirementTitles ?? [],
  };

  try {
    return await tryPost<PatchRerunResponse>(
      [
        `/runs/${params.runId}/patches/${params.patchId}/apply-and-rerun`,
        `/patches/${params.patchId}/apply-and-rerun`,
        `/patches/${params.patchId}/apply`,
      ],
      body,
    );
  } catch (error: any) {
    console.error("Failed to apply patch and rerun:", error);
    throw new Error(
      getErrorMessage(error, "Failed to apply patch and rerun"),
    );
  }
}

export async function getPatchHistory(
  runId: string,
): Promise<PatchHistoryItem[]> {
  try {
    const data = await tryGet<any>(
      [
        `/runs/${runId}/patches/history`,
        `/runs/${runId}/patch-history`,
        `/patches/history`,
      ],
      {
        params: { run_id: runId },
      },
    );

    return normalizePatchHistory(data);
  } catch (error: any) {
    console.error("Failed to fetch patch history:", error);
    throw new Error(getErrorMessage(error, "Failed to fetch patch history"));
  }
}

export async function getPatchComparisonSafe(
  patchId: string,
): Promise<PatchComparisonSummary | null> {
  try {
    return await getPatchComparison(patchId);
  } catch {
    return null;
  }
}

export const patchComparisonKey = (
  patchId?: string | null,
  originalRunId?: string | null,
  rerunRunId?: string | null,
) => ["patch-comparison", patchId, originalRunId, rerunRunId] as const;

export const patchHistoryKey = (runId?: string | null) =>
  ["patch-history", runId] as const;

export function isPatchEffective(summary: PatchComparisonSummary) {
  return (
    (summary.pass_rate_delta ?? 0) > 0 &&
    (summary.regressions ?? 0) === 0
  );
}