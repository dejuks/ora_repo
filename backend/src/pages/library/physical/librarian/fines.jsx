import React, { useEffect, useState } from 'react';
import { Button, Input, PageShell, SectionCard, SimpleTable, StatusBadge } from '../../../../components/library/LibraryUi.jsx';
import { collectDeskFine, getLibrarianFines } from '../../../../api/library.memberLibrarian.js';
import { money } from '../../../../components/library/libraryFormatters.js';

export default function PhysicalFinesPage() {
  const [rows, setRows] = useState([]);
  const [amounts, setAmounts] = useState({});

  const load = async () => setRows(await getLibrarianFines());

  useEffect(() => { load(); }, []);

  return (
    <PageShell title="Fine collection" subtitle="Collect fine payments from members at the desk.">
      <SectionCard title="Fine ledger">
        <SimpleTable rows={rows} columns={[
          { key: 'fine_id', label: 'Fine' },
          { key: 'member_id', label: 'Member' },
          { key: 'reason', label: 'Reason' },
          { key: 'amount', label: 'Amount', render: (row) => money(row.amount) },
          { key: 'paid_amount', label: 'Paid', render: (row) => money(row.paid_amount) },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          { key: 'action', label: 'Collect', render: (row) => (
            <div style={{ display: 'flex', gap: 8 }}>
              <Input value={amounts[row.fine_id] ?? ''} onChange={(e) => setAmounts((prev) => ({ ...prev, [row.fine_id]: e.target.value }))} style={{ width: 110 }} placeholder="ETB" />
              <Button onClick={async () => { await collectDeskFine(row.fine_id, Number(amounts[row.fine_id] || 0)); await load(); }}>Collect</Button>
            </div>
          ) },
        ]} />
      </SectionCard>
    </PageShell>
  );
}
