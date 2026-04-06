import React from 'react';
import LibraryDashboardPage, { memberDashboardData, formatCurrency } from '../shared/LibraryDashboardPage.jsx';

export default function LibraryMemberDashboard() {
  return (
    <LibraryDashboardPage
      title="Library Member Dashboard"
      subtitle="Search the catalog, manage your loans, holds, fines, and digital resources."
      load={memberDashboardData}
      statCards={(data) => [
        { title: 'Active Loans', value: data.activeLoans.length, icon: 'fas fa-book-reader', color: 'bg-info', to: '/library/my-loans' },
        { title: 'My Holds', value: data.myHolds.length, icon: 'fas fa-bookmark', color: 'bg-warning', to: '/library/my-holds' },
        { title: 'Outstanding Fines', value: formatCurrency(data.outstandingBalance), icon: 'fas fa-money-bill-wave', color: 'bg-danger', to: '/library/my-fines' },
        { title: 'Borrowing History', value: data.history.length, icon: 'fas fa-history', color: 'bg-primary', to: '/library/history' },
      ]}
      quickLinks={[
        { label: 'Browse catalog', to: '/library/books', icon: 'fas fa-search' },
        { label: 'Open digital library', to: '/library/digital', icon: 'fas fa-laptop', className: 'btn-outline-success' },
        { label: 'View account', to: '/library/account', icon: 'fas fa-user-check', className: 'btn-outline-secondary' },
      ]}
      sections={[
        {
          title: 'Loans due soon',
          to: '/library/my-loans',
          columns: [
            { key: 'copy_id', label: 'Copy' },
            { key: 'due_date', label: 'Due Date', render: (row) => row.due_date ? new Date(row.due_date).toLocaleDateString() : '' },
            { key: 'status', label: 'Status' },
          ],
          rows: (data) => [...data.activeLoans].sort((a, b) => new Date(a.due_date || 0) - new Date(b.due_date || 0)).slice(0, 5),
        },
        {
          title: 'Hold queue',
          to: '/library/my-holds',
          columns: [
            { key: 'material_id', label: 'Material' },
            { key: 'queue_position', label: 'Queue' },
            { key: 'status', label: 'Status' },
          ],
          rows: (data) => data.myHolds.slice(0, 5),
        },
      ]}
    />
  );
}
