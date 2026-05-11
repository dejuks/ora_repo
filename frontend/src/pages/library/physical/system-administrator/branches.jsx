import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / System Administrator / Branches"
      subtitle="Manage library branches and service points."
      resource="branches"
      idField="branch_id"
      columns={[{ key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }, { key: 'phone', label: 'Phone' }, { key: 'email', label: 'Email' }, { key: 'is_active', label: 'Active' }]}
      fields={[{ name: 'code', label: 'Code' }, { name: 'name', label: 'Name' }, { name: 'description', label: 'Description', type: 'textarea' }, { name: 'address', label: 'Address', type: 'textarea' }, { name: 'phone', label: 'Phone' }, { name: 'email', label: 'Email' }, { name: 'is_active', label: 'Active', type: 'checkbox' }]}
    />
  );
}
