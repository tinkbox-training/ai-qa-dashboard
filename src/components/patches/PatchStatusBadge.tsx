import type { PatchLifecycleStatus } from "../../types/patches";

interface PatchStatusBadgeProps {
  status?: PatchLifecycleStatus | string | null;
}

function getStatusClasses(status?: string | null) {
  switch (status) {
    case "completed":
    case "applied":
      return "bg-green-100 text-green-800 border-green-200";
    case "queued":
      return "bg-slate-100 text-slate-800 border-slate-200";
    case "running":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "failed":
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200";
    case "suggested":
    case "draft":
      return "bg-amber-100 text-amber-800 border-amber-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export function PatchStatusBadge({ status }: PatchStatusBadgeProps) {
  const safeStatus = status ?? "unknown";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
        safeStatus
      )}`}
    >
      {safeStatus}
    </span>
  );
}