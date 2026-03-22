
import api from "./client";

export interface RecommendationItem {
  type: string;
  confidence: number;
  priority: string;
  reason: string;
  expected_outcome?: string | null;
  patch_id?: string | null;
  code_suggestion?: {
    kind: string;
    file_path?: string | null;
    snippet?: string | null;
    explanation?: string | null;
  } | null;
}

export interface RecommendationResponse {
  entity_type: string;
  entity_id: string;
  preferred_action?: RecommendationItem | null;
  recommendations: RecommendationItem[];
}

export async function getRunRecommendations(runId: string) {
  const { data } = await api.get<RecommendationResponse>(`/api/recommendations/runs/${runId}`);
  return data;
}
