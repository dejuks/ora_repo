import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / Librarian / Holds"
      subtitle="Monitor hold queues and fulfill requests."
      resource="holds"
      idField="hold_id"
      columns={[{ key: 'member_id', label: 'Member' }, { key: 'material_id', label: 'Material' }, { key: 'copy_id', label: 'Copy' }, { key: 'queue_position', label: 'Queue' }, { key: 'status', label: 'Status' }]}
      fields={[{ name: 'member_id', label: 'Member', type: 'select', resource: 'members' }, { name: 'material_id', label: 'Material', type: 'select', resource: 'materials' }, { name: 'copy_id', label: 'Copy', type: 'select', resource: 'copies' }, { name: 'queue_position', label: 'Queue', type: 'number' }, { name: 'status', label: 'Status' }]}
      readonly={false}
    />
  );
}
