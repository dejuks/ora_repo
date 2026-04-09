import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / Librarian / Loans"
      subtitle="Inspect and manage all circulation loans."
      resource="loans"
      idField="loan_id"
      columns={[{ key: 'member_id', label: 'Member' }, { key: 'copy_id', label: 'Copy' }, { key: 'loan_date', label: 'Loan Date' }, { key: 'due_date', label: 'Due Date' }, { key: 'return_date', label: 'Return Date' }, { key: 'status', label: 'Status' }]}
      fields={[{ name: 'member_id', label: 'Member', type: 'select', resource: 'members' }, { name: 'copy_id', label: 'Copy', type: 'select', resource: 'copies' }, { name: 'loan_date', label: 'Loan Date', type: 'date' }, { name: 'due_date', label: 'Due Date', type: 'date' }, { name: 'return_date', label: 'Return Date', type: 'date' }, { name: 'status', label: 'Status' }, { name: 'remarks', label: 'Remarks', type: 'textarea' }]}
      readonly={false}
    />
  );
}
