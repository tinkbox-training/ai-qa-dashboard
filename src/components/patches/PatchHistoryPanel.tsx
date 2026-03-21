import type { PatchHistoryItem } from "../../api/patches";
import { PatchStatusBadge } from "./PatchStatusBadge";

interface PatchHistoryPanelProps {
  items: PatchHistoryItem[];
  isLoading?: boolean;
  selectedPatchId?: string | null;
  onSelectPatch?: (item: PatchHistoryItem) => void;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function PatchHistoryPanel({
  items,
  isLoading = false,
  selectedPatchId,
  onSelectPatch,
}: PatchHistoryPanelProps) {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        background: "#ffffff",
        padding: "16px",
      }}
    >
      <div style={{ marginBottom: "16px" }}>
        <div
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#0f172a",
            marginBottom: "6px",
          }}
        >
          Patch history
        </div>
        <div
          style={{
            fontSize: "14px",
            color: "#475569",
          }}
        >
          Previous patch attempts, reruns, and comparison outcomes.
        </div>
      </div>

      {isLoading ? (
        <div style={{ color: "#64748b", fontSize: "14px" }}>
          Loading patch history...
        </div>
      ) : items.length === 0 ? (
        <div style={{ color: "#64748b", fontSize: "14px" }}>
          No patch history available yet.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          {items.map((item) => {
            const isSelected = selectedPatchId === item.patch_id;

            return (
              <button
                key={`${item.patch_id}-${item.rerun_run_id ?? "no-rerun"}`}
                type="button"
                onClick={() => onSelectPatch?.(item)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  border: isSelected
                    ? "1px solid #93c5fd"
                    : "1px solid #e2e8f0",
                  background: isSelected ? "#eff6ff" : "#ffffff",
                  borderRadius: "12px",
                  padding: "14px",
                  cursor: "pointer",
                  display: "block",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "12px",
                    marginBottom: "10px",
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#0f172a",
                        wordBreak: "break-word",
                        marginBottom: item.patch_summary ? "4px" : 0,
                      }}
                    >
                      {item.patch_title ?? item.patch_id}
                    </div>

                    {item.patch_summary ? (
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#475569",
                          lineHeight: 1.45,
                          wordBreak: "break-word",
                        }}
                      >
                        {item.patch_summary}
                      </div>
                    ) : null}
                  </div>

                  <div style={{ flexShrink: 0 }}>
                    <PatchStatusBadge status={item.status} />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px 14px",
                    fontSize: "13px",
                  }}
                >
                  <Field label="Created" value={formatDate(item.created_at)} />
                  <Field label="Applied" value={formatDate(item.applied_at)} />
                  <Field label="Rerun" value={item.rerun_run_id ?? "—"} />
                  <Field
                    label="Pass rate delta"
                    value={
                      typeof item.comparison?.pass_rate_delta === "number"
                        ? `${item.comparison.pass_rate_delta > 0 ? "+" : ""}${item.comparison.pass_rate_delta.toFixed(
                            1,
                          )}%`
                        : "—"
                    }
                  />
                  <Field
                    label="Verdict"
                    value={item.comparison?.verdict ?? "—"}
                  />
                  <Field label="Status" value={item.status ?? "—"} />
                </div>

                {item.partial_rerun ? (
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #fde68a",
                      background: "#fffbeb",
                      color: "#92400e",
                      fontSize: "13px",
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                      Partial rerun
                    </div>
                    {Array.isArray(item.rerun_scope) && item.rerun_scope.length > 0 ? (
                      <div>{item.rerun_scope.join(", ")}</div>
                    ) : (
                      <div>This rerun covered only part of the original scope.</div>
                    )}
                  </div>
                ) : null}

                {item.error_message ? (
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #fecaca",
                      background: "#fef2f2",
                      color: "#b91c1c",
                      fontSize: "13px",
                      wordBreak: "break-word",
                    }}
                  >
                    {item.error_message}
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: "11px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: "#64748b",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "13px",
          color: "#0f172a",
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}