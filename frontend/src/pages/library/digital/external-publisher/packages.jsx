import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Digital / External Publisher / Packages"
      subtitle="Submit and review publisher content packages."
      resource="digital-submissions"
      idField="submission_id"
      columns={[{ key: 'title', label: 'Title' }, { key: 'publisher_id', label: 'Publisher' }, { key: 'publication_year', label: 'Year' }, { key: 'status', label: 'Status' }, { key: 'submitted_at', label: 'Submitted At' }]}
      fields={[{ name: 'publisher_id', label: 'Publisher', type: 'select', resource: 'publishers' }, { name: 'material_type_id', label: 'Material Type', type: 'select', resource: 'material-types' }, { name: 'category_id', label: 'Category', type: 'select', resource: 'categories' }, { name: 'language_id', label: 'Language', type: 'select', resource: 'languages' }, { name: 'title', label: 'Title' }, { name: 'subtitle', label: 'Subtitle' }, { name: 'abstract', label: 'Abstract', type: 'textarea' }, { name: 'publication_year', label: 'Publication Year', type: 'number' }, { name: 'isbn', label: 'ISBN' }, { name: 'issn', label: 'ISSN' }, { name: 'access_level', label: 'Access Level' }, { name: 'status', label: 'Status' }, { name: 'note', label: 'Note', type: 'textarea' }]}
      readonly={false}
    />
  );
}
