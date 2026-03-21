import { SectionCard } from "../../components/common/SectionCard";
import type { DailyTrendPoint } from "../../types/insights";

interface InsightTrendPanelProps {
  daily: DailyTrendPoint[];
}

function formatShortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function InsightTrendPanel({ daily }: InsightTrendPanelProps) {
  const maxValue = Math.max(
    1,
    ...daily.flatMap((item) => [item.failures, item.passes, item.unique_failed_tests])
  );

  return (
    <SectionCard title="Failure Trends">
      {daily.length === 0 ? (
        <div style={{ color: "#6b7280" }}>No trend data available.</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {daily.map((item) => (
            <div
              key={item.date}
              style={{
                display: "grid",
                gridTemplateColumns: "90px 1fr",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                {formatShortDate(item.date)}
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <div>
                  <div style={{ fontSize: 12, marginBottom: 4 }}>Failures: {item.failures}</div>
                  <div
                    style={{
                      height: 8,
                      background: "#e5e7eb",
                      borderRadius: 999,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${(item.failures / maxValue) * 100}%`,
                        height: "100%",
                        background: "#ef4444",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 12, marginBottom: 4 }}>Passes: {item.passes}</div>
                  <div
                    style={{
                      height: 8,
                      background: "#e5e7eb",
                      borderRadius: 999,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${(item.passes / maxValue) * 100}%`,
                        height: "100%",
                        background: "#22c55e",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 12, marginBottom: 4 }}>
                    Unique Failed Tests: {item.unique_failed_tests}
                  </div>
                  <div
                    style={{
                      height: 8,
                      background: "#e5e7eb",
                      borderRadius: 999,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${(item.unique_failed_tests / maxValue) * 100}%`,
                        height: "100%",
                        background: "#f59e0b",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}