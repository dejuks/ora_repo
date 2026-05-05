import React, { useEffect, useState } from 'react';
import { Button, Message, PageShell, SectionCard, SimpleTable, StatusBadge } from '../../../../components/library/LibraryUi.jsx';
import { getMemberLoans, renewMemberLoan } from '../../../../api/library.memberLibrarian.js';

export default function PhysicalMemberLoansPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    const data = await getMemberLoans();
    setRows(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <PageShell title="My loans" subtitle="Review due dates and renew eligible items.">
      {message ? <Message kind="success">{message}</Message> : null}
      <SectionCard title="Active borrowing">
        <SimpleTable
          rows={rows}
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'accession_number', label: 'Copy' },
            { key: 'issue_date', label: 'Issued', render: (row) => new Date(row.issue_date).toLocaleDateString() },
            { key: 'due_date', label: 'Due', render: (row) => new Date(row.due_date).toLocaleDateString() },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            {
              key: 'action',
              label: 'Action',
              render: (row) => (
                <Button onClick={async () => { await renewMemberLoan(row.loan_id); await load(); setMessage(`Loan renewed for ${row.title}.`); }}>Renew</Button>
              ),
            },
          ]}
          emptyText={loading ? 'Loading loans...' : 'No active loans.'}
        />
      </SectionCard>
    </PageShell>
  );
}
