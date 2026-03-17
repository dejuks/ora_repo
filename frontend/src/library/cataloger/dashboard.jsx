import React from 'react';
import LibraryDashboardPage from '../shared/LibraryDashboardPage';

export default function LibraryCatalogerDashboard() {
  return (
    <LibraryDashboardPage
      title="Cataloger Dashboard"
      subtitle="Create and maintain title records, metadata, subjects, and master data."
      statCards={(data) => [
        { title: 'Catalog Materials', value: data.materials.length, icon: 'fas fa-book-open', color: 'bg-info', to: '/library/books/all' },
        { title: 'Physical Copies', value: data.copies.length, icon: 'fas fa-copy', color: 'bg-success', to: '/library/copies' },
        { title: 'Digital Resources', value: data.digitalResources.length, icon: 'fas fa-laptop', color: 'bg-primary', to: '/library/digital/metadata' },
        { title: 'Pending Cataloging', value: data.acquisitionRequests.filter((row) => ['approved', 'ordered', 'received'].includes(String(row.status || '').toLowerCase())).length, icon: 'fas fa-hourglass-half', color: 'bg-warning', to: '/library/acquisitions/requests' },
      ]}
      quickLinks={[
        { label: 'Add book', to: '/library/books/new', icon: 'fas fa-plus' },
        { label: 'Manage copies', to: '/library/copies', icon: 'fas fa-copy', className: 'btn-outline-success' },
        { label: 'Subjects', to: '/library/settings/subjects', icon: 'fas fa-tags', className: 'btn-outline-secondary' },
        { label: 'Cataloging tools', to: '/library/cataloger/tools', icon: 'fas fa-barcode', className: 'btn-outline-primary' },
      ]}
      sections={[
        {
          title: 'Newest catalog records',
          to: '/library/books/all',
          columns: [
            { key: 'title', label: 'Title' },
            { key: 'isbn', label: 'ISBN' },
            { key: 'publication_year', label: 'Year' },
          ],
          rows: (data) => data.materials.slice(0, 6),
        },
        {
          title: 'Catalog setup shortcuts',
          type: 'list',
          items: () => [
            { label: 'Material types', to: '/library/settings/material-types' },
            { label: 'Categories', to: '/library/settings/categories' },
            { label: 'Publishers', to: '/library/settings/publishers' },
            { label: 'Languages', to: '/library/settings/languages' },
            { label: 'Subjects', to: '/library/settings/subjects' },
          ],
          renderItem: (item) => <a href={item.to}>{item.label}</a>,
        },
      ]}
    />
  );
}
