export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return <div style={{ color: '#64748b', padding: '12px 0' }}>{label}</div>;
}