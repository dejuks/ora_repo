import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / System Administrator / Create User"
      subtitle="Register a library member record and assign a member type."
      resource="members"
      idField="member_id"
      columns={[{ key: 'member_code', label: 'Member Code' }, { key: 'user_id', label: 'User' }, { key: 'member_type_id', label: 'Member Type' }, { key: 'branch_id', label: 'Branch' }, { key: 'status', label: 'Status' }]}
      fields={[{ name: 'user_id', label: 'User ID' }, { name: 'member_type_id', label: 'Member Type', type: 'select', resource: 'member-types' }, { name: 'member_code', label: 'Member Code' }, { name: 'branch_id', label: 'Branch', type: 'select', resource: 'branches' }, { name: 'department', label: 'Department' }, { name: 'program', label: 'Program' }, { name: 'admission_year', label: 'Admission Year', type: 'number' }, { name: 'expiry_date', label: 'Expiry Date', type: 'date' }, { name: 'status', label: 'Status' }, { name: 'notes', label: 'Notes', type: 'textarea' }]}
      readonly={false}
    />
  );
}
