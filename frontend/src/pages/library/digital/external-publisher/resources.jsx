import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Digital / External Publisher / Resources"
      subtitle="Published resources linked to publisher packages."
      resource="digital-resources"
      idField="digital_resource_id"
      columns={[{ key: 'material_id', label: 'Material' }, { key: 'publisher_id', label: 'Publisher' }, { key: 'access_level', label: 'Access' }, { key: 'is_downloadable', label: 'Downloadable' }, { key: 'is_active', label: 'Active' }]}
      fields={[]}
      readonly={true}
    />
  );
}
