import React from 'react';
import LibraryDashboardPage, { formatCurrency } from '../shared/LibraryDashboardPage.jsx';
import { outstandingFine } from '../shared/libraryHelpers.js';

export default function LibraryLibrarianDashboard() {
  return (
    <LibraryDashboardPage
      title="Librarian Dashboard"
      subtitle="Manage circulation, active holds, returns, and fine collection."
      statCards={(data) => [
        { title: 'Active Loans', value: data.loans.filter((row) => ['active', 'overdue'].includes(row.status)).length, icon: 'fas fa-book-reader', color: 'bg-info', to: '/library/loans' },
        { title: 'Ready / Queued Holds', value: data.holds.filter((row) => ['queued', 'ready_for_pickup'].includes(row.status)).length, icon: 'fas fa-bookmark', color: 'bg-warning', to: '/library/holds' },
        { title: 'Open Fines', value: data.fines.filter((row) => ['unpaid', 'partial'].includes(row.status)).length, icon: 'fas fa-money-bill-wave', color: 'bg-danger', to: '/library/fines' },
        { title: 'Outstanding Balance', value: formatCurrency(data.fines.reduce((sum, row) => sum + Math.max(0, outstandingFine(row)), 0)), icon: 'fas fa-cash-register', color: 'bg-success', to: '/library/fines' },
      ]}
      quickLinks={[
        { label: 'Issue / return loans', to: '/library/loans', icon: 'fas fa-exchange-alt' },
        { label: 'Manage holds', to: '/library/holds', icon: 'fas fa-bookmark', className: 'btn-outline-warning' },
        { label: 'Review fines', to: '/library/fines', icon: 'fas fa-receipt', className: 'btn-outline-danger' },
      ]}
      sections={[
        {
          title: 'Loans due next',
          to: '/library/loans',
          columns: [
            { key: 'member_id', label: 'Member' },
            { key: 'copy_id', label: 'Copy' },
            { key: 'due_date', label: 'Due Date', render: (row) => row.due_date ? new Date(row.due_date).toLocaleDateString() : '' },
            { key: 'status', label: 'Status' },
          ],
          rows: (data) => data.loans.filter((row) => ['active', 'overdue'].includes(row.status)).sort((a, b) => new Date(a.due_date || 0) - new Date(b.due_date || 0)).slice(0, 6),
        },
        {
          title: 'Pending hold queue',
          to: '/library/holds',
          columns: [
            { key: 'material_id', label: 'Material' },
            { key: 'member_id', label: 'Member' },
            { key: 'queue_position', label: 'Queue' },
            { key: 'status', label: 'Status' },
          ],
          rows: (data) => data.holds.filter((row) => ['queued', 'ready_for_pickup'].includes(row.status)).slice(0, 6),
        },
      ]}
    />
  );
}
