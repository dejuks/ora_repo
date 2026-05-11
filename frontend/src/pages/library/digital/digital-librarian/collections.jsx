import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Digital / Digital Librarian / Collections"
      subtitle="Track published digital collections and publication records."
      resource="digital-collections"
      idField="publication_id"
      columns={[{ key: 'submission_id', label: 'Submission' }, { key: 'material_id', label: 'Material' }, { key: 'digital_resource_id', label: 'Digital Resource' }, { key: 'published_by', label: 'Published By' }, { key: 'published_at', label: 'Published At' }]}
      fields={[{ name: 'submission_id', label: 'Submission', type: 'select', resource: 'digital-submissions' }, { name: 'material_id', label: 'Material', type: 'select', resource: 'materials' }, { name: 'digital_resource_id', label: 'Digital Resource', type: 'select', resource: 'digital-resources' }, { name: 'published_by', label: 'Published By' }]}
      readonly={false}
    />
  );
}
