import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / Inventory Manager / Audits"
      subtitle="Run and review physical stock audits."
      resource="inventory-audits"
      idField="audit_id"
      columns={[{ key: 'audit_name', label: 'Audit' }, { key: 'branch_id', label: 'Branch' }, { key: 'location_id', label: 'Location' }, { key: 'status', label: 'Status' }, { key: 'start_date', label: 'Start Date' }]}
      fields={[{ name: 'branch_id', label: 'Branch', type: 'select', resource: 'branches' }, { name: 'location_id', label: 'Location', type: 'select', resource: 'locations' }, { name: 'audit_name', label: 'Audit Name' }, { name: 'status', label: 'Status' }, { name: 'start_date', label: 'Start Date', type: 'date' }, { name: 'end_date', label: 'End Date', type: 'date' }, { name: 'note', label: 'Note', type: 'textarea' }]}
      readonly={false}
    />
  );
}
