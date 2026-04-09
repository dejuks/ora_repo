import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Digital / Admin / Audit Logs"
      subtitle="Recent actions and change history in the digital library module."
      resource="audit-logs"
      idField="audit_log_id"
      columns={[{ key: 'action', label: 'Action' }, { key: 'entity_type', label: 'Entity Type' }, { key: 'entity_id', label: 'Entity ID' }, { key: 'actor_user_id', label: 'Actor' }, { key: 'created_at', label: 'Created At' }]}
      fields={[]}
      readonly={true}
    />
  );
}
