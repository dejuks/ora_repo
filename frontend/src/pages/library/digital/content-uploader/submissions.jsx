import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Digital / Content Uploader / Submissions"
      subtitle="View and maintain all uploaded submissions."
      resource="digital-submissions"
      idField="submission_id"
      columns={[{ key: 'title', label: 'Title' }, { key: 'status', label: 'Status' }, { key: 'publication_year', label: 'Year' }, { key: 'submitted_at', label: 'Submitted At' }]}
      fields={[{ name: 'title', label: 'Title' }, { name: 'status', label: 'Status' }, { name: 'note', label: 'Note', type: 'textarea' }]}
      readonly={false}
    />
  );
}
