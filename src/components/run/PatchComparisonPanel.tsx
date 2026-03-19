import { useState } from "react";
import type {
  PatchComparisonResponse,
  ComparedTestItem,
} from "../../api/patches";

interface PatchComparisonPanelProps {
  comparison: PatchComparisonResponse;
}

type SectionKey =
  | "fixed_failures"
  | "remaining_failures"
  | "new_failures"
  | "still_passing";

type ParsedError = {
  summary: string;
  locator?: string;
  expected?: string;
  received?: string;
  timeout?: string;
  callLog: string[];
};

function getStatusColors(status?: string | null) {
  switch ((status || "").toLowerCase()) {
    case "passed":
      return { background: "#dcfce7", color: "#166534" };
    case "failed":
      return { background: "#fee2e2", color: "#991b1b" };
    case "skipped":
      return { background: "#fef3c7", color: "#92400e" };
    default:
      return { background: "#e2e8f0", color: "#334155" };
  }
}

function stripAnsi(text?: string | null): string {
  if (!text) return "";
  return text.replace(/\u001B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, "");
}

function normalizeError(text?: string | null): string {
  const cleaned = stripAnsi(text).trim();

  if (!cleaned || cleaned.toLowerCase() === "none") {
    return "—";
  }

  return cleaned
    .replace(/Locator:/g, "\nLocator:")
    .replace(/Expected:/g, "\nExpected:")
    .replace(/Received:/g, "\nReceived:")
    .replace(/Timeout:/g, "\nTimeout:")
    .replace(/Call log:/g, "\n\nCall log:\n")
    .replace(/\s+- /g, "\n- ")
    .trim();
}

function parseError(text?: string | null): ParsedError {
  const normalized = normalizeError(text);

  if (normalized === "—") {
    return {
      summary: "—",
      callLog: [],
    };
  }

  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const summaryLines: string[] = [];
  const callLog: string[] = [];

  let locator: string | undefined;
  let expected: string | undefined;
  let received: string | undefined;
  let timeout: string | undefined;
  let inCallLog = false;

  for (const line of lines) {
    if (line === "Call log:") {
      inCallLog = true;
      continue;
    }

    if (inCallLog) {
      callLog.push(line.replace(/^-+\s*/, ""));
      continue;
    }

    if (line.startsWith("Locator:")) {
      locator = line.replace(/^Locator:\s*/, "").trim();
      continue;
    }

    if (line.startsWith("Expected:")) {
      expected = line.replace(/^Expected:\s*/, "").trim();
      continue;
    }

    if (line.startsWith("Received:")) {
      received = line.replace(/^Received:\s*/, "").trim();
      continue;
    }

    if (line.startsWith("Timeout:")) {
      timeout = line.replace(/^Timeout:\s*/, "").trim();
      continue;
    }

    summaryLines.push(line);
  }

  return {
    summary: summaryLines.join("\n").trim() || "—",
    locator,
    expected,
    received,
    timeout,
    callLog,
  };
}

function getCardStyle(item: ComparedTestItem): React.CSSProperties {
  if (item.original_status === "failed" && item.rerun_status === "passed") {
    return {
      border: "1px solid #bbf7d0",
      background: "#f0fdf4",
      borderRadius: 10,
      padding: 16,
    };
  }

  if (item.original_status === "failed" && item.rerun_status === "failed") {
    return {
      border: "1px solid #fde68a",
      background: "#fffbeb",
      borderRadius: 10,
      padding: 16,
    };
  }

  if (item.rerun_status === "failed") {
    return {
      border: "1px solid #fecaca",
      background: "#fef2f2",
      borderRadius: 10,
      padding: 16,
    };
  }

  return {
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    borderRadius: 10,
    padding: 16,
  };
}

