import React, { useEffect, useState } from 'react';
import { Button, Input, Message, PageShell, SectionCard, SimpleTable, StatusBadge } from '../../../../components/library/LibraryUi.jsx';
import { payMemberFine, getMemberFines } from '../../../../api/library.memberLibrarian.js';
import { money } from '../../../../components/library/libraryFormatters.js';

export default function PhysicalMemberFinesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [amounts, setAmounts] = useState({});

  const load = async () => {
    setLoading(true);
    setRows(await getMemberFines());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <PageShell title="My fines" subtitle="Review balances and make a mock payment from the member portal.">
      {message ? <Message kind="success">{message}</Message> : null}
      <SectionCard title="Fine ledger">
        <SimpleTable
          rows={rows}
          columns={[
            { key: 'material_title', label: 'Item' },
            { key: 'reason', label: 'Reason' },
            { key: 'amount', label: 'Amount', render: (row) => money(row.amount) },
            { key: 'outstanding_amount', label: 'Outstanding', render: (row) => money(row.outstanding_amount) },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            {
              key: 'action',
              label: 'Pay',
              render: (row) => (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Input
                    value={amounts[row.fine_id] ?? row.outstanding_amount ?? ''}
                    onChange={(e) => setAmounts((prev) => ({ ...prev, [row.fine_id]: e.target.value }))}
                    style={{ width: 110 }}
                  />
                  <Button onClick={async () => { await payMemberFine(row.fine_id, Number(amounts[row.fine_id] || row.outstanding_amount || 0)); await load(); setMessage('Payment recorded.'); }}>
                    Pay
                  </Button>
                </div>
              ),
            },
          ]}
          emptyText={loading ? 'Loading fines...' : 'No fines found.'}
        />
      </SectionCard>
    </PageShell>
  );
}
