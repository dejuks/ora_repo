import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / Acquisition Officer / Approvals"
      subtitle="Review request and order approval status."
      resource="acquisition-requests"
      idField="request_id"
      columns={[{ key: 'title', label: 'Title' }, { key: 'requested_by', label: 'Requested By' }, { key: 'approved_by', label: 'Approved By' }, { key: 'approved_at', label: 'Approved At' }, { key: 'status', label: 'Status' }]}
      fields={[]}
      readonly={true}
    />
  );
}
