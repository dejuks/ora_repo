import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / Cataloger / Add Record"
      subtitle="Create a new catalog record."
      resource="materials"
      idField="material_id"
      columns={[{ key: 'title', label: 'Title' }, { key: 'material_type_id', label: 'Type' }, { key: 'publication_year', label: 'Year' }, { key: 'material_format', label: 'Format' }]}
      fields={[{ name: 'material_type_id', label: 'Material Type', type: 'select', resource: 'material-types' }, { name: 'category_id', label: 'Category', type: 'select', resource: 'categories' }, { name: 'publisher_id', label: 'Publisher', type: 'select', resource: 'publishers' }, { name: 'language_id', label: 'Language', type: 'select', resource: 'languages' }, { name: 'title', label: 'Title' }, { name: 'subtitle', label: 'Subtitle' }, { name: 'isbn', label: 'ISBN' }, { name: 'issn', label: 'ISSN' }, { name: 'publication_year', label: 'Publication Year', type: 'number' }, { name: 'publication_place', label: 'Publication Place' }, { name: 'classification_code', label: 'Classification Code' }, { name: 'call_number', label: 'Call Number' }, { name: 'material_format', label: 'Material Format' }, { name: 'abstract', label: 'Abstract', type: 'textarea' }, { name: 'description', label: 'Description', type: 'textarea' }]}
      readonly={false}
    />
  );
}
