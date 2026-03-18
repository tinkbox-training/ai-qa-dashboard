export function Topbar() {
  return (
    <header
      style={{
        height: '64px',
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}
    >
      <div style={{ fontWeight: 700 }}>AI QA Automation Platform</div>
      <div style={{ color: '#64748b' }}>Frontend MVP</div>
    </header>
  );
}