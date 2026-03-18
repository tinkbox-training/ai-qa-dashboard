import { Link } from "react-router-dom";
import { SectionCard } from "../../components/common/SectionCard";
import { StatusBadge } from "../../components/common/StatusBadge";
import { formatDateTime } from "../../lib/format";
import type { RunSummary } from "../../api/types";

interface RecentRunsTableProps {
  runs: RunSummary[];
}

export function RecentRunsTable({ runs }: RecentRunsTableProps) {
  return (
    <SectionCard title="Recent Runs">
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">Run ID</th>
              <th align="left">Status</th>
              <th align="left">Passed</th>
              <th align="left">Failed</th>
              <th align="left">Time</th>
            </tr>
          </thead>
          <tbody>
            {runs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "16px 0", color: "#64748b" }}>
                  No runs available
                </td>
              </tr>
            ) : (
              runs.map((run) => (
                <tr key={run.run_id} style={{ borderTop: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "10px 0" }}>
                    <Link to={`/runs/${run.run_id}`}>{run.run_id}</Link>
                  </td>
                  <td>
                    <StatusBadge status={run.status} />
                  </td>
                  <td>{run.execution_summary?.passed ?? 0}</td>
                  <td>{run.execution_summary?.failed ?? 0}</td>
                  <td>{formatDateTime(run.timestamp)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}