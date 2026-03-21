import { SectionCard } from "../../components/common/SectionCard";
import { StatusBadge } from "../../components/common/StatusBadge";
import type { PatchInsightItem, PatchBestItem } from "../../types/insights";

interface InsightPatchesPanelProps {
  patches: PatchInsightItem[];
  bestPatch: PatchBestItem;
}

function formatPatchPercent(value: number | null | undefined) {
  const safe = Number(value ?? 0);
  return `${Math.round(safe)}%`;
}

function formatScore(value: number | null | undefined) {
  const safe = Number(value ?? 0);
  return Number.isInteger(safe) ? String(safe) : safe.toFixed(2);
}

export function InsightPatchesPanel({
  patches,
  bestPatch,
}: InsightPatchesPanelProps) {
  return (
    <SectionCard title="Patch Effectiveness">
      <div style={{ marginBottom: 12, color: "#4b5563", fontSize: 14 }}>
        <strong>Best patch:</strong> {bestPatch.patch_id ?? "—"}
        {bestPatch.reason ? ` — ${bestPatch.reason}` : ""}
      </div>

      {patches.length === 0 ? (
        <div style={{ color: "#6b7280" }}>No patch insights available.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: "10px 8px" }}>Patch</th>
                <th style={{ padding: "10px 8px" }}>Status</th>
                <th style={{ padding: "10px 8px" }}>Before</th>
                <th style={{ padding: "10px 8px" }}>After</th>
                <th style={{ padding: "10px 8px" }}>Delta</th>
                <th style={{ padding: "10px 8px" }}>Fixed</th>
                <th style={{ padding: "10px 8px" }}>Regressed</th>
                <th style={{ padding: "10px 8px" }}>Effectiveness</th>
              </tr>
            </thead>
            <tbody>
              {patches.slice(0, 10).map((patch) => (
                <tr key={patch.patch_id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "10px 8px", whiteSpace: "nowrap" }}>
                    {patch.patch_id}
                  </td>
                  <td style={{ padding: "10px 8px" }}>
                    <StatusBadge status={patch.comparison_status ?? "unknown"} />
                  </td>
                  <td style={{ padding: "10px 8px" }}>
                    {formatPatchPercent(patch.original_pass_rate)}
                  </td>
                  <td style={{ padding: "10px 8px" }}>
                    {formatPatchPercent(patch.rerun_pass_rate)}
                  </td>
                  <td style={{ padding: "10px 8px" }}>
                    {formatPatchPercent(patch.delta_pass_rate)}
                  </td>
                  <td style={{ padding: "10px 8px" }}>{patch.fixed_tests_count}</td>
                  <td style={{ padding: "10px 8px" }}>{patch.regressed_tests_count}</td>
                  <td style={{ padding: "10px 8px" }}>
                    {formatScore(patch.effectiveness_score)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}