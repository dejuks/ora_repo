import React from 'react';
import LibraryDashboardPage from '../shared/LibraryDashboardPage.jsx';

export default function LibraryAdminDashboard() {
  return (
    <LibraryDashboardPage
      title="Library Admin Dashboard"
      subtitle="Manage users, roles, system settings, and library audit activity."
      statCards={(data) => [
        { title: 'Library Members', value: data.users.length, icon: 'fas fa-users', color: 'bg-info', to: '/library/users' },
        { title: 'Audit Logs', value: data.auditLogs.length, icon: 'fas fa-file-alt', color: 'bg-primary', to: '/library/audit-logs' },
        { title: 'Digital Approvals', value: data.digitalSubmissions.filter((row) => ['submitted', 'under_review'].includes(String(row.status || '').toLowerCase())).length, icon: 'fas fa-check-circle', color: 'bg-warning', to: '/library/digital/approvals' },
        { title: 'Catalog Records', value: data.materials.length, icon: 'fas fa-book', color: 'bg-success', to: '/library/books/all' },
      ]}
      quickLinks={[
        { label: 'Manage users', to: '/library/users', icon: 'fas fa-users-cog' },
        { label: 'Audit logs', to: '/library/audit-logs', icon: 'fas fa-file-alt', className: 'btn-outline-secondary' },
        { label: 'Settings', to: '/library/settings', icon: 'fas fa-cogs', className: 'btn-outline-primary' },
      ]}
      sections={[
        {
          title: 'Recent audit log entries',
          to: '/library/audit-logs',
          columns: [
            { key: 'action', label: 'Action' },
            { key: 'entity_type', label: 'Entity' },
            { key: 'actor_user_id', label: 'Actor' },
            { key: 'created_at', label: 'When', render: (row) => row.created_at ? new Date(row.created_at).toLocaleString() : '' },
          ],
          rows: (data) => data.auditLogs.slice(0, 8),
        },
        {
          title: 'Open operational queues',
          columns: [
            { key: 'name', label: 'Queue' },
            { key: 'count', label: 'Count' },
          ],
          rows: (data) => [
            { name: 'Active loans', count: data.loans.filter((row) => ['active', 'overdue'].includes(row.status)).length },
            { name: 'Pending holds', count: data.holds.filter((row) => ['queued', 'ready_for_pickup'].includes(row.status)).length },
            { name: 'Pending digital submissions', count: data.digitalSubmissions.filter((row) => ['submitted', 'under_review', 'correction_requested'].includes(String(row.status || '').toLowerCase())).length },
            { name: 'Inventory exceptions', count: data.damageReports.length + data.lostReports.length },
          ],
        },
      ]}
    />
  );
}
