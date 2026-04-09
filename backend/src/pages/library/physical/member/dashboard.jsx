import React, { useEffect, useState } from 'react';
import { QuickLinks, PageShell, CardGrid, StatCard, SectionCard, SimpleTable, StatusBadge, Message } from '../../../../components/library/LibraryUi.jsx';
import { getMemberDashboardData } from '../../../../api/library.memberLibrarian.js';

export default function LibraryMemberDashboardPage() {
  const [state, setState] = useState({ loading: true, error: '', data: null });

  useEffect(() => {
    getMemberDashboardData()
      .then((data) => setState({ loading: false, error: '', data }))
      .catch((error) => setState({ loading: false, error: error.message || 'Failed to load member dashboard.', data: null }));
  }, []);

  const overview = state.data?.overview;

  return (
    <PageShell title="Physical Library Member Dashboard" subtitle="Your borrowing overview, holds, fines, and quick access to the OPAC.">
      {state.error ? <Message kind="error">{state.error}</Message> : null}
      <CardGrid>
        <StatCard label="Active loans" value={overview?.activeLoans?.length || 0} />
        <StatCard label="Queued holds" value={overview?.myHolds?.length || 0} />
        <StatCard label="Outstanding fines" value={overview?.fines?.filter((row) => row.status !== 'paid').length || 0} />
        <StatCard label="Account balance" value={overview?.outstandingBalance || 0} hint="ETB outstanding" />
      </CardGrid>

      <SectionCard title="Quick links">
        <QuickLinks
          links={[
            { to: '/library/physical/member/opac', label: 'Search OPAC', description: 'Find books and check copy availability.' },
            { to: '/library/physical/member/my-loans', label: 'My loans', description: 'Review due dates and renew active items.' },
            { to: '/library/physical/member/my-holds', label: 'My holds', description: 'Check reservations and queue status.' },
            { to: '/library/physical/member/my-fines', label: 'My fines', description: 'Review outstanding balances.' },
            { to: '/library/physical/member/account', label: 'My account', description: 'See membership and circulation summary.' },
          ]}
        />
      </SectionCard>

      <SectionCard title="Current active loans">
        <SimpleTable
          rows={overview?.activeLoans || []}
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'accession_number', label: 'Copy' },
            { key: 'due_date', label: 'Due date', render: (row) => new Date(row.due_date).toLocaleDateString() },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          ]}
          emptyText={state.loading ? 'Loading loans...' : 'No active loans.'}
        />
      </SectionCard>

      <SectionCard title="Recommended titles">
        <SimpleTable
          rows={state.data?.recommended || []}
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'classification_code', label: 'Class no.' },
            { key: 'available_copies', label: 'Available copies' },
            { key: 'total_copies', label: 'Total copies' },
          ]}
          emptyText={state.loading ? 'Loading catalog...' : 'No recommendations yet.'}
        />
      </SectionCard>
    </PageShell>
  );
}
