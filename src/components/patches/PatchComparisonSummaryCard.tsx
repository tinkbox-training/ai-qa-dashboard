import type { PatchComparisonSummary } from "../../types/patches";

interface PatchComparisonSummaryCardProps {
  comparison?: PatchComparisonSummary | null;
}

function formatPercent(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return `${value.toFixed(1)}%`;
}

function getVerdictClasses(verdict?: string | null) {
  switch (verdict) {
    case "improved":
      return "bg-green-50 border-green-200 text-green-800";
    case "regressed":
      return "bg-red-50 border-red-200 text-red-800";
    case "same":
      return "bg-slate-50 border-slate-200 text-slate-800";
    default:
      return "bg-gray-50 border-gray-200 text-gray-800";
  }
}

export function PatchComparisonSummaryCard({
  comparison,
}: PatchComparisonSummaryCardProps) {
  if (!comparison) return null;

  const verdict = comparison.verdict ?? "unknown";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Patch comparison summary
          </h3>
          {comparison.summary ? (
            <p className="mt-1 text-sm text-slate-600">{comparison.summary}</p>
          ) : null}
        </div>

        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getVerdictClasses(
            verdict
          )}`}
        >
          {verdict}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label="Pass rate before" value={formatPercent(comparison.pass_rate_before)} />
        <Metric label="Pass rate after" value={formatPercent(comparison.pass_rate_after)} />
        <Metric
          label="Pass rate delta"
          value={
            typeof comparison.pass_rate_delta === "number"
              ? `${comparison.pass_rate_delta > 0 ? "+" : ""}${comparison.pass_rate_delta.toFixed(
                  1
                )}%`
              : "—"
          }
        />
        <Metric
          label="Newly passed"
          value={safeNumber(comparison.newly_passed)}
        />
        <Metric
          label="Improved failures"
          value={safeNumber(comparison.improved_failures)}
        />
        <Metric
          label="Remaining failures"
          value={safeNumber(comparison.remaining_failures)}
        />
        <Metric label="Regressions" value={safeNumber(comparison.regressions)} />
        <Metric
          label="Tests compared"
          value={`${safeNumber(comparison.total_before)} → ${safeNumber(
            comparison.total_after
          )}`}
        />
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function safeNumber(value?: number | null) {
  return typeof value === "number" && Number.isFinite(value) ? value : "—";
}