import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / Member / My Fines"
      subtitle="Track balances, waivers, and payments."
      resource="fines"
      idField="fine_id"
      columns={[{ key: 'reason', label: 'Reason' }, { key: 'amount', label: 'Amount' }, { key: 'paid_amount', label: 'Paid' }, { key: 'waived_amount', label: 'Waived' }, { key: 'status', label: 'Status' }]}
      fields={[]}
      readonly={true}
    />
  );
}
