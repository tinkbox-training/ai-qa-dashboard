import { NavLink } from 'react-router-dom';

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  display: 'block',
  padding: '10px 12px',
  borderRadius: '8px',
  textDecoration: 'none',
  color: isActive ? '#111827' : '#475569',
  background: isActive ? '#e2e8f0' : 'transparent',
  fontWeight: 600,
});

export function Sidebar() {
  return (
    <aside style={{ borderRight: '1px solid #e2e8f0', padding: '20px', background: '#fff' }}>
      <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>AI QA Dashboard</div>
      <nav style={{ display: 'grid', gap: '8px' }}>
        <NavLink to="/dashboard" style={linkStyle}>
          Dashboard
        </NavLink>
        <NavLink to="/runs" style={linkStyle}>
          Runs
        </NavLink>
        <NavLink to="/insights" style={linkStyle}>
          Insights
        </NavLink>
      </nav>
    </aside>
  );
}