import React, { useEffect, useState } from 'react';
import { InfoList, PageShell, SectionCard } from '../../../../components/library/LibraryUi.jsx';
import { getMemberAccount } from '../../../../api/library.memberLibrarian.js';
import { money } from '../../../../components/library/libraryFormatters.js';

export default function DigitalMemberAccountPage() {
  const [data, setData] = useState(null);

  useEffect(() => { getMemberAccount().then(setData); }, []);

  return (
    <PageShell title="Digital member account" subtitle="Summary of your profile and access rights.">
      <SectionCard title="Account details">
        <InfoList items={[
          { label: 'Name', value: data?.member?.full_name || data?.user?.name },
          { label: 'Membership no.', value: data?.member?.membership_no },
          { label: 'Status', value: data?.member?.status },
          { label: 'Outstanding balance', value: money(data?.outstandingBalance || 0) },
        ]} />
      </SectionCard>
    </PageShell>
  );
}
