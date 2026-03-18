interface MetricCardProps {
  label: string;
  value: string | number;
}

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '16px',
      }}
    >
      <div style={{ color: '#64748b', fontSize: '14px' }}>{label}</div>
      <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px' }}>{value}</div>
    </div>
  );
}