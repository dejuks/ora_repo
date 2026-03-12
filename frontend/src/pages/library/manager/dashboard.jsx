import React from 'react';
import LibraryDashboardPage, { formatCurrency } from '../shared/LibraryDashboardPage';
import { outstandingFine } from '../shared/libraryHelpers';

export default function LibraryManagerDashboard() {
  return (
    <LibraryDashboardPage
      title="Library Manager Dashboard"
      subtitle="Review circulation, acquisitions, inventory exceptions, and digital usage."
      statCards={(data) => [
        { title: 'Catalog Materials', value: data.materials.length, icon: 'fas fa-book', color: 'bg-info', to: '/library/reports' },
        { title: 'Active Loans', value: data.loans.filter((row) => ['active', 'overdue'].includes(row.status)).length, icon: 'fas fa-book-reader', color: 'bg-success', to: '/library/loans' },
        { title: 'Pending Acquisitions', value: data.acquisitionRequests.filter((row) => !['closed', 'received'].includes(String(row.status || '').toLowerCase())).length, icon: 'fas fa-shopping-cart', color: 'bg-warning', to: '/library/acquisitions/approvals' },
        { title: 'Outstanding Fines', value: formatCurrency(data.fines.reduce((sum, row) => sum + Math.max(0, outstandingFine(row)), 0)), icon: 'fas fa-money-bill-wave', color: 'bg-danger', to: '/library/fines' },
      ]}
      quickLinks={[
        { label: 'Open reports', to: '/library/reports', icon: 'fas fa-chart-bar' },
        { label: 'Review approvals', to: '/library/acquisitions/approvals', icon: 'fas fa-check-circle', className: 'btn-outline-warning' },
        { label: 'Inventory issues', to: '/library/inventory/damaged', icon: 'fas fa-exclamation-triangle', className: 'btn-outline-danger' },
      ]}
      sections={[
        {
          title: 'Circulation snapshot',
          to: '/library/loans',
          columns: [
            { key: 'copy_id', label: 'Copy' },
            { key: 'member_id', label: 'Member' },
            { key: 'due_date', label: 'Due Date', render: (row) => row.due_date ? new Date(row.due_date).toLocaleDateString() : '' },
            { key: 'status', label: 'Status' },
          ],
          rows: (data) => data.loans.filter((row) => ['active', 'overdue'].includes(row.status)).slice(0, 6),
        },
        {
          title: 'Pending digital work',
          to: '/library/digital/approvals',
          columns: [
            { key: 'title', label: 'Submission' },
            { key: 'status', label: 'Status' },
            { key: 'submitted_at', label: 'Submitted', render: (row) => row.submitted_at ? new Date(row.submitted_at).toLocaleDateString() : '' },
          ],
          rows: (data) => data.digitalSubmissions.filter((row) => ['submitted', 'under_review', 'correction_requested'].includes(String(row.status || '').toLowerCase())).slice(0, 6),
        },
      ]}
    />
  );
}
