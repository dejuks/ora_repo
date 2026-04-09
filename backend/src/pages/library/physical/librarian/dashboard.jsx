import React, { useEffect, useState } from 'react';
import { CardGrid, PageShell, QuickLinks, SectionCard, StatCard, SimpleTable, StatusBadge } from '../../../../components/library/LibraryUi.jsx';
import { getLibrarianDashboardData } from '../../../../api/library.memberLibrarian.js';

export default function LibraryLibrarianDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => { getLibrarianDashboardData().then(setData); }, []);

  return (
    <PageShell title="Librarian Dashboard" subtitle="Daily circulation control center for loans, holds, fines, and desk activity.">
      <CardGrid>
        <StatCard label="Active loans" value={data?.summary?.active_loans || 0} />
        <StatCard label="Overdue loans" value={data?.summary?.overdue_loans || 0} />
        <StatCard label="Queued holds" value={data?.summary?.queued_holds || 0} />
        <StatCard label="Unpaid fines" value={data?.summary?.unpaid_fines || 0} />
      </CardGrid>
      <SectionCard title="Quick actions">
        <QuickLinks links={[
          { to: '/library/physical/librarian/circulation-desk', label: 'Circulation desk', description: 'Issue, return, and renew items.' },
          { to: '/library/physical/librarian/loans', label: 'Loans', description: 'Review active and overdue loans.' },
          { to: '/library/physical/librarian/holds', label: 'Holds', description: 'Fulfill reservations.' },
          { to: '/library/physical/librarian/fines', label: 'Fines', description: 'Collect or review balances.' },
          { to: '/library/physical/librarian/history', label: 'History', description: 'Check recent circulation activity.' },
        ]} />
      </SectionCard>
      <SectionCard title="Recent loans">
        <SimpleTable rows={data?.loans?.slice(0, 8) || []} columns={[
          { key: 'loan_id', label: 'Loan' },
          { key: 'member_id', label: 'Member' },
          { key: 'due_date', label: 'Due', render: (row) => new Date(row.due_date).toLocaleDateString() },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        ]} emptyText="No loans yet." />
      </SectionCard>
    </PageShell>
  );
}
