import React from 'react';
import LibraryAdminCrudPage from '../../../../components/library/LibraryAdminCrudPage.jsx';
import { createPublisher, deletePublisher, getPublishers, updatePublisher } from '../../../../api/library.api.js';

export default function PhysicalSystemAdministratorPublishersJsx() {
  return (
    <LibraryAdminCrudPage
      title="Physical / System Administrator / Publishers"
      subtitle="Manage publisher records using the backend API."
      listFn={getPublishers}
      createFn={createPublisher}
      updateFn={updatePublisher}
      deleteFn={deletePublisher}
      idKey="publisher_id"
      fields={[
        { name: 'name', label: 'Name', placeholder: 'ORA Publications' },
        { name: 'city', label: 'City' },
        { name: 'country', label: 'Country' },
        { name: 'website', label: 'Website', placeholder: 'https://example.com' },
        { name: 'contact_email', label: 'Email', type: 'email' },
        { name: 'contact_phone', label: 'Phone' },
        { name: 'is_external_provider', label: 'External provider', type: 'checkbox', defaultValue: false },
      ]}
      searchPlaceholder="Search publishers..."
    />
  );
}
