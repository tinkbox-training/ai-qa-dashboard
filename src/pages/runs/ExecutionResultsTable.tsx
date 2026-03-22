import { SectionCard } from "../../components/common/SectionCard";
import { stripAnsi } from "../../lib/format";

export type ExecutionResultRow = {
  title?: string;
  status?: string;
  duration_ms?: number;
  error?: string | null;
  cleanedError?: string;
  screenshot_url?: string;
  trace_url?: string;
  [key: string]: any;
};

interface Props {
  results: ExecutionResultRow[];
  onSelectFailure: (result: ExecutionResultRow) => void;
  selectedTitle?: string | null;
}

export function ExecutionResultsTable({ results, onSelectFailure, selectedTitle }: Props) {
  const handleOpenFailure = (result: ExecutionResultRow) => {
    const cleanedError =
      result.error && result.error !== "None" ? stripAnsi(result.error) : "";

    onSelectFailure({
      ...result,
      cleanedError,
    });
  };

  return (
    <SectionCard title="Execution Results">
      {results.length === 0 ? (
        <div>No execution results</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  textAlign: "left",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <th style={{ padding: "10px 8px" }}>Test</th>
                <th style={{ padding: "10px 8px" }}>Status</th>
                <th style={{ padding: "10px 8px" }}>Duration</th>
                <th style={{ padding: "10px 8px" }}>Error</th>
                <th style={{ padding: "10px 8px" }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {results.map((result, index) => {
                const cleanedError =
                  result.error && result.error !== "None"
                    ? stripAnsi(result.error)
                    : "";

                const isFailed = result.status === "failed";

                const isActive = selectedTitle != null && selectedTitle === (result.title ?? null);

                return (
                  <tr
                    key={`execution-row-${index}-${result.title ?? "untitled"}`}
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      cursor: isFailed ? "pointer" : "default",
                      background: isActive ? "#eff6ff" : isFailed ? "#fff7f7" : "transparent",
                    }}
                    onClick={() => {
                      if (isFailed) {
                        handleOpenFailure(result);
                      }
                    }}
                  >
                    <td style={{ padding: "10px 8px", verticalAlign: "top" }}>
                      {result.title ?? "Untitled test"}
                    </td>

                    <td style={{ padding: "10px 8px", verticalAlign: "top" }}>
                      <span
                        style={{
                          color:
                            result.status === "passed"
                              ? "green"
                              : result.status === "failed"
                                ? "red"
                                : "#475569",
                          fontWeight: "bold",
                          textTransform: "capitalize",
                        }}
                      >
                        {result.status ?? "-"}
                      </span>
                    </td>

                    <td style={{ padding: "10px 8px", verticalAlign: "top" }}>
                      {typeof result.duration_ms === "number"
                        ? `${(result.duration_ms / 1000).toFixed(2)}s`
                        : "-"}
                    </td>

                    <td
                      style={{
                        padding: "10px 8px",
                        verticalAlign: "top",
                        maxWidth: 420,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={cleanedError || "-"}
                    >
                      {cleanedError || "-"}
                    </td>

                    <td style={{ padding: "10px 8px", verticalAlign: "top" }}>
                      {isFailed ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenFailure(result);
                          }}
                          style={{
                            background: "#fff",
                            color: "#0f172a",
                            border: "1px solid #cbd5e1",
                            borderRadius: "6px",
                            padding: "4px 8px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          Open
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}