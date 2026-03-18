import { formatDateTime } from "../../lib/format";

interface Props {
  status?: string;
  created_at?: string;
  started_at?: string;
  completed_at?: string;
}

function getStatusStyle(status?: string) {
  switch (status) {
    case "queued":
      return { bg: "#fef9c3", color: "#854d0e", label: "Queued" };
    case "running":
      return { bg: "#dbeafe", color: "#1d4ed8", label: "Running..." };
    case "completed":
      return { bg: "#dcfce7", color: "#166534", label: "Completed" };
    case "failed":
      return { bg: "#fee2e2", color: "#991b1b", label: "Failed" };
    default:
      return { bg: "#e2e8f0", color: "#334155", label: "Unknown" };
  }
}

function getDuration(start?: string, end?: string) {
  if (!start || !end) return "-";
  const diff = new Date(end).getTime() - new Date(start).getTime();
  const seconds = Math.floor(diff / 1000);
  return `${seconds}s`;
}

export function RunStatusBanner({
  status,
  created_at,
  started_at,
  completed_at,
}: Props) {
  const style = getStatusStyle(status);

  const isRunning = status === "running";
  const isQueued = status === "queued";

  return (
    <div
      style={{
        background: style.bg,
        color: style.color,
        borderRadius: "10px",
        padding: "14px 16px",
        marginBottom: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontWeight: 600,
      }}
    >
      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <div>
          {style.label}
          {isRunning && (
            <span
              style={{ marginLeft: "8px", animation: "pulse 1.2s infinite" }}
            >
              ⏳
            </span>
          )}
          {isQueued && <span style={{ marginLeft: "8px" }}>🕒</span>}
        </div>

        <div style={{ fontSize: "13px", fontWeight: 400 }}>
          Created: {formatDateTime(created_at)}
        </div>

        <div style={{ fontSize: "13px", fontWeight: 400 }}>
          Started: {formatDateTime(started_at)}
        </div>

        <div style={{ fontSize: "13px", fontWeight: 400 }}>
          Completed: {formatDateTime(completed_at)}
        </div>

        <div style={{ fontSize: "13px", fontWeight: 400 }}>
          Duration: {getDuration(started_at, completed_at)}
        </div>
      </div>

      <div style={{ fontSize: "12px", opacity: 0.7 }}>
        {isRunning || isQueued ? "Live updating..." : "Final"}
      </div>
    </div>
  );
}
