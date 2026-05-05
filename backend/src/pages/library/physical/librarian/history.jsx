import React, { useEffect, useState } from 'react';
import { PageShell, SectionCard, SimpleTable, StatusBadge } from '../../../../components/library/LibraryUi.jsx';
import { getLibrarianHistory } from '../../../../api/library.memberLibrarian.js';

export default function PhysicalHistoryPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => { getLibrarianHistory().then(setRows); }, []);

  return (
    <PageShell title="Circulation history" subtitle="Recent circulation activity across the desk.">
      <SectionCard title="History log">
        <SimpleTable rows={rows} columns={[
          { key: 'loan_id', label: 'Loan' },
          { key: 'member_id', label: 'Member' },
          { key: 'copy_id', label: 'Copy' },
          { key: 'issue_date', label: 'Issued', render: (row) => new Date(row.issue_date).toLocaleDateString() },
          { key: 'return_date', label: 'Returned', render: (row) => row.return_date ? new Date(row.return_date).toLocaleDateString() : '-' },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        ]} />
      </SectionCard>
    </PageShell>
  );
}
