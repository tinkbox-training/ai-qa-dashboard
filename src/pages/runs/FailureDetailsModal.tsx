import { useEffect } from "react";
import type { ExecutionResultRow } from "./ExecutionResultsTable";

type FailureWhatFailed = {
  assertion?: string;
  expected?: string;
  received?: string;
  timeout_ms?: number;
  locator?: string;
  source_location?: string;
};

type FailureFix = {
  type?: string;
  change?: string;
  example_patch?: unknown;
};

type AiExplanation = {
  title?: string;
  failure_type?: string;
  why_it_failed?: string;
  what_failed?: FailureWhatFailed;
  specific_fixes?: FailureFix[];
  notes_for_qa?: string;
  [key: string]: any;
};

interface FailureDetailsModalProps {
  open: boolean;
  onClose: () => void;
  result: ExecutionResultRow | null;
  explanation?: AiExplanation | null;
}

export function FailureDetailsModal({
  open,
  onClose,
  result,
  explanation,
}: FailureDetailsModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !result) return null;

  const screenshotUrl =
    result.screenshot_url ??
    result.screenshot ??
    result.screenshot_path ??
    null;

  const traceUrl =
    result.trace_url ??
    result.trace ??
    result.trace_path ??
    null;

  const statusColor =
    result.status === "failed"
      ? "red"
      : result.status === "passed"
        ? "green"
        : "#475569";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(1100px, 96vw)",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#ffffff",
          borderRadius: "14px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          padding: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            alignItems: "flex-start",
            marginBottom: "16px",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "20px" }}>
              {result.title ?? "Untitled failed test"}
            </h2>

            <div
              style={{
                marginTop: "6px",
                color: "#475569",
                fontSize: "14px",
              }}
            >
              Status: <strong style={{ color: statusColor }}>{result.status ?? "-"}</strong>
              {" • "}
              Duration:{" "}
              {typeof result.duration_ms === "number"
                ? `${(result.duration_ms / 1000).toFixed(2)}s`
                : "-"}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              border: "1px solid #cbd5e1",
              background: "#fff",
              borderRadius: "8px",
              padding: "8px 12px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(280px, 1fr)",
            gap: "16px",
          }}
        >
          <div style={{ display: "grid", gap: "16px", minWidth: 0 }}>
            <section
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "14px",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: "8px" }}>Full Error</div>

              <pre
                style={{
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  overflowX: "auto",
                  fontFamily: "monospace",
                  fontSize: "13px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "12px",
                }}
              >
                {result.cleanedError || result.error || "No error available"}
              </pre>
            </section>

            <section
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "14px",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: "10px" }}>
                AI Explanation
              </div>

              {!explanation ? (
                <div style={{ color: "#64748b" }}>No AI explanation available</div>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  <div>
                    <strong>Failure Type:</strong> {explanation.failure_type ?? "-"}
                  </div>

                  <div>
                    <strong>Why It Failed:</strong>
                    <div style={{ marginTop: "4px" }}>
                      {explanation.why_it_failed ?? "-"}
                    </div>
                  </div>

                  {explanation.what_failed ? (
                    <div>
                      <strong>What Failed:</strong>

                      <div
                        style={{
                          marginTop: "6px",
                          padding: "10px",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          display: "grid",
                          gap: "6px",
                        }}
                      >
                        <div>
                          <strong>Assertion:</strong> {explanation.what_failed.assertion ?? "-"}
                        </div>
                        <div>
                          <strong>Expected:</strong> {explanation.what_failed.expected ?? "-"}
                        </div>
                        <div>
                          <strong>Received:</strong> {explanation.what_failed.received ?? "-"}
                        </div>
                        <div>
                          <strong>Timeout:</strong> {explanation.what_failed.timeout_ms ?? "-"} ms
                        </div>
                        <div>
                          <strong>Locator:</strong> {explanation.what_failed.locator ?? "-"}
                        </div>
                        <div>
                          <strong>Source:</strong> {explanation.what_failed.source_location ?? "-"}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {Array.isArray(explanation.specific_fixes) &&
                  explanation.specific_fixes.length > 0 ? (
                    <div>
                      <strong>Specific Fixes:</strong>

                      <div
                        style={{
                          display: "grid",
                          gap: "10px",
                          marginTop: "8px",
                        }}
                      >
                        {explanation.specific_fixes.map((fix, idx) => (
                          <div
                            key={idx}
                            style={{
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              padding: "10px",
                            }}
                          >
                            <div>
                              <strong>Type:</strong> {fix.type ?? "-"}
                            </div>

                            <div>
                              <strong>Change:</strong> {fix.change ?? "-"}
                            </div>

                            {fix.example_patch ? (
                              <pre
                                style={{
                                  whiteSpace: "pre-wrap",
                                  overflowX: "auto",
                                  background: "#f8fafc",
                                  border: "1px solid #e2e8f0",
                                  borderRadius: "8px",
                                  padding: "10px",
                                  marginTop: "8px",
                                  fontSize: "12px",
                                }}
                              >
                                {JSON.stringify(fix.example_patch, null, 2)}
                              </pre>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <strong>Notes for QA:</strong> {explanation.notes_for_qa ?? "-"}
                  </div>
                </div>
              )}
            </section>
          </div>

          <div style={{ display: "grid", gap: "16px", minWidth: 0 }}>
            <section
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "14px",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: "10px" }}>
                Screenshot Preview
              </div>

              {screenshotUrl ? (
                <a
                  href={screenshotUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  <img
                    src={screenshotUrl}
                    alt={`${result.title ?? "Failed test"} screenshot`}
                    style={{
                      width: "100%",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      display: "block",
                    }}
                  />
                </a>
              ) : (
                <div style={{ color: "#64748b" }}>No screenshot available</div>
              )}
            </section>

            <section
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "14px",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: "10px" }}>Artifacts</div>

              <div style={{ display: "grid", gap: "8px" }}>
                {traceUrl ? (
                  <a
                    href={traceUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-block",
                      padding: "10px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      textDecoration: "none",
                      color: "#0f172a",
                    }}
                  >
                    Download Trace
                  </a>
                ) : (
                  <div style={{ color: "#64748b" }}>No trace available</div>
                )}

                {screenshotUrl ? (
                  <a
                    href={screenshotUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-block",
                      padding: "10px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      textDecoration: "none",
                      color: "#0f172a",
                    }}
                  >
                    Open Screenshot
                  </a>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}