import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / System Administrator / Subjects"
      subtitle="Manage library subjects used in catalog indexing."
      resource="subjects"
      idField="subject_id"
      columns={[{ key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }, { key: 'description', label: 'Description' }]}
      fields={[{ name: 'code', label: 'Code' }, { name: 'name', label: 'Name' }, { name: 'description', label: 'Description', type: 'textarea' }]}
    />
  );
}
