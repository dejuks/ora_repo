import React, { useEffect, useState } from 'react';
import { Button, PageShell, SectionCard, Select, SimpleTable, StatusBadge } from '../../../../components/library/LibraryUi.jsx';
import { fulfillDeskHold, getLibrarianCopies, getLibrarianHolds } from '../../../../api/library.memberLibrarian.js';

export default function PhysicalHoldsPage() {
  const [rows, setRows] = useState([]);
  const [copies, setCopies] = useState([]);
  const [selectedCopies, setSelectedCopies] = useState({});

  const load = async () => {
    const [holdRows, copyRows] = await Promise.all([getLibrarianHolds(), getLibrarianCopies()]);
    setRows(holdRows);
    setCopies(copyRows.filter((row) => row.status === 'available'));
  };

  useEffect(() => { load(); }, []);

  return (
    <PageShell title="Hold fulfillment" subtitle="Move queued reservations to ready-for-pickup.">
      <SectionCard title="Queued holds">
        <SimpleTable rows={rows} columns={[
          { key: 'hold_id', label: 'Hold' },
          { key: 'member_id', label: 'Member' },
          { key: 'material_id', label: 'Material' },
          { key: 'queue_position', label: 'Queue' },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          { key: 'copy', label: 'Assign copy', render: (row) => (
            <Select value={selectedCopies[row.hold_id] || ''} onChange={(e) => setSelectedCopies((prev) => ({ ...prev, [row.hold_id]: e.target.value }))}>
              <option value="">Select copy</option>
              {copies.map((copy) => <option key={copy.copy_id} value={copy.copy_id}>{copy.accession_number}</option>)}
            </Select>
          ) },
          { key: 'action', label: 'Action', render: (row) => <Button onClick={async () => { await fulfillDeskHold(row.hold_id, selectedCopies[row.hold_id]); await load(); }}>Fulfill</Button> },
        ]} />
      </SectionCard>
    </PageShell>
  );
}
