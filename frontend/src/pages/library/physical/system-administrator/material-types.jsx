import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / System Administrator / Material Types"
      subtitle="Configure physical and digital material types."
      resource="material-types"
      idField="material_type_id"
      columns={[{ key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }, { key: 'is_borrowable', label: 'Borrowable' }, { key: 'is_physical_allowed', label: 'Physical' }, { key: 'is_digital_allowed', label: 'Digital' }]}
      fields={[{ name: 'code', label: 'Code' }, { name: 'name', label: 'Name' }, { name: 'is_borrowable', label: 'Borrowable', type: 'checkbox' }, { name: 'is_physical_allowed', label: 'Physical Allowed', type: 'checkbox' }, { name: 'is_digital_allowed', label: 'Digital Allowed', type: 'checkbox' }, { name: 'description', label: 'Description', type: 'textarea' }]}
    />
  );
}
