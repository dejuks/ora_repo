import React from 'react';
import LibraryAdminCrudPage from '../../../../components/library/LibraryAdminCrudPage.jsx';
import { createLanguage, deleteLanguage, getLanguages, updateLanguage } from '../../../../api/library.api.js';

export default function PhysicalSystemAdministratorLanguagesJsx() {
  return (
    <LibraryAdminCrudPage
      title="Physical / System Administrator / Languages"
      subtitle="Manage language master data from the backend."
      listFn={getLanguages}
      createFn={createLanguage}
      updateFn={updateLanguage}
      deleteFn={deleteLanguage}
      idKey="language_id"
      fields={[
        { name: 'code', label: 'Code', placeholder: 'or' },
        { name: 'name', label: 'Name', placeholder: 'Oromo' },
      ]}
      searchPlaceholder="Search languages..."
    />
  );
}
