
import api from "./client";
import type { RunsResponse, RunStatusResponse, CreateRunPayload } from "./types";

export interface RunDetailsResponse {
  run_id: string;
  status: string;
  trigger_source?: string | null;
  created_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  details_available?: boolean;
  requirements?: string[];
  executed_files?: string[];
  generated_tests?: any[];
  failed_test_details?: any[];
  ai_failure_explanations?: any[];
  failure_clusters?: any;
  execution_results?: any[];
  artifacts?: any;
  execution_summary?: {
    total?: number;
    passed?: number;
    failed?: number;
    skipped?: number;
    pass_rate?: number;
  };
  total_tests?: number;
  passed_tests?: number;
  failed_tests?: number;
  patch_id?: string | null;
  original_run_id?: string | null;
  source_run_id?: string | null;
  patch_suggestions?: any[];
  run_recommendations?: any;
  run_meta?: {
    base_url?: string | null;
    self_healing?: boolean | null;
    generate_negative_variants?: boolean | null;
    [key: string]: unknown;
  } | null;
  patch?: {
    patch_id?: string | null;
    original_run_id?: string | null;
  } | null;
}

export async function getRuns(): Promise<RunsResponse> {
  const { data } = await api.get<RunsResponse>("/runs");
  return data;
}

export async function getRunStatus(runId: string): Promise<RunStatusResponse> {
  const { data } = await api.get<RunStatusResponse>(`/runs/${runId}/status`);
  return data;
}

export async function getRunDetails(runId: string): Promise<RunDetailsResponse> {
  const { data } = await api.get<RunDetailsResponse>(`/runs/${runId}`);
  return data;
}

export async function createRun(payload: CreateRunPayload): Promise<{
  status: string;
  run_id: string;
  status_url: string;
  message: string;
}> {
  const { data } = await api.post<{
    status: string;
    run_id: string;
    status_url: string;
    message: string;
  }>("/generate-multiple-tests", payload);

  return data;
}

export async function previewNegativeTests(payload: {
  requirements: string[];
}): Promise<{ generated_requirements: string[] }> {
  const { data } = await api.post<{ generated_requirements: string[] }>(
    "/generate-negative-tests-preview",
    payload,
  );
  return data;
}
