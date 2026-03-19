import React from 'react';
import LibraryDashboardPage from '../shared/LibraryDashboardPage.jsx';

export default function LibraryContentUploaderDashboard() {
  return (
    <LibraryDashboardPage
      title="Digital Content Uploader Dashboard"
      subtitle="Prepare digital submissions, upload files, and track review status."
      statCards={(data) => [
        { title: 'Digital Submissions', value: data.digitalSubmissions.length, icon: 'fas fa-file-alt', color: 'bg-info', to: '/library/digital/new' },
        { title: 'Pending Review', value: data.digitalSubmissions.filter((row) => ['submitted', 'under_review'].includes(String(row.status || '').toLowerCase())).length, icon: 'fas fa-hourglass-half', color: 'bg-warning', to: '/library/digital/approvals' },
        { title: 'Correction Requested', value: data.digitalSubmissions.filter((row) => String(row.status || '').toLowerCase() === 'correction_requested').length, icon: 'fas fa-edit', color: 'bg-danger', to: '/library/digital/metadata' },
        { title: 'Published Resources', value: data.digitalResources.length, icon: 'fas fa-check-circle', color: 'bg-success', to: '/library/digital' },
      ]}
      quickLinks={[
        { label: 'Upload new resource', to: '/library/digital/new', icon: 'fas fa-upload' },
        { label: 'Manage metadata', to: '/library/digital/metadata', icon: 'fas fa-tags', className: 'btn-outline-primary' },
        { label: 'View analytics', to: '/library/digital/analytics', icon: 'fas fa-chart-line', className: 'btn-outline-success' },
      ]}
      sections={[
        {
          title: 'Submission queue',
          to: '/library/digital/approvals',
          columns: [
            { key: 'title', label: 'Title' },
            { key: 'status', label: 'Status' },
            { key: 'submitted_at', label: 'Submitted', render: (row) => row.submitted_at ? new Date(row.submitted_at).toLocaleDateString() : '' },
          ],
          rows: (data) => data.digitalSubmissions.slice(0, 6),
        },
        {
          title: 'Published resources',
          to: '/library/digital',
          columns: [
            { key: 'title', label: 'Title' },
            { key: 'resource_type', label: 'Type' },
            { key: 'is_active', label: 'Active', render: (row) => row.is_active === false ? 'No' : 'Yes' },
          ],
          rows: (data) => data.digitalResources.slice(0, 6),
        },
      ]}
    />
  );
}
