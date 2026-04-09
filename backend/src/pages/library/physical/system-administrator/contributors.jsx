import React from 'react';
import LibraryAdminCrudPage from '../../../../components/library/LibraryAdminCrudPage.jsx';
import { createContributor, deleteContributor, getContributors, updateContributor } from '../../../../api/library.api.js';

export default function PhysicalSystemAdministratorContributorsJsx() {
  return (
    <LibraryAdminCrudPage
      title="Physical / System Administrator / Contributors"
      subtitle="Manage contributor master data through the backend API."
      listFn={getContributors}
      createFn={createContributor}
      updateFn={updateContributor}
      deleteFn={deleteContributor}
      idKey="contributor_id"
      fields={[
        { name: 'full_name', label: 'Full name', placeholder: 'Prof. Example Name' },
        { name: 'organization_name', label: 'Organization' },
        { name: 'contributor_type', label: 'Type', placeholder: 'person or organization' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'orcid', label: 'ORCID' },
        { name: 'bio', label: 'Bio', type: 'textarea' },
      ]}
      searchPlaceholder="Search contributors..."
    />
  );
}
