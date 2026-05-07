import React from 'react';
import LibraryAdminCrudPage from '../../../../components/library/LibraryAdminCrudPage.jsx';
import { createLibraryBranch, deleteLibraryBranch, getLibraryBranches, updateLibraryBranch } from '../../../../api/library.api.js';

export default function PhysicalSystemAdministratorBranchesJsx() {
  return (
    <LibraryAdminCrudPage
      title="Physical / System Administrator / Branches"
      subtitle="Manage library branches through the backend API."
      listFn={getLibraryBranches}
      createFn={createLibraryBranch}
      updateFn={updateLibraryBranch}
      deleteFn={deleteLibraryBranch}
      idKey="branch_id"
      fields={[
        { name: 'code', label: 'Code', placeholder: 'MAIN' },
        { name: 'name', label: 'Name', placeholder: 'Main Branch' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'address', label: 'Address' },
        { name: 'phone', label: 'Phone' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'is_active', label: 'Active', type: 'checkbox', defaultValue: true },
      ]}
      searchPlaceholder="Search branches..."
    />
  );
}
