import type { RunStatus } from '../../api/types';

interface StatusBadgeProps {
  status?: string;
}

const statusMap: Record<string, { background: string; color: string; label: string }> = {
  queued: { background: '#e2e8f0', color: '#334155', label: 'queued' },
  running: { background: '#dbeafe', color: '#1d4ed8', label: 'running' },
  completed: { background: '#dcfce7', color: '#166534', label: 'completed' },
  failed: { background: '#fee2e2', color: '#b91c1c', label: 'failed' },
  unknown: { background: '#f1f5f9', color: '#475569', label: 'unknown' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status?.toLowerCase?.() ?? 'unknown';
  const style = statusMap[normalizedStatus] ?? statusMap.unknown;

  return (
    <span
      style={{
        background: style.background,
        color: style.color,
        padding: '4px 10px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: 700,
        textTransform: 'capitalize',
      }}
    >
      {style.label}
    </span>
  );
}