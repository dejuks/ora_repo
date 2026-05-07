import React from 'react';
import LibraryAdminCrudPage from '../../../../components/library/LibraryAdminCrudPage.jsx';
import { createLibraryCategory, deleteLibraryCategory, getLibraryCategories, updateLibraryCategory } from '../../../../api/library.api.js';

export default function PhysicalSystemAdministratorCategoriesJsx() {
  return (
    <LibraryAdminCrudPage
      title="Physical / System Administrator / Categories"
      subtitle="Manage catalog categories stored in the backend database."
      listFn={getLibraryCategories}
      createFn={createLibraryCategory}
      updateFn={updateLibraryCategory}
      deleteFn={deleteLibraryCategory}
      idKey="category_id"
      fields={[
        { name: 'code', label: 'Code', placeholder: 'HIST' },
        { name: 'name', label: 'Name', placeholder: 'History' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'parent_category_id', label: 'Parent category id', placeholder: 'Optional UUID' },
      ]}
      searchPlaceholder="Search categories..."
    />
  );
}
