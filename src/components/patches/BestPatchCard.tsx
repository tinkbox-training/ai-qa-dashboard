import type { PatchHistoryItem } from "../../types/patches";
import { PatchStatusBadge } from "./PatchStatusBadge";

interface BestPatchCardProps {
  patch?: PatchHistoryItem | null;
}

function formatScore(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return value.toFixed(2);
}

export function BestPatchCard({ patch }: BestPatchCardProps) {
  if (!patch) return null;

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Best patch so far
          </div>
          <h3 className="mt-1 text-base font-semibold text-emerald-950">
            {patch.patch_title || patch.patch_id}
          </h3>
        </div>

        <PatchStatusBadge status={patch.status} />
      </div>

      {patch.patch_summary ? (
        <p className="mb-4 text-sm text-emerald-900">{patch.patch_summary}</p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniMetric
          label="Pass rate delta"
          value={
            typeof patch.comparison?.pass_rate_delta === "number"
              ? `${patch.comparison.pass_rate_delta > 0 ? "+" : ""}${patch.comparison.pass_rate_delta.toFixed(
                  1
                )}%`
              : "—"
          }
        />
        <MiniMetric
          label="Improved"
          value={patch.comparison?.improved_failures ?? "—"}
        />
        <MiniMetric
          label="Regressions"
          value={patch.comparison?.regressions ?? "—"}
        />
        <MiniMetric
          label="Confidence"
          value={formatScore(patch.confidence_score)}
        />
      </div>
    </div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg bg-white p-3 ring-1 ring-emerald-200">
      <div className="text-xs uppercase tracking-wide text-emerald-700">{label}</div>
      <div className="mt-1 text-base font-semibold text-emerald-950">{value}</div>
    </div>
  );
}