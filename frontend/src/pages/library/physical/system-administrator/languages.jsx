import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / System Administrator / Languages"
      subtitle="Manage supported catalog and metadata languages."
      resource="languages"
      idField="language_id"
      columns={[{ key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }]}
      fields={[{ name: 'code', label: 'Code' }, { name: 'name', label: 'Name' }]}
    />
  );
}
