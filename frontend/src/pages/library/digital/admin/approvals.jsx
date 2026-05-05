import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Digital / Admin / Approvals"
      subtitle="Audit digital approvals and publication workflow."
      resource="digital-submissions"
      idField="submission_id"
      columns={[{ key: 'title', label: 'Title' }, { key: 'submitted_by', label: 'Submitted By' }, { key: 'status', label: 'Status' }, { key: 'approved_at', label: 'Approved At' }, { key: 'published_at', label: 'Published At' }]}
      fields={[]}
      readonly={true}
    />
  );
}
