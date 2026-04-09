import React, { useEffect, useState } from 'react';
import { CardGrid, PageShell, QuickLinks, SectionCard, StatCard, Message } from '../../../../components/library/LibraryUi.jsx';
import { getAdminDashboard } from '../../../../api/library.api.js';

export default function PhysicalSystemAdministratorDashboardJsx() {
  const [state, setState] = useState({ loading: true, error: '', data: null });

  useEffect(() => {
    getAdminDashboard()
      .then((data) => setState({ loading: false, error: '', data }))
      .catch((error) => setState({ loading: false, error: error?.response?.data?.message || error.message || 'Failed to load dashboard.', data: null }));
  }, []);

  const data = state.data || {};

  return (
    <PageShell title="Physical / System Administrator / Dashboard" subtitle="Core library administration summary connected to the backend.">
      {state.error ? <Message kind="error">{state.error}</Message> : null}
      <CardGrid>
        <StatCard label="Physical materials" value={data.total_materials || 0} />
        <StatCard label="Copies" value={data.total_copies || 0} />
        <StatCard label="Members" value={data.members || 0} />
        <StatCard label="Active loans" value={data.active_loans || 0} />
        <StatCard label="Overdue loans" value={data.overdue_loans || 0} />
        <StatCard label="Queued holds" value={data.queued_holds || 0} />
        <StatCard label="Unpaid fines" value={data.unpaid_fines || 0} />
        <StatCard label="Publishers" value={data.publishers || 0} />
      </CardGrid>

      <SectionCard title="Quick links">
        <QuickLinks links={[
          { to: '/library/physical/system-administrator/material-types', label: 'Material types', description: 'Manage master material type records.' },
          { to: '/library/physical/system-administrator/categories', label: 'Categories', description: 'Manage catalog categories.' },
          { to: '/library/physical/system-administrator/publishers', label: 'Publishers', description: 'Manage publisher records.' },
          { to: '/library/physical/system-administrator/languages', label: 'Languages', description: 'Manage language master data.' },
          { to: '/library/physical/system-administrator/subjects', label: 'Subjects', description: 'Manage subject master data.' },
        ]} />
      </SectionCard>
    </PageShell>
  );
}
