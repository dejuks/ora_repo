import React from 'react';
import LibraryAdminCrudPage from '../../../../components/library/LibraryAdminCrudPage.jsx';
import { createLibrarySubject, deleteLibrarySubject, getLibrarySubjects, updateLibrarySubject } from '../../../../api/library.api.js';

export default function PhysicalSystemAdministratorSubjectsJsx() {
  return (
    <LibraryAdminCrudPage
      title="Physical / System Administrator / Subjects"
      subtitle="Manage library subjects through the backend API."
      listFn={getLibrarySubjects}
      createFn={createLibrarySubject}
      updateFn={updateLibrarySubject}
      deleteFn={deleteLibrarySubject}
      idKey="subject_id"
      fields={[
        { name: 'code', label: 'Code', placeholder: 'LANG' },
        { name: 'name', label: 'Name', placeholder: 'Language' },
        { name: 'description', label: 'Description', type: 'textarea' },
      ]}
      searchPlaceholder="Search subjects..."
    />
  );
}
