import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '28px' }}>{title}</h1>
        {subtitle ? <p style={{ margin: '6px 0 0', color: '#64748b' }}>{subtitle}</p> : null}
      </div>
      {actions}
    </div>
  );
}