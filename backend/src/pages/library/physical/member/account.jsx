import React, { useEffect, useState } from 'react';
import { InfoList, Message, PageShell, SectionCard, SimpleTable, StatusBadge } from '../../../../components/library/LibraryUi.jsx';
import { getMemberAccount } from '../../../../api/library.memberLibrarian.js';
import { money } from '../../../../components/library/libraryFormatters.js';

export default function LibraryAccountPage() {
  const [state, setState] = useState({ loading: true, error: '', data: null });

  useEffect(() => {
    getMemberAccount()
      .then((data) => setState({ loading: false, error: '', data }))
      .catch((error) => setState({ loading: false, error: error.message || 'Failed to load account.', data: null }));
  }, []);

  const data = state.data;

  return (
    <PageShell title="Member account" subtitle="Membership details and circulation summary.">
      {state.error ? <Message kind="error">{state.error}</Message> : null}
      <SectionCard title="Profile">
        <InfoList
          items={[
            { label: 'Full name', value: data?.member?.full_name || data?.user?.name },
            { label: 'Membership no.', value: data?.member?.membership_no },
            { label: 'Status', value: data?.member?.status },
            { label: 'Outstanding balance', value: money(data?.outstandingBalance || 0) },
          ]}
        />
      </SectionCard>
      <SectionCard title="Recent circulation history">
        <SimpleTable
          rows={data?.history?.slice(0, 10) || []}
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'issue_date', label: 'Issued', render: (row) => new Date(row.issue_date).toLocaleDateString() },
            { key: 'due_date', label: 'Due', render: (row) => new Date(row.due_date).toLocaleDateString() },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          ]}
          emptyText={state.loading ? 'Loading account...' : 'No circulation history yet.'}
        />
      </SectionCard>
    </PageShell>
  );
}
