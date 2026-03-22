
import { SectionCard } from "../../components/common/SectionCard";
import type { RecommendationResponse } from "../../api/recommendations";

type Props = {
  data?: RecommendationResponse | null;
  onApplyBestPatch?: (patchId: string) => void;
  isApplying?: boolean;
};

function pillColor(priority?: string) {
  switch ((priority || "").toLowerCase()) {
    case "high":
      return { background: "#fee2e2", color: "#b91c1c" };
    case "medium":
      return { background: "#fef3c7", color: "#92400e" };
    default:
      return { background: "#e2e8f0", color: "#334155" };
  }
}

export function RunRecommendationsPanel({ data, onApplyBestPatch, isApplying }: Props) {
  const items = data?.recommendations ?? [];

  return (
    <SectionCard title="Run-Based Recommendations">
      {items.length === 0 ? (
        <div>No recommendations available for this run.</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {items.map((item, index) => {
            const colors = pillColor(item.priority);
            const canApply = item.type === "apply_existing_patch" && !!item.patch_id && typeof onApplyBestPatch === "function";

            return (
              <div
                key={`${item.type}-${item.patch_id ?? index}`}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  padding: 12,
                  display: "grid",
                  gap: 8,
                  background: index === 0 ? "#f8fafc" : "#ffffff",
                }}
              >
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <strong style={{ color: "#0f172a" }}>{item.type.replaceAll("_", " ")}</strong>
                  <span style={{ fontSize: 12, fontWeight: 700, borderRadius: 999, padding: "2px 8px", ...colors }}>
                    {item.priority}
                  </span>
                  <span style={{ fontSize: 12, color: "#64748b" }}>
                    Confidence {(item.confidence * 100).toFixed(0)}%
                  </span>
                  {index === 0 ? <span style={{ fontSize: 12, color: "#2563eb", fontWeight: 700 }}>Preferred</span> : null}
                </div>

                <div style={{ color: "#334155" }}>{item.reason}</div>
                {item.expected_outcome ? <div style={{ fontSize: 13, color: "#64748b" }}>Expected: {item.expected_outcome}</div> : null}
                {item.code_suggestion?.file_path ? (
                  <div style={{ fontSize: 13, color: "#64748b" }}>File: {item.code_suggestion.file_path}</div>
                ) : null}

                {canApply ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => item.patch_id && onApplyBestPatch?.(item.patch_id)}
                      disabled={isApplying}
                      style={{
                        background: "#2563eb",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "8px 12px",
                        cursor: isApplying ? "not-allowed" : "pointer",
                        opacity: isApplying ? 0.7 : 1,
                        fontWeight: 600,
                      }}
                    >
                      {isApplying ? "Applying..." : "Apply recommended patch"}
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
