
import { SectionCard } from "../../components/common/SectionCard";
import type { ExecutionResultRow } from "./ExecutionResultsTable";

interface Props {
  result?: ExecutionResultRow | null;
}

export function TestDetailPanel({ result }: Props) {
  return (
    <SectionCard title="Test Detail Panel">
      {!result ? (
        <div>Select a test from Execution Results to inspect its details.</div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          <div><strong>Title:</strong> {result.title ?? "-"}</div>
          <div><strong>Status:</strong> {result.status ?? "-"}</div>
          <div><strong>Duration:</strong> {typeof result.duration_ms === "number" ? `${(result.duration_ms / 1000).toFixed(2)}s` : "-"}</div>
          {result.error ? (
            <div>
              <strong>Error:</strong>
              <pre style={{ whiteSpace: "pre-wrap", background: "#0f172a", color: "#e2e8f0", padding: 12, borderRadius: 8, overflowX: "auto" }}>{result.cleanedError ?? result.error}</pre>
            </div>
          ) : null}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {result.screenshot_url ? <a href={result.screenshot_url} target="_blank" rel="noreferrer">Open screenshot</a> : null}
            {result.trace_url ? <a href={result.trace_url} target="_blank" rel="noreferrer">Open trace</a> : null}
          </div>
        </div>
      )}
    </SectionCard>
  );
}
