import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / Cataloger / Metadata"
      subtitle="Update descriptive metadata used for discovery."
      resource="materials"
      idField="material_id"
      columns={[{ key: 'title', label: 'Title' }, { key: 'classification_code', label: 'Classification' }, { key: 'call_number', label: 'Call Number' }, { key: 'keywords', label: 'Keywords' }]}
      fields={[{ name: 'title', label: 'Title' }, { name: 'subtitle', label: 'Subtitle' }, { name: 'classification_code', label: 'Classification Code' }, { name: 'call_number', label: 'Call Number' }, { name: 'keywords', label: 'Keywords' }, { name: 'abstract', label: 'Abstract', type: 'textarea' }, { name: 'description', label: 'Description', type: 'textarea' }]}
      readonly={false}
    />
  );
}
