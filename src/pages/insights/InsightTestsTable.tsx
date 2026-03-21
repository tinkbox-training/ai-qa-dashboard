import { SectionCard } from "../../components/common/SectionCard";
import { StatusBadge } from "../../components/common/StatusBadge";
import type { TestInsightItem } from "../../types/insights";

interface InsightTestsTableProps {
  tests: TestInsightItem[];
}

function toPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function InsightTestsTable({ tests }: InsightTestsTableProps) {
  return (
    <SectionCard title="Test Stability Insights">
      {tests.length === 0 ? (
        <div style={{ color: "#6b7280" }}>No test insight data available.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: "10px 8px" }}>Test</th>
                <th style={{ padding: "10px 8px" }}>Classification</th>
                <th style={{ padding: "10px 8px" }}>Pass Rate</th>
                <th style={{ padding: "10px 8px" }}>Fail Rate</th>
                <th style={{ padding: "10px 8px" }}>Flaky Score</th>
                <th style={{ padding: "10px 8px" }}>CI Impact</th>
                <th style={{ padding: "10px 8px" }}>Priority</th>
                <th style={{ padding: "10px 8px" }}>Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((item) => (
                <tr key={item.test_key} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "10px 8px", minWidth: 280 }}>
                    {item.test_key}
                  </td>
                  <td style={{ padding: "10px 8px" }}>
                    <StatusBadge status={item.classification} />
                  </td>
                  <td style={{ padding: "10px 8px" }}>{toPercent(item.pass_rate)}</td>
                  <td style={{ padding: "10px 8px" }}>{toPercent(item.fail_rate)}</td>
                  <td style={{ padding: "10px 8px" }}>{item.flaky_score}</td>
                  <td style={{ padding: "10px 8px" }}>{item.ci_impact_score}</td>
                  <td style={{ padding: "10px 8px" }}>
                    <StatusBadge status={item.impact_priority} />
                  </td>
                  <td style={{ padding: "10px 8px" }}>{item.last_seen_at ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}