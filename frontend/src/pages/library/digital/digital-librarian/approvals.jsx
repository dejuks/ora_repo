import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Digital / Digital Librarian / Approvals"
      subtitle="Review incoming digital submissions and publication statuses."
      resource="digital-submissions"
      idField="submission_id"
      columns={[{ key: 'title', label: 'Title' }, { key: 'submitted_by', label: 'Submitted By' }, { key: 'access_level', label: 'Access' }, { key: 'status', label: 'Status' }, { key: 'submitted_at', label: 'Submitted At' }]}
      fields={[{ name: 'publisher_id', label: 'Publisher', type: 'select', resource: 'publishers' }, { name: 'material_type_id', label: 'Material Type', type: 'select', resource: 'material-types' }, { name: 'category_id', label: 'Category', type: 'select', resource: 'categories' }, { name: 'language_id', label: 'Language', type: 'select', resource: 'languages' }, { name: 'title', label: 'Title' }, { name: 'status', label: 'Status' }, { name: 'note', label: 'Note', type: 'textarea' }]}
      readonly={false}
    />
  );
}
