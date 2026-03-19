import React from 'react';
import LibraryDashboardPage from '../shared/LibraryDashboardPage.jsx';

export default function LibraryInventoryManagerDashboard() {
  return (
    <LibraryDashboardPage
      title="Inventory Manager Dashboard"
      subtitle="Track copies, audits, missing materials, damaged materials, and audit health."
      statCards={(data) => [
        { title: 'Tracked Copies', value: data.copies.length, icon: 'fas fa-copy', color: 'bg-info', to: '/library/copies' },
        { title: 'Audits', value: data.audits.length, icon: 'fas fa-clipboard-check', color: 'bg-primary', to: '/library/inventory/audits' },
        { title: 'Missing Items', value: data.lostReports.length, icon: 'fas fa-search-minus', color: 'bg-danger', to: '/library/inventory/missing' },
        { title: 'Damaged Items', value: data.damageReports.length, icon: 'fas fa-exclamation-triangle', color: 'bg-warning', to: '/library/inventory/damaged' },
      ]}
      quickLinks={[
        { label: 'Open audits', to: '/library/inventory/audits', icon: 'fas fa-clipboard-check' },
        { label: 'Inventory report', to: '/library/inventory/report', icon: 'fas fa-chart-pie', className: 'btn-outline-primary' },
        { label: 'Record missing item', to: '/library/inventory/missing', icon: 'fas fa-search-minus', className: 'btn-outline-danger' },
        { label: 'Record damaged item', to: '/library/inventory/damaged', icon: 'fas fa-exclamation-triangle', className: 'btn-outline-warning' },
      ]}
      sections={[
        {
          title: 'Latest audits',
          to: '/library/inventory/audits',
          columns: [
            { key: 'audit_name', label: 'Audit' },
            { key: 'status', label: 'Status' },
            { key: 'started_at', label: 'Started', render: (row) => row.started_at ? new Date(row.started_at).toLocaleDateString() : '' },
          ],
          rows: (data) => data.audits.slice(0, 6),
        },
        {
          title: 'Inventory exceptions',
          to: '/library/inventory/damaged',
          columns: [
            { key: 'copy_id', label: 'Copy' },
            { key: 'reported_at', label: 'Reported', render: (row) => row.reported_at ? new Date(row.reported_at).toLocaleDateString() : '' },
            { key: 'status', label: 'Status' },
          ],
          rows: (data) => [...data.damageReports, ...data.lostReports].slice(0, 6),
        },
      ]}
    />
  );
}
