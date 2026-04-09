import React, { useEffect, useMemo, useState } from 'react';
import { Input, PageShell, SectionCard, SimpleTable, StatusBadge, Toolbar } from '../../../../components/library/LibraryUi.jsx';
import { getLibrarianLoans } from '../../../../api/library.memberLibrarian.js';

export default function PhysicalLoansPage() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => { getLibrarianLoans().then(setRows); }, []);

  const filtered = useMemo(() => rows.filter((row) => JSON.stringify(row).toLowerCase().includes(search.toLowerCase())), [rows, search]);

  return (
    <PageShell title="Loan management" subtitle="Monitor all current and overdue loans.">
      <SectionCard title="Loan list">
        <Toolbar>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search loans" style={{ minWidth: 240 }} />
        </Toolbar>
        <SimpleTable rows={filtered} columns={[
          { key: 'loan_id', label: 'Loan' },
          { key: 'member_id', label: 'Member' },
          { key: 'copy_id', label: 'Copy' },
          { key: 'issue_date', label: 'Issued', render: (row) => new Date(row.issue_date).toLocaleDateString() },
          { key: 'due_date', label: 'Due', render: (row) => new Date(row.due_date).toLocaleDateString() },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        ]} />
      </SectionCard>
    </PageShell>
  );
}
