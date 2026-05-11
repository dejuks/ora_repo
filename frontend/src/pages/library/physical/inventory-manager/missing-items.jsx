import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / Inventory Manager / Missing Items"
      subtitle="Track missing and unresolved copy issues."
      resource="lost-item-reports"
      idField="lost_report_id"
      columns={[{ key: 'copy_id', label: 'Copy' }, { key: 'replacement_cost', label: 'Replacement Cost' }, { key: 'resolved', label: 'Resolved' }, { key: 'created_at', label: 'Reported At' }]}
      fields={[{ name: 'copy_id', label: 'Copy', type: 'select', resource: 'copies' }, { name: 'loan_id', label: 'Loan', type: 'select', resource: 'loans' }, { name: 'description', label: 'Description', type: 'textarea' }, { name: 'replacement_cost', label: 'Replacement Cost', type: 'number' }, { name: 'resolved', label: 'Resolved', type: 'checkbox' }, { name: 'resolved_note', label: 'Resolved Note', type: 'textarea' }]}
      readonly={false}
    />
  );
}
