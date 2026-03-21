import { useMemo } from "react";
import type { PatchCandidate } from "../../types/patches";
import { PatchStatusBadge } from "./PatchStatusBadge";

interface ApplyPatchActionCardProps {
  patches: PatchCandidate[];
  isApplying?: boolean;
  activePatchId?: string | null;
  disabled?: boolean;
  onApplyPatch: (patch: PatchCandidate) => void;
}

function formatConfidence(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return value.toFixed(2);
}

export function ApplyPatchActionCard({
  patches,
  isApplying,
  activePatchId,
  disabled,
  onApplyPatch,
}: ApplyPatchActionCardProps) {
  const orderedPatches = useMemo(() => {
    return [...patches].sort((a, b) => {
      if (a.is_best_patch && !b.is_best_patch) return -1;
      if (!a.is_best_patch && b.is_best_patch) return 1;
      return (b.confidence_score ?? -1) - (a.confidence_score ?? -1);
    });
  }, [patches]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Apply patch and rerun
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Apply an AI-generated patch candidate and trigger a scoped rerun.
        </p>
      </div>

      {orderedPatches.length === 0 ? (
        <div className="text-sm text-slate-500">
          No patch suggestions are available for this run yet.
        </div>
      ) : (
        <div className="space-y-4">
          {orderedPatches.map((patch) => {
            const busy = isApplying && activePatchId === patch.patch_id;

            return (
              <div
                key={patch.patch_id}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-900">
                        {patch.title || patch.patch_id}
                      </h4>
                      {patch.is_best_patch ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                          Best candidate
                        </span>
                      ) : null}
                    </div>

                    {patch.summary ? (
                      <p className="mt-1 text-sm text-slate-600">
                        {patch.summary}
                      </p>
                    ) : null}
                  </div>

                  <PatchStatusBadge status={patch.status} />
                </div>

                <div className="mb-3 grid grid-cols-2 gap-3 text-xs text-slate-600 md:grid-cols-4">
                  <Meta label="Requirement" value={patch.requirement_title || "—"} />
                  <Meta label="File" value={patch.file_path || "—"} />
                  <Meta label="Risk" value={patch.risk_level || "—"} />
                  <Meta label="Confidence" value={formatConfidence(patch.confidence_score)} />
                </div>

                {patch.rationale ? (
                  <div className="mb-3 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">Why this patch:</span>{" "}
                    {patch.rationale}
                  </div>
                ) : null}

                {patch.diff_preview ? (
                  <div className="mb-4 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
                    <pre className="whitespace-pre-wrap">{patch.diff_preview}</pre>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={disabled || !!busy}
                    onClick={() => onApplyPatch(patch)}
                    className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busy ? "Applying patch…" : "Apply patch and rerun"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Meta({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <div className="font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 break-all text-slate-700">{value}</div>
    </div>
  );
}