function DetailBox({
  label,
  value,
  background,
  border,
  color,
}: {
  label: string;
  value?: string;
  background: string;
  border: string;
  color: string;
}) {
  if (!value) return null;

  return (
    <div
      style={{
        background,
        border,
        borderRadius: 8,
        padding: 12,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <pre
        style={{
          margin: 0,
          whiteSpace: "pre-wrap",
          overflowX: "auto",
          fontSize: 12,
          color,
        }}
      >
        {value}
      </pre>
    </div>
  );
}

function ErrorPanel({
  title,
  errorText,
}: {
  title: string;
  errorText?: string | null;
}) {
  const parsed = parseError(errorText);

  return (
    <div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#64748b",
          marginBottom: 6,
        }}
      >
        {title}
      </div>

      <div
        style={{
          background: "#f8fafc",
          padding: 12,
          borderRadius: 8,
        }}
      >
        <pre
          style={{
            margin: 0,
            fontSize: 12,
            whiteSpace: "pre-wrap",
            overflowX: "auto",
          }}
        >
          {parsed.summary}
        </pre>

        {(parsed.expected || parsed.received) && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginTop: 12,
            }}
          >
            <DetailBox
              label="Expected"
              value={parsed.expected}
              background="#f0fdf4"
              border="1px solid #bbf7d0"
              color="#166534"
            />
            <DetailBox
              label="Received"
              value={parsed.received}
              background="#fef2f2"
              border="1px solid #fecaca"
              color="#991b1b"
            />
          </div>
        )}

        {(parsed.locator || parsed.timeout) && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginTop: 12,
            }}
          >
            <DetailBox
              label="Locator"
              value={parsed.locator}
              background="#ffffff"
              border="1px solid #e2e8f0"
              color="#334155"
            />
            <DetailBox
              label="Timeout"
              value={parsed.timeout}
              background="#ffffff"
              border="1px solid #e2e8f0"
              color="#334155"
            />
          </div>
        )}

        {parsed.callLog.length > 0 && (
          <div
            style={{
              marginTop: 12,
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: 12,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "#64748b",
                marginBottom: 8,
              }}
            >
              Call log
            </div>

            <ul
              style={{
                margin: 0,
                paddingLeft: 18,
                fontSize: 12,
                color: "#334155",
              }}
            >
              {parsed.callLog.map((line, idx) => (
                <li key={idx} style={{ marginBottom: 4, wordBreak: "break-word" }}>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function ScreenshotPreview({
  label,
  url,
}: {
  label: string;
  url?: string | null;
}) {
  if (!url) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#64748b",
        }}
      >
        {label}
      </div>

      <a href={url} target="_blank" rel="noreferrer" style={{ width: "fit-content" }}>
        <img
          src={url}
          alt={label}
          style={{
            width: 220,
            maxWidth: "100%",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            display: "block",
          }}
        />
      </a>

      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        style={{ color: "#2563eb", textDecoration: "none", fontSize: 12 }}
      >
        Open full image
      </a>
    </div>
  );
}

function ComparisonList({
  title,
  items,
}: {
  title: string;
  items: ComparedTestItem[];
}) {
  if (!items.length) {
    return (
      <div
        style={{
          border: "1px solid #e2e8f0",
          background: "#fff",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <h4 style={{ margin: 0, fontWeight: 600 }}>{title}</h4>
        <p style={{ marginTop: 8, color: "#64748b" }}>No items.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        background: "#fff",
        borderRadius: 12,
        padding: 16,
      }}
    >
      <h4 style={{ marginTop: 0, marginBottom: 16, fontWeight: 600 }}>
        {title} ({items.length})
      </h4>

      <div style={{ display: "grid", gap: 16 }}>
        {items.map((item, index) => {
          const originalColors = getStatusColors(item.original_status);
          const rerunColors = getStatusColors(item.rerun_status);

          return (
            <div
              key={item.test_key ?? `${item.suite ?? "unknown"}-${index}`}
              style={getCardStyle(item)}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>
                    {item.title || "Untitled test"}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      marginTop: 4,
                      wordBreak: "break-all",
                    }}
                  >
                    {item.suite || "Unknown suite"}
                  </div>
                </div>

                <div style={{ fontSize: 12 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      color: "#64748b",
                      marginBottom: 6,
                    }}
                  >
                    Status
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: "fit-content",
                        padding: "4px 8px",
                        borderRadius: 999,
                        background: originalColors.background,
                        color: originalColors.color,
                      }}
                    >
                      Original: {item.original_status || "-"}
                    </span>

                    <span
                      style={{
                        display: "inline-block",
                        width: "fit-content",
                        padding: "4px 8px",
                        borderRadius: 999,
                        background: rerunColors.background,
                        color: rerunColors.color,
                      }}
                    >
                      Rerun: {item.rerun_status || "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginTop: 16,
                }}
              >
                <ErrorPanel
                  title="Original error"
                  errorText={item.original_error_message}
                />
                <ErrorPanel
                  title="Rerun error"
                  errorText={item.rerun_error_message}
                />
              </div>

              {(item.original_screenshot_url || item.rerun_screenshot_url) && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginTop: 16,
                  }}
                >
                  <ScreenshotPreview
                    label="Original screenshot"
                    url={item.original_screenshot_url}
                  />
                  <ScreenshotPreview
                    label="Rerun screenshot"
                    url={item.rerun_screenshot_url}
                  />
                </div>
              )}

              <div
                style={{
                  marginTop: 12,
                  fontSize: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {item.original_screenshot_url && (
                  <a
                    href={item.original_screenshot_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#2563eb", textDecoration: "none" }}
                  >
                    Original screenshot
                  </a>
                )}

                {item.original_trace_url && (
                  <a
                    href={item.original_trace_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#2563eb", textDecoration: "none" }}
                  >
                    Original trace
                  </a>
                )}

                {item.rerun_screenshot_url && (
                  <a
                    href={item.rerun_screenshot_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#2563eb", textDecoration: "none" }}
                  >
                    Rerun screenshot
                  </a>
                )}

                {item.rerun_trace_url && (
                  <a
                    href={item.rerun_trace_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#2563eb", textDecoration: "none" }}
                  >
                    Rerun trace
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PatchComparisonPanel({
  comparison,
}: PatchComparisonPanelProps) {
  const [active, setActive] = useState<SectionKey>("fixed_failures");

  const sectionMap: Record<SectionKey, ComparedTestItem[]> = {
    fixed_failures: comparison.fixed_failures ?? [],
    remaining_failures: comparison.remaining_failures ?? [],
    new_failures: comparison.new_failures ?? [],
    still_passing: comparison.still_passing ?? [],
  };

  const labels: Record<SectionKey, string> = {
    fixed_failures: "Fixed",
    remaining_failures: "Remaining",
    new_failures: "New Failures",
    still_passing: "Still Passing",
  };

  return (
    <div
      style={{
        padding: 24,
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        background: "#f8fafc",
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 22 }}>
        Patch Comparison
      </h3>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        {(Object.keys(labels) as SectionKey[]).map((k) => (
          <button
            key={k}
            onClick={() => setActive(k)}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              background: active === k ? "#0f172a" : "#ffffff",
              color: active === k ? "#ffffff" : "#111827",
              cursor: "pointer",
            }}
          >
            {labels[k]} ({sectionMap[k].length})
          </button>
        ))}
      </div>

      <ComparisonList title={labels[active]} items={sectionMap[active]} />
    </div>
  );
}