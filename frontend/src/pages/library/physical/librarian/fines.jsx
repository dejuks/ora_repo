import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / Librarian / Fines"
      subtitle="Issue and settle fines and penalties."
      resource="fines"
      idField="fine_id"
      columns={[{ key: 'member_id', label: 'Member' }, { key: 'reason', label: 'Reason' }, { key: 'amount', label: 'Amount' }, { key: 'paid_amount', label: 'Paid' }, { key: 'status', label: 'Status' }]}
      fields={[{ name: 'member_id', label: 'Member', type: 'select', resource: 'members' }, { name: 'loan_id', label: 'Loan', type: 'select', resource: 'loans' }, { name: 'copy_id', label: 'Copy', type: 'select', resource: 'copies' }, { name: 'reason', label: 'Reason' }, { name: 'amount', label: 'Amount', type: 'number' }, { name: 'due_date', label: 'Due Date', type: 'date' }, { name: 'status', label: 'Status' }, { name: 'note', label: 'Note', type: 'textarea' }]}
      readonly={false}
    />
  );
}
