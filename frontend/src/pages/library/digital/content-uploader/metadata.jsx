import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Digital / Content Uploader / Metadata"
      subtitle="Refine metadata before approval."
      resource="digital-submissions"
      idField="submission_id"
      columns={[{ key: 'title', label: 'Title' }, { key: 'category_id', label: 'Category' }, { key: 'language_id', label: 'Language' }, { key: 'publication_year', label: 'Year' }, { key: 'status', label: 'Status' }]}
      fields={[{ name: 'category_id', label: 'Category', type: 'select', resource: 'categories' }, { name: 'language_id', label: 'Language', type: 'select', resource: 'languages' }, { name: 'title', label: 'Title' }, { name: 'subtitle', label: 'Subtitle' }, { name: 'abstract', label: 'Abstract', type: 'textarea' }, { name: 'keywords', label: 'Keywords' }, { name: 'publication_year', label: 'Publication Year', type: 'number' }, { name: 'isbn', label: 'ISBN' }, { name: 'issn', label: 'ISSN' }, { name: 'note', label: 'Note', type: 'textarea' }]}
      readonly={false}
    />
  );
}
