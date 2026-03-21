interface PartialRerunWarningProps {
  partialRerun?: boolean | null;
  rerunScope?: string[] | null;
  warning?: string | null;
}

export function PartialRerunWarning({
  partialRerun,
  rerunScope,
  warning,
}: PartialRerunWarningProps) {
  if (!partialRerun && !warning) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="mb-1 text-sm font-semibold text-amber-900">
        Partial rerun warning
      </div>

      <p className="text-sm text-amber-800">
        {warning ||
          "This patch rerun only covers a subset of the original test scope, so comparison results may not represent the full run."}
      </p>

      {Array.isArray(rerunScope) && rerunScope.length > 0 ? (
        <div className="mt-3">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
            Rerun scope
          </div>
          <div className="flex flex-wrap gap-2">
            {rerunScope.map((item) => (
              <span
                key={item}
                className="rounded-full bg-white px-2 py-1 text-xs text-amber-900 ring-1 ring-amber-200"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}