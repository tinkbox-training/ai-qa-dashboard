import api from "./client";
import type {
  FailuresInsightsResponse,
  PatchesInsightsResponse,
  SummaryInsightsResponse,
  TestsInsightsResponse,
} from "../types/insights";

export async function getInsightsSummary(days = 30, limit = 10) {
  const { data } = await api.get<SummaryInsightsResponse>("/api/insights/summary", {
    params: { days, limit },
  });
  return data;
}

export interface GetInsightRunsParams {
  days?: number;
  classification?: string;
  impact_priority?: string;
  search?: string;
  sort_by?: "flaky_score" | "ci_impact_score" | "fail_rate" | "last_seen_at";
}

export async function getInsightRuns(params: GetInsightRunsParams = {}) {
  const { data } = await api.get<TestsInsightsResponse>("/api/insights/runs", {
    params,
  });
  return data;
}

export interface GetInsightFailuresParams {
  days?: number;
  failure_type?: string;
  limit?: number;
}

export async function getInsightFailures(params: GetInsightFailuresParams = {}) {
  const { data } = await api.get<FailuresInsightsResponse>("/api/insights/failures", {
    params,
  });
  return data;
}

export interface GetInsightPatchesParams {
  days?: number;
  limit?: number;
  min_effectiveness_score?: number;
}

export async function getInsightPatches(params: GetInsightPatchesParams = {}) {
  const { data } = await api.get<PatchesInsightsResponse>("/api/insights/patches", {
    params,
  });
  return data;
}