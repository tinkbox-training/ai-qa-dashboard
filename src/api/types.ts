export type RunStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface ExecutionSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  pass_rate: number;
}

export interface RunSummary {
  run_id: string;
  timestamp: string;
  status: RunStatus;
  failed_count: number;
  passed_count: number;
  execution_summary: ExecutionSummary;
  requirements: string[];
  executed_files: string[];
}

export interface RunsResponse {
  total_runs: number;
  runs: RunSummary[];
}

export interface RunStatusResponse {
  run_id: string;
  status: RunStatus;
  created_at?: string;
  started_at?: string;
  completed_at?: string;
}

export interface FailedTestAttachment {
  name?: string;
  contentType?: string;
  path?: string;
}

export interface FailedTestDetail {
  title?: string;
  suite?: string;
  status?: string;
  duration_ms?: number;
  error?: string;
  stack?: string;
  attachments?: FailedTestAttachment[];
}

export interface AiFailureExplanation {
  run_id?: string;
  suite?: string;
  title?: string;
  status?: string;
  duration_ms?: number;
  failure_type?: string;
  what_happened?: string;
  most_likely_causes?: string[];
  evidence_to_check_in_artifacts?: string[];
  recommended_next_action?: string;
  specific_fixes?: Array<{
    fix?: string;
    how?: string[];
  }>;
}

export interface FailureClusterItem {
  failure_type?: string;
  count?: number;
  tests?: Array<{
    title?: string;
    suite?: string;
    status?: string;
  }>;
  sample_errors?: string[];
}

export interface FailureClusters {
  total_clusters?: number;
  clusters?: FailureClusterItem[];
}

export interface ArtifactsPayload {
  run_dir?: string;
  screenshots?: string[];
  traces?: string[];
  all_files?: string[];
}

export interface RunDetails {
  run_id: string;
  status: string;
  created_at?: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string | null;
  job_id?: string | null;
  trigger_source?: string | null;
  total_tests?: number;
  passed_tests?: number;
  failed_tests?: number;
  details_available?: boolean;
  execution_summary?: ExecutionSummary;
  requirements?: string[];
  generated_tests?: Array<{
    requirement?: string;
    status?: string;
    flow?: string;
    file?: string;
  }>;
  executed_files?: string[];
  requirement_to_file?: Record<string, string>;
  execution_results?: Array<{
    suite?: string;
    title?: string;
    status?: string;
    duration_ms?: number;
    error?: string;
  }>;
  artifacts?: ArtifactsPayload;
  failed_test_details?: FailedTestDetail[];
  ai_failure_explanations?: AiFailureExplanation[];
  failure_clusters?: FailureClusters;
  timestamp?: string;
  run_meta?: Record<string, unknown>;
}