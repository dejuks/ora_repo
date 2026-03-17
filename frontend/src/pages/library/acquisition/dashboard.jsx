import React from 'react';
import LibraryDashboardPage from '../shared/LibraryDashboardPage.jsx';

export default function LibraryAcquisitionOfficerDashboard() {
  return (
    <LibraryDashboardPage
      title="Acquisition Officer Dashboard"
      subtitle="Manage requests, purchase orders, deliveries, and vendor records."
      statCards={(data) => [
        { title: 'Acquisition Requests', value: data.acquisitionRequests.length, icon: 'fas fa-file-signature', color: 'bg-info', to: '/library/acquisitions/requests' },
        { title: 'Purchase Orders', value: data.purchaseOrders.length, icon: 'fas fa-shopping-basket', color: 'bg-primary', to: '/library/acquisitions/orders' },
        { title: 'Deliveries', value: data.deliveries.length, icon: 'fas fa-truck', color: 'bg-success', to: '/library/acquisitions/deliveries' },
        { title: 'Pending Approval', value: data.acquisitionRequests.filter((row) => String(row.status || '').toLowerCase().includes('pending')).length, icon: 'fas fa-hourglass-half', color: 'bg-warning', to: '/library/acquisitions/approvals' },
      ]}
      quickLinks={[
        { label: 'New request', to: '/library/acquisitions/requests', icon: 'fas fa-plus' },
        { label: 'Purchase orders', to: '/library/acquisitions/orders', icon: 'fas fa-shopping-cart', className: 'btn-outline-primary' },
        { label: 'Vendors', to: '/library/vendors', icon: 'fas fa-store', className: 'btn-outline-secondary' },
      ]}
      sections={[
        {
          title: 'Recent requests',
          to: '/library/acquisitions/requests',
          columns: [
            { key: 'title', label: 'Title' },
            { key: 'status', label: 'Status' },
            { key: 'requested_at', label: 'Requested', render: (row) => row.requested_at ? new Date(row.requested_at).toLocaleDateString() : '' },
          ],
          rows: (data) => data.acquisitionRequests.slice(0, 6),
        },
        {
          title: 'Recent deliveries',
          to: '/library/acquisitions/deliveries',
          columns: [
            { key: 'receipt_number', label: 'Receipt' },
            { key: 'status', label: 'Status' },
            { key: 'received_at', label: 'Received', render: (row) => row.received_at ? new Date(row.received_at).toLocaleDateString() : '' },
          ],
          rows: (data) => data.deliveries.slice(0, 6),
        },
      ]}
    />
  );
}
