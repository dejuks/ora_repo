import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Digital / Admin / Users"
      subtitle="Review digital library membership and user readiness."
      resource="members"
      idField="member_id"
      columns={[{ key: 'member_code', label: 'Member Code' }, { key: 'user_id', label: 'User' }, { key: 'member_type_id', label: 'Member Type' }, { key: 'status', label: 'Status' }, { key: 'expiry_date', label: 'Expiry Date' }]}
      fields={[]}
      readonly={true}
    />
  );
}
