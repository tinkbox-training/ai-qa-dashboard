export interface InsightOverview {
  total_tests: number;
  stable_tests: number;
  flaky_tests: number;
  unstable_tests: number;
  critical_tests: number;
  top_failure_type: string | null;
  best_patch_id: string | null;
}

export interface DailyTrendPoint {
  date: string;
  failures: number;
  passes: number;
  unique_failed_tests: number;
}

export interface ProblemAreaItem {
  failure_type: string;
  count: number;
  affected_tests: number;
  latest_seen_at: string | null;
}

export interface AIRecommendationItem {
  priority: string;
  category: string;
  title: string;
  reason: string;
  suggested_action: string;
  affected_tests: string[];
}

export interface SummaryInsightsResponse {
  overview: InsightOverview;
  trends: {
    daily: DailyTrendPoint[];
  };
  top_problem_areas: ProblemAreaItem[];
  ai_recommendations: AIRecommendationItem[];
}

export interface TestInsightItem {
  test_key: string;
  total_runs: number;
  passed_runs: number;
  failed_runs: number;
  pass_rate: number;
  fail_rate: number;
  recent_fail_rate: number;
  flip_count: number;
  flaky_score: number;
  stability_score: number;
  classification: string;
  ci_impact_score: number;
  impact_priority: string;
  last_seen_at: string | null;
}

export interface TestsInsightsResponse {
  total: number;
  tests: TestInsightItem[];
}

export interface FailureTypeItem {
  failure_type: string;
  count: number;
  affected_tests: number;
  latest_seen_at: string | null;
}

export interface FailureClusterItem {
  cluster_key: string;
  title: string;
  failure_type: string;
  occurrence_count: number;
  affected_tests: number;
  latest_seen_at: string | null;
  top_tests: string[];
  root_cause_hint: string | null;
}

export interface FailuresSummary {
  total_failures: number;
  unique_failure_types: number;
}

export interface FailuresInsightsResponse {
  summary: FailuresSummary;
  failure_types: FailureTypeItem[];
  clusters: FailureClusterItem[];
}

export interface PatchInsightItem {
  patch_id: string;
  original_run_id: string | null;
  rerun_run_id: string | null;
  source_run_id: string | null;
  comparison_status: string | null;
  original_pass_rate: number;
  rerun_pass_rate: number;
  delta_pass_rate: number;
  fixed_tests_count: number;
  regressed_tests_count: number;
  effectiveness_score: number;
  ranking_score: number;
  improvement_type: string | null;
  recommendation_rank: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PatchBestItem {
  patch_id: string | null;
  reason: string | null;
}

export interface PatchesSummary {
  total_patches_compared: number;
  improved_patches: number;
  regressed_patches: number;
  neutral_patches: number;
  best_patch_id: string | null;
}

export interface PatchesInsightsResponse {
  summary: PatchesSummary;
  patches: PatchInsightItem[];
  best_patch: PatchBestItem;
}