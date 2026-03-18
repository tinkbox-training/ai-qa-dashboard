import { SectionCard } from "../../components/common/SectionCard";
import { formatDateTime } from "../../lib/format";

interface RunLifecycleCardProps {
  run_id: string;
  status?: string;
  created_at?: string;
  started_at?: string;
  completed_at?: string;
  trigger_source?: string | null;
  details_available?: boolean;
}

export function RunLifecycleCard({
  run_id,
  status,
  created_at,
  started_at,
  completed_at,
  trigger_source,
  details_available,
}: RunLifecycleCardProps) {
  return (
    <SectionCard title="Lifecycle">
      <div><strong>Run ID:</strong> {run_id}</div>
      <div><strong>Status:</strong> {status ?? "-"}</div>
      <div><strong>Created:</strong> {formatDateTime(created_at)}</div>
      <div><strong>Started:</strong> {formatDateTime(started_at)}</div>
      <div><strong>Completed:</strong> {formatDateTime(completed_at)}</div>
      <div><strong>Trigger Source:</strong> {trigger_source ?? "-"}</div>
      <div><strong>Details Available:</strong> {String(details_available ?? false)}</div>
    </SectionCard>
  );
}