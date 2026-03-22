
import { useEffect } from "react";
import { stripAnsi } from "../../lib/format";
import type { FailureClusterItem } from "../../api/types";

interface Props {
  open: boolean;
  cluster?: FailureClusterItem | null;
  onClose: () => void;
}

export function FailureClusterModal({ open, cluster, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !cluster) return null;

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", display: "grid", placeItems: "center", zIndex: 60, padding: 24 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", width: "min(800px, 100%)", maxHeight: "85vh", overflow: "auto", borderRadius: 16, padding: 20, display: "grid", gap: 12 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{cluster.failure_type ?? "Failure cluster"}</div>
            <div style={{ color: "#64748b" }}>Affected tests: {cluster.count ?? 0}</div>
          </div>
          <button type="button" onClick={onClose} style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "6px 10px", background: "#fff" }}>Close</button>
        </div>

        {Array.isArray(cluster.tests) && cluster.tests.length > 0 ? (
          <div>
            <strong>Tests</strong>
            <ul>
              {cluster.tests.map((test, idx) => (
                <li key={`${test.title ?? "test"}-${idx}`}>{test.title ?? "-"} | {test.suite ?? "-"} | {test.status ?? "-"}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {Array.isArray(cluster.sample_errors) && cluster.sample_errors.length > 0 ? (
          <div>
            <strong>Sample errors</strong>
            <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
              {cluster.sample_errors.map((error, idx) => (
                <pre key={idx} style={{ whiteSpace: "pre-wrap", background: "#0f172a", color: "#e2e8f0", padding: 12, borderRadius: 8 }}>{stripAnsi(error)}</pre>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
