interface StatusBadgeProps {
  status?: string;
}

const statusMap: Record<
  string,
  { background: string; color: string; label: string }
> = {
  // existing
  queued: { background: '#e2e8f0', color: '#334155', label: 'Queued' },
  running: { background: '#dbeafe', color: '#1d4ed8', label: 'Running' },
  completed: { background: '#dcfce7', color: '#166534', label: 'Completed' },
  failed: { background: '#fee2e2', color: '#b91c1c', label: 'Failed' },

  // NEW: patch statuses
  improved: { background: '#dcfce7', color: '#166534', label: 'Improved' },
  regressed: { background: '#fee2e2', color: '#b91c1c', label: 'Regressed' },

  // NEW: test classifications
  stable: { background: '#dcfce7', color: '#166534', label: 'Stable' },
  flaky: { background: '#fef3c7', color: '#92400e', label: 'Flaky' },
  unstable: { background: '#fee2e2', color: '#b91c1c', label: 'Unstable' },
  critical: { background: '#fee2e2', color: '#7f1d1d', label: 'Critical' },

  // NEW: impact priority
  high: { background: '#fee2e2', color: '#b91c1c', label: 'High' },
  medium: { background: '#fef3c7', color: '#92400e', label: 'Medium' },
  low: { background: '#e2e8f0', color: '#334155', label: 'Low' },

  // fallback
  unknown: { background: '#f1f5f9', color: '#475569', label: 'Unknown' },
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
      }}
    >
      {style.label}
    </span>
  );
}