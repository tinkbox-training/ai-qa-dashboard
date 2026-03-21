import { SectionCard } from "../../components/common/SectionCard";
import { StatusBadge } from "../../components/common/StatusBadge";
import type { AIRecommendationItem } from "../../types/insights";

interface InsightRecommendationsPanelProps {
  recommendations: AIRecommendationItem[];
}

export function InsightRecommendationsPanel({
  recommendations,
}: InsightRecommendationsPanelProps) {
  return (
    <SectionCard title="AI Recommendations">
      {recommendations.length === 0 ? (
        <div style={{ color: "#6b7280" }}>No AI recommendations available.</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {recommendations.map((item, index) => (
            <div
              key={`${item.title}-${index}`}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <div style={{ fontWeight: 600 }}>{item.title}</div>
                <StatusBadge status={item.priority} />
              </div>

              <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 6 }}>
                Category: {item.category}
              </div>

              <div style={{ fontSize: 14, marginBottom: 8 }}>{item.reason}</div>

              <div style={{ fontSize: 14, color: "#111827", marginBottom: 8 }}>
                <strong>Suggested action:</strong> {item.suggested_action}
              </div>

              {item.affected_tests.length > 0 && (
                <div style={{ fontSize: 13, color: "#4b5563" }}>
                  <strong>Affected tests:</strong>
                  <div style={{ marginTop: 6, display: "grid", gap: 4 }}>
                    {item.affected_tests.slice(0, 5).map((test) => (
                      <div key={test}>{test}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}