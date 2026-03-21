import { SectionCard } from "../../components/common/SectionCard";
import type { FailureTypeItem } from "../../types/insights";

interface InsightProblemAreasPanelProps {
  items: FailureTypeItem[];
}

export function InsightProblemAreasPanel({
  items,
}: InsightProblemAreasPanelProps) {
  return (
    <SectionCard title="Top Problem Areas">
      {items.length === 0 ? (
        <div style={{ color: "#6b7280" }}>No failure patterns found.</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {items.map((item) => (
            <div
              key={item.failure_type}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 12,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                {item.failure_type}
              </div>
              <div style={{ fontSize: 13, color: "#4b5563" }}>
                Count: {item.count}
              </div>
              <div style={{ fontSize: 13, color: "#4b5563" }}>
                Affected Tests: {item.affected_tests}
              </div>
              <div style={{ fontSize: 13, color: "#4b5563" }}>
                Latest Seen: {item.latest_seen_at ?? "—"}
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}