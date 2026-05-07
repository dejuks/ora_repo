import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Digital / Member / Library"
      subtitle="Browse digital resources available for your access level."
      resource="digital-resources"
      idField="digital_resource_id"
      columns={[{ key: 'material_id', label: 'Material' }, { key: 'publisher_id', label: 'Publisher' }, { key: 'access_level', label: 'Access' }, { key: 'is_downloadable', label: 'Downloadable' }, { key: 'is_active', label: 'Active' }]}
      fields={[]}
      readonly={true}
    />
  );
}
