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

export interface PatchCandidate {
  patch_id: string;
  title?: string | null;
  summary?: string | null;
  rationale?: string | null;
  risk_level?: string | null;
  confidence_score?: number | null;
  status?: PatchLifecycleStatus | null;
  file_path?: string | null;
  requirement_title?: string | null;
  diff_preview?: string | null;
  code_patch?: string | null;
  is_best_patch?: boolean | null;
  metadata?: Record<string, any> | null;
}

export interface PatchRerunRequest {
  runId: string;
  patchId: string;
  requirementTitles?: string[];
}

export interface PatchRerunResponse {
  ok?: boolean;
  status?: string | null;
  message?: string | null;
  patch_id?: string | null;
  rerun_run_id?: string | null;
  original_run_id?: string | null;
  partial_rerun?: boolean | null;
  rerun_scope?: string[] | null;
  warning?: string | null;
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
  comparison_items?: Array<Record<string, any>> | null;
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
  metadata?: Record<string, any> | null;
}