import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / System Administrator / Publishers"
      subtitle="Maintain publisher and content-provider records."
      resource="publishers"
      idField="publisher_id"
      columns={[{ key: 'name', label: 'Name' }, { key: 'city', label: 'City' }, { key: 'country', label: 'Country' }, { key: 'contact_email', label: 'Email' }, { key: 'is_external_provider', label: 'External' }]}
      fields={[{ name: 'name', label: 'Name' }, { name: 'city', label: 'City' }, { name: 'country', label: 'Country' }, { name: 'website', label: 'Website' }, { name: 'contact_email', label: 'Contact Email' }, { name: 'contact_phone', label: 'Contact Phone' }, { name: 'is_external_provider', label: 'External Provider', type: 'checkbox' }]}
    />
  );
}
