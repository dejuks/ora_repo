import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / System Administrator / Contributors"
      subtitle="Maintain authors, editors, and institutions."
      resource="contributors"
      idField="contributor_id"
      columns={[{ key: 'full_name', label: 'Full Name' }, { key: 'organization_name', label: 'Organization' }, { key: 'contributor_type', label: 'Type' }, { key: 'email', label: 'Email' }]}
      fields={[{ name: 'full_name', label: 'Full Name' }, { name: 'organization_name', label: 'Organization' }, { name: 'contributor_type', label: 'Type' }, { name: 'bio', label: 'Bio', type: 'textarea' }, { name: 'email', label: 'Email' }, { name: 'orcid', label: 'ORCID' }]}
    />
  );
}
