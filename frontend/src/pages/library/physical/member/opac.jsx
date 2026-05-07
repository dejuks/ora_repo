import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / Member / OPAC"
      subtitle="Search and browse the public catalog of physical materials."
      resource="materials"
      idField="material_id"
      columns={[{ key: 'title', label: 'Title' }, { key: 'publication_year', label: 'Year' }, { key: 'material_format', label: 'Format' }, { key: 'call_number', label: 'Call Number' }, { key: 'is_active', label: 'Active' }]}
      fields={[{ name: 'title', label: 'Title' }, { name: 'subtitle', label: 'Subtitle' }, { name: 'publication_year', label: 'Publication Year', type: 'number' }, { name: 'classification_code', label: 'Classification Code' }, { name: 'call_number', label: 'Call Number' }]}
      readonly={true}
    />
  );
}
