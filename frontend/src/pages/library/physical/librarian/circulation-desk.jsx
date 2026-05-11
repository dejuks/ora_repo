import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / Librarian / Circulation Desk"
      subtitle="Handle loans, returns, and front-desk circulation tasks."
      resource="loans"
      idField="loan_id"
      columns={[{ key: 'member_id', label: 'Member' }, { key: 'copy_id', label: 'Copy' }, { key: 'loan_date', label: 'Loan Date' }, { key: 'due_date', label: 'Due Date' }, { key: 'status', label: 'Status' }]}
      fields={[{ name: 'member_id', label: 'Member', type: 'select', resource: 'members' }, { name: 'copy_id', label: 'Copy', type: 'select', resource: 'copies' }, { name: 'policy_id', label: 'Policy', type: 'select', resource: 'circulation-policies' }, { name: 'loan_date', label: 'Loan Date', type: 'date' }, { name: 'due_date', label: 'Due Date', type: 'date' }, { name: 'status', label: 'Status' }]}
      readonly={false}
    />
  );
}
