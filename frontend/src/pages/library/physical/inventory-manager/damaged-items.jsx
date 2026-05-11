import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / Inventory Manager / Damaged Items"
      subtitle="Record damage severity and recovery actions."
      resource="damage-reports"
      idField="damage_report_id"
      columns={[{ key: 'copy_id', label: 'Copy' }, { key: 'severity', label: 'Severity' }, { key: 'estimated_cost', label: 'Estimated Cost' }, { key: 'resolved', label: 'Resolved' }, { key: 'created_at', label: 'Reported At' }]}
      fields={[{ name: 'copy_id', label: 'Copy', type: 'select', resource: 'copies' }, { name: 'loan_id', label: 'Loan', type: 'select', resource: 'loans' }, { name: 'severity', label: 'Severity' }, { name: 'description', label: 'Description', type: 'textarea' }, { name: 'estimated_cost', label: 'Estimated Cost', type: 'number' }, { name: 'resolved', label: 'Resolved', type: 'checkbox' }, { name: 'resolved_note', label: 'Resolved Note', type: 'textarea' }]}
      readonly={false}
    />
  );
}
