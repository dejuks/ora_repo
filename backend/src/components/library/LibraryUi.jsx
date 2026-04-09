import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layout/MainLayout.jsx';

export function PageShell({ title, subtitle, actions, children }) {
  return (
    <MainLayout>
      <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>{title}</h1>
          {subtitle ? <p style={{ margin: '8px 0 0', color: '#555' }}>{subtitle}</p> : null}
        </div>
        {actions ? <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{actions}</div> : null}
      </div>
      {children}
      </div>
    </MainLayout>
  );
}

export function CardGrid({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>{children}</div>;
}

export function StatCard({ label, value, hint }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}>
      <div style={{ color: '#6b7280', fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>{value}</div>
      {hint ? <div style={{ color: '#6b7280', fontSize: 12, marginTop: 8 }}>{hint}</div> : null}
    </div>
  );
}

export function SectionCard({ title, children, extra }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff', marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>{title}</h2>
        {extra}
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}

export function Toolbar({ children }) {
  return <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>{children}</div>;
}

export function Input(props) {
  return <input {...props} style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, minWidth: props.style?.minWidth || 0, ...props.style }} />;
}

export function Select(props) {
  return <select {...props} style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, minWidth: props.style?.minWidth || 0, ...props.style }} />;
}

export function Button({ children, variant = 'primary', ...props }) {
  const palette = variant === 'secondary'
    ? { background: '#fff', color: '#111827', border: '1px solid #d1d5db' }
    : variant === 'danger'
    ? { background: '#dc2626', color: '#fff', border: '1px solid #dc2626' }
    : { background: '#2563eb', color: '#fff', border: '1px solid #2563eb' };
  return (
    <button
      {...props}
      style={{ padding: '10px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, ...palette, ...(props.style || {}) }}
    >
      {children}
    </button>
  );
}

export function StatusBadge({ status }) {
  const value = String(status || 'unknown').toLowerCase();
  const backgrounds = {
    available: '#dcfce7',
    borrowed: '#dbeafe',
    overdue: '#fee2e2',
    returned: '#e5e7eb',
    queued: '#fef3c7',
    partial: '#fde68a',
    unpaid: '#fee2e2',
    paid: '#dcfce7',
    ready_for_pickup: '#dbeafe',
    cancelled: '#f3f4f6',
  };
  return (
    <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 999, background: backgrounds[value] || '#eef2ff', fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
      {value.replaceAll('_', ' ')}
    </span>
  );
}

export function SimpleTable({ columns, rows, emptyText = 'No records found.' }) {
  return rows?.length ? (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ textAlign: 'left', padding: '10px 8px', borderBottom: '1px solid #e5e7eb', fontSize: 13, color: '#6b7280' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id || row.loan_id || row.hold_id || row.fine_id || row.material_id || idx}>
              {columns.map((col) => (
                <td key={col.key} style={{ padding: '12px 8px', borderBottom: '1px solid #f3f4f6', verticalAlign: 'top' }}>
                  {col.render ? col.render(row) : row[col.key] ?? '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <div style={{ color: '#6b7280' }}>{emptyText}</div>
  );
}

export function QuickLinks({ links }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
      {links.map((item) => (
        <Link key={item.to} to={item.to} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 14, textDecoration: 'none', color: '#111827', background: '#fff' }}>
          <div style={{ fontWeight: 700 }}>{item.label}</div>
          {item.description ? <div style={{ color: '#6b7280', marginTop: 6, fontSize: 13 }}>{item.description}</div> : null}
        </Link>
      ))}
    </div>
  );
}

export function InfoList({ items }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
      {items.map((item) => (
        <div key={item.label} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 12, background: '#fff' }}>
          <div style={{ color: '#6b7280', fontSize: 12 }}>{item.label}</div>
          <div style={{ fontWeight: 600, marginTop: 6 }}>{item.value ?? '-'}</div>
        </div>
      ))}
    </div>
  );
}

export function Message({ kind = 'info', children }) {
  const bg = kind === 'error' ? '#fee2e2' : kind === 'success' ? '#dcfce7' : '#eff6ff';
  return <div style={{ background: bg, borderRadius: 10, padding: 12, marginBottom: 16 }}>{children}</div>;
}
