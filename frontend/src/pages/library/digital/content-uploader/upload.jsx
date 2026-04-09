import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Digital / Content Uploader / Upload"
      subtitle="Prepare a draft digital submission package."
      resource="digital-submissions"
      idField="submission_id"
      columns={[{ key: 'title', label: 'Title' }, { key: 'publication_year', label: 'Year' }, { key: 'access_level', label: 'Access' }, { key: 'status', label: 'Status' }]}
      fields={[{ name: 'publisher_id', label: 'Publisher', type: 'select', resource: 'publishers' }, { name: 'material_type_id', label: 'Material Type', type: 'select', resource: 'material-types' }, { name: 'category_id', label: 'Category', type: 'select', resource: 'categories' }, { name: 'language_id', label: 'Language', type: 'select', resource: 'languages' }, { name: 'title', label: 'Title' }, { name: 'subtitle', label: 'Subtitle' }, { name: 'abstract', label: 'Abstract', type: 'textarea' }, { name: 'keywords', label: 'Keywords' }, { name: 'publication_year', label: 'Publication Year', type: 'number' }, { name: 'isbn', label: 'ISBN' }, { name: 'issn', label: 'ISSN' }, { name: 'access_level', label: 'Access Level' }, { name: 'status', label: 'Status' }, { name: 'note', label: 'Note', type: 'textarea' }]}
      readonly={false}
    />
  );
}
