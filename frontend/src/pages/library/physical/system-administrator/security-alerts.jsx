import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / System Administrator / Security Alerts"
      subtitle="Use audit logs to review suspicious or high-risk activity."
      resource="audit-logs"
      idField="audit_log_id"
      columns={[{ key: 'action', label: 'Action' }, { key: 'entity_type', label: 'Entity Type' }, { key: 'ip_address', label: 'IP Address' }, { key: 'user_agent', label: 'User Agent' }, { key: 'created_at', label: 'Created At' }]}
      fields={[]}
      readonly={true}
    />
  );
}
