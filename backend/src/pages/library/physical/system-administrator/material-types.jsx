import React from 'react';
import LibraryAdminCrudPage from '../../../../components/library/LibraryAdminCrudPage.jsx';
import { createMaterialType, deleteMaterialType, getMaterialTypes, updateMaterialType } from '../../../../api/library.api.js';

export default function PhysicalSystemAdministratorMaterialTypesJsx() {
  return (
    <LibraryAdminCrudPage
      title="Physical / System Administrator / Material Types"
      subtitle="Manage physical and digital material type definitions from the backend."
      listFn={getMaterialTypes}
      createFn={createMaterialType}
      updateFn={updateMaterialType}
      deleteFn={deleteMaterialType}
      idKey="material_type_id"
      fields={[
        { name: 'code', label: 'Code', placeholder: 'BOOK' },
        { name: 'name', label: 'Name', placeholder: 'Book' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'is_borrowable', label: 'Borrowable', type: 'checkbox', defaultValue: true },
        { name: 'is_digital_allowed', label: 'Digital allowed', type: 'checkbox', defaultValue: true },
        { name: 'is_physical_allowed', label: 'Physical allowed', type: 'checkbox', defaultValue: true },
      ]}
      searchPlaceholder="Search material types..."
    />
  );
}
