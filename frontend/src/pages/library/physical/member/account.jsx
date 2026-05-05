import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / Member / Account"
      subtitle="View membership details and account status."
      resource="members"
      idField="member_id"
      columns={[{ key: 'member_code', label: 'Member Code' }, { key: 'member_type_id', label: 'Member Type' }, { key: 'branch_id', label: 'Branch' }, { key: 'status', label: 'Status' }, { key: 'expiry_date', label: 'Expiry Date' }]}
      fields={[]}
      readonly={true}
    />
  );
}
