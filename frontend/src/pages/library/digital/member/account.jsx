import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Digital / Member / Account"
      subtitle="Review account access and recent digital activity."
      resource="members"
      idField="member_id"
      columns={[{ key: 'member_code', label: 'Member Code' }, { key: 'member_type_id', label: 'Member Type' }, { key: 'status', label: 'Status' }, { key: 'expiry_date', label: 'Expiry Date' }]}
      fields={[]}
      readonly={true}
    />
  );
}
