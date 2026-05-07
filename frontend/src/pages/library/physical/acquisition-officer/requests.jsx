import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / Acquisition Officer / Requests"
      subtitle="Receive and monitor acquisition requests."
      resource="acquisition-requests"
      idField="request_id"
      columns={[{ key: 'title', label: 'Title' }, { key: 'author_text', label: 'Author' }, { key: 'quantity', label: 'Qty' }, { key: 'estimated_price', label: 'Estimated Price' }, { key: 'status', label: 'Status' }]}
      fields={[{ name: 'material_type_id', label: 'Material Type', type: 'select', resource: 'material-types' }, { name: 'title', label: 'Title' }, { name: 'author_text', label: 'Author Text' }, { name: 'publisher_text', label: 'Publisher Text' }, { name: 'publication_year', label: 'Publication Year', type: 'number' }, { name: 'isbn', label: 'ISBN' }, { name: 'quantity', label: 'Quantity', type: 'number' }, { name: 'estimated_price', label: 'Estimated Price', type: 'number' }, { name: 'justification', label: 'Justification', type: 'textarea' }, { name: 'status', label: 'Status' }]}
      readonly={false}
    />
  );
}
