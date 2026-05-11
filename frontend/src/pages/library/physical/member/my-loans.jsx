import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / Member / My Loans"
      subtitle="Review your borrowing activity and due dates."
      resource="loans"
      idField="loan_id"
      columns={[{ key: 'member_id', label: 'Member' }, { key: 'copy_id', label: 'Copy' }, { key: 'loan_date', label: 'Loan Date' }, { key: 'due_date', label: 'Due Date' }, { key: 'status', label: 'Status' }]}
      fields={[]}
      readonly={true}
    />
  );
}
