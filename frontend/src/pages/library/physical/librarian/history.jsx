import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / Librarian / History"
      subtitle="Historical overview of circulation activity."
      resource="loans"
      idField="loan_id"
      columns={[{ key: 'member_id', label: 'Member' }, { key: 'copy_id', label: 'Copy' }, { key: 'loan_date', label: 'Loan Date' }, { key: 'return_date', label: 'Return Date' }, { key: 'status', label: 'Status' }]}
      fields={[]}
      readonly={true}
    />
  );
}
