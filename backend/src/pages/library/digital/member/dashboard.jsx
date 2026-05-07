import React, { useEffect, useState } from 'react';
import { CardGrid, PageShell, QuickLinks, SectionCard, SimpleTable, StatCard } from '../../../../components/library/LibraryUi.jsx';
import { getMemberDashboardData } from '../../../../api/library.memberLibrarian.js';

export default function DigitalMemberDashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getMemberDashboardData().then(setData);
  }, []);

  return (
    <PageShell title="Digital Library Member Dashboard" subtitle="Access digital content and track your library activity.">
      <CardGrid>
        <StatCard label="Active loans" value={data?.overview?.activeLoans?.length || 0} />
        <StatCard label="Digital recommendations" value={data?.recommended?.length || 0} />
        <StatCard label="Queued holds" value={data?.overview?.myHolds?.length || 0} />
      </CardGrid>
      <SectionCard title="Quick links">
        <QuickLinks
          links={[
            { to: '/library/digital/member/library', label: 'Digital library', description: 'Browse available digital content.' },
            { to: '/library/digital/member/account', label: 'Digital account', description: 'See your profile and activity.' },
            { to: '/library/physical/member/opac', label: 'Physical OPAC', description: 'Search the physical catalog too.' },
          ]}
        />
      </SectionCard>
      <SectionCard title="Featured items">
        <SimpleTable rows={data?.recommended || []} columns={[{ key: 'title', label: 'Title' }, { key: 'publication_year', label: 'Year' }, { key: 'classification_code', label: 'Class no.' }]} emptyText="No featured items." />
      </SectionCard>
    </PageShell>
  );
}
