import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / Cataloger / Tools"
      subtitle="Reference classification, subjects, and supporting lookup tools."
      resource="material-types"
      idField="material_type_id"
      columns={[{ key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }, { key: 'description', label: 'Description' }]}
      fields={[]}
      readonly={true}
    />
  );
}
