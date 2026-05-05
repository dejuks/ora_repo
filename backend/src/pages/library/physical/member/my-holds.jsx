import React, { useEffect, useState } from 'react';
import { Button, Message, PageShell, SectionCard, SimpleTable, StatusBadge } from '../../../../components/library/LibraryUi.jsx';
import { cancelMemberHold, getMemberHolds } from '../../../../api/library.memberLibrarian.js';

export default function PhysicalMemberHoldsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    setRows(await getMemberHolds());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <PageShell title="My holds" subtitle="Track reservation queue and cancel holds when needed.">
      {message ? <Message kind="success">{message}</Message> : null}
      <SectionCard title="Reservations">
        <SimpleTable
          rows={rows}
          columns={[
            { key: 'material_id', label: 'Material ID' },
            { key: 'request_date', label: 'Requested', render: (row) => new Date(row.request_date).toLocaleDateString() },
            { key: 'queue_position', label: 'Queue position' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            {
              key: 'action',
              label: 'Action',
              render: (row) => (
                <Button variant="secondary" onClick={async () => { await cancelMemberHold(row.hold_id); await load(); setMessage('Hold cancelled successfully.'); }}>
                  Cancel hold
                </Button>
              ),
            },
          ]}
          emptyText={loading ? 'Loading holds...' : 'No holds found.'}
        />
      </SectionCard>
    </PageShell>
  );
}
