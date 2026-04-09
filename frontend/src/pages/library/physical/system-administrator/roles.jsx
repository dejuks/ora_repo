import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / System Administrator / Roles"
      subtitle="Reference global application roles used by the library module."
      resource="member-types"
      idField="member_type_id"
      columns={[{ key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }, { key: 'description', label: 'Description' }]}
      fields={[]}
      readonly={true}
    />
  );
}
