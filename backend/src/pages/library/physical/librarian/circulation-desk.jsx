import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input, PageShell, SectionCard, Select, SimpleTable, StatusBadge, Toolbar, Message } from '../../../../components/library/LibraryUi.jsx';
import { createDeskLoan, getLibrarianCopies, getLibrarianLoans, getLibrarianMembers, renewDeskLoan, returnDeskLoan } from '../../../../api/library.memberLibrarian.js';

export default function PhysicalCirculationDeskPage() {
  const [members, setMembers] = useState([]);
  const [copies, setCopies] = useState([]);
  const [loans, setLoans] = useState([]);
  const [memberId, setMemberId] = useState('');
  const [copyId, setCopyId] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');

  const load = async () => {
    const [memberRows, copyRows, loanRows] = await Promise.all([getLibrarianMembers(), getLibrarianCopies(), getLibrarianLoans()]);
    setMembers(memberRows);
    setCopies(copyRows);
    setLoans(loanRows);
    setMemberId((prev) => prev || memberRows[0]?.member_id || '');
    setCopyId((prev) => prev || copyRows.find((row) => row.status === 'available')?.copy_id || '');
  };

  useEffect(() => { load(); }, []);

  const filteredLoans = useMemo(() => loans.filter((row) => JSON.stringify(row).toLowerCase().includes(search.toLowerCase())), [loans, search]);

  return (
    <PageShell title="Circulation desk" subtitle="Issue new loans and process returns or renewals.">
      {message ? <Message kind="success">{message}</Message> : null}
      <SectionCard title="Issue loan">
        <Toolbar>
          <Select value={memberId} onChange={(e) => setMemberId(e.target.value)} style={{ minWidth: 220 }}>
            {members.map((row) => <option key={row.member_id} value={row.member_id}>{row.full_name} ({row.membership_no})</option>)}
          </Select>
          <Select value={copyId} onChange={(e) => setCopyId(e.target.value)} style={{ minWidth: 220 }}>
            {copies.filter((row) => row.status === 'available').map((row) => <option key={row.copy_id} value={row.copy_id}>{row.accession_number} - {row.copy_id}</option>)}
          </Select>
          <Button onClick={async () => { await createDeskLoan({ memberId, copyId }); await load(); setMessage('Loan issued successfully.'); }}>Issue loan</Button>
        </Toolbar>
      </SectionCard>
      <SectionCard title="Process loans">
        <Toolbar>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search loan, member, copy" style={{ minWidth: 240 }} />
        </Toolbar>
        <SimpleTable rows={filteredLoans} columns={[
          { key: 'loan_id', label: 'Loan' },
          { key: 'member_id', label: 'Member' },
          { key: 'copy_id', label: 'Copy' },
          { key: 'due_date', label: 'Due', render: (row) => new Date(row.due_date).toLocaleDateString() },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          { key: 'actions', label: 'Actions', render: (row) => (
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="secondary" onClick={async () => { await renewDeskLoan(row.loan_id); await load(); setMessage('Loan renewed.'); }}>Renew</Button>
              <Button onClick={async () => { await returnDeskLoan(row.loan_id); await load(); setMessage('Loan returned.'); }}>Return</Button>
            </div>
          ) },
        ]} emptyText="No loans found." />
      </SectionCard>
    </PageShell>
  );
}
