import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Digital / Digital Librarian / Analytics"
      subtitle="Monitor digital usage and access trends."
      resource="digital-usage-logs"
      idField="usage_log_id"
      columns={[{ key: 'digital_resource_id', label: 'Resource' }, { key: 'member_id', label: 'Member' }, { key: 'action', label: 'Action' }, { key: 'ip_address', label: 'IP Address' }, { key: 'created_at', label: 'Created At' }]}
      fields={[]}
      readonly={true}
    />
  );
}
