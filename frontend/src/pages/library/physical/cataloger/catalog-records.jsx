import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / Cataloger / Catalog Records"
      subtitle="Manage physical catalog records and metadata."
      resource="materials"
      idField="material_id"
      columns={[{ key: 'title', label: 'Title' }, { key: 'material_type_id', label: 'Type' }, { key: 'category_id', label: 'Category' }, { key: 'publisher_id', label: 'Publisher' }, { key: 'publication_year', label: 'Year' }]}
      fields={[{ name: 'material_type_id', label: 'Material Type', type: 'select', resource: 'material-types' }, { name: 'category_id', label: 'Category', type: 'select', resource: 'categories' }, { name: 'publisher_id', label: 'Publisher', type: 'select', resource: 'publishers' }, { name: 'language_id', label: 'Language', type: 'select', resource: 'languages' }, { name: 'title', label: 'Title' }, { name: 'subtitle', label: 'Subtitle' }, { name: 'isbn', label: 'ISBN' }, { name: 'issn', label: 'ISSN' }, { name: 'publication_year', label: 'Publication Year', type: 'number' }, { name: 'publication_place', label: 'Publication Place' }, { name: 'classification_code', label: 'Classification Code' }, { name: 'call_number', label: 'Call Number' }, { name: 'material_format', label: 'Material Format' }, { name: 'is_reference_only', label: 'Reference Only', type: 'checkbox' }, { name: 'is_active', label: 'Active', type: 'checkbox' }, { name: 'abstract', label: 'Abstract', type: 'textarea' }, { name: 'description', label: 'Description', type: 'textarea' }]}
      readonly={false}
    />
  );
}
