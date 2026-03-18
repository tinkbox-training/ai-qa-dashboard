import { Link } from "react-router-dom";
import { SectionCard } from "../../components/common/SectionCard";
import { StatusBadge } from "../../components/common/StatusBadge";
import { formatDateTime } from "../../lib/format";
import type { RunSummary } from "../../api/types";

interface ActiveRunsPanelProps {
  runs: RunSummary[];
}

export function ActiveRunsPanel({ runs }: ActiveRunsPanelProps) {
  return (
    <SectionCard title="Active Runs">
      {runs.length === 0 ? (
        <div>No active runs</div>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {runs.map((run) => (
            <div
              key={run.run_id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <Link to={`/runs/${run.run_id}`}>{run.run_id}</Link>
                <StatusBadge status={run.status} />
              </div>
              <div style={{ color: "#64748b", fontSize: "14px" }}>
                {formatDateTime(run.timestamp)}
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}