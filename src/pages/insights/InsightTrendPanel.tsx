import { SectionCard } from "../../components/common/SectionCard";
import type { DailyTrendPoint } from "../../types/insights";

interface InsightTrendPanelProps {
  daily: DailyTrendPoint[];
}

function formatShortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

export function InsightTrendPanel({ daily }: InsightTrendPanelProps) {
  return (
    <SectionCard title="Failure Trends">
      {daily.length === 0 ? (
        <div style={{ color: "#6b7280" }}>No trend data available.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: "10px 8px" }}>Date</th>
                <th style={{ padding: "10px 8px" }}>Failures</th>
                <th style={{ padding: "10px 8px" }}>Passes</th>
                <th style={{ padding: "10px 8px" }}>Unique Failed Tests</th>
              </tr>
            </thead>
            <tbody>
              {daily.map((item) => (
                <tr key={item.date} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "10px 8px" }}>{formatShortDate(item.date)}</td>
                  <td style={{ padding: "10px 8px" }}>{item.failures}</td>
                  <td style={{ padding: "10px 8px" }}>{item.passes}</td>
                  <td style={{ padding: "10px 8px" }}>{item.unique_failed_tests}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}