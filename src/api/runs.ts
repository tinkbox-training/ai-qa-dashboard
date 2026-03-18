import { apiClient } from './client';
import type { RunDetails, RunsResponse, RunStatusResponse } from './types';

export function getRuns() {
  return apiClient.get<RunsResponse>('/runs');
}

export function getRunStatus(runId: string) {
  return apiClient.get<RunStatusResponse>(`/runs/${runId}/status`);
}

export function getRunDetails(runId: string) {
  return apiClient.get<RunDetails>(`/runs/${runId}`);
}

export function createRun(payload: { requirements: string[] }) {
  return apiClient.post<{
    status: string;
    run_id: string;
    status_url: string;
    message: string;
  }>('/generate-multiple-tests', payload);
}