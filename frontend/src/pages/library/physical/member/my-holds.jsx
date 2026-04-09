import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / Member / My Holds"
      subtitle="Monitor hold requests and queue positions."
      resource="holds"
      idField="hold_id"
      columns={[{ key: 'member_id', label: 'Member' }, { key: 'material_id', label: 'Material' }, { key: 'requested_at', label: 'Requested At' }, { key: 'status', label: 'Status' }, { key: 'queue_position', label: 'Queue' }]}
      fields={[]}
      readonly={true}
    />
  );
}
