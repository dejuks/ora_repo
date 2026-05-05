import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Digital / Digital Librarian / Workflow"
      subtitle="Workflow board for digital submissions and publication lifecycle."
      resource="digital-submissions"
      idField="submission_id"
      columns={[{ key: 'title', label: 'Title' }, { key: 'status', label: 'Status' }, { key: 'submitted_at', label: 'Submitted At' }, { key: 'approved_at', label: 'Approved At' }, { key: 'published_at', label: 'Published At' }]}
      fields={[]}
      readonly={true}
    />
  );
}
