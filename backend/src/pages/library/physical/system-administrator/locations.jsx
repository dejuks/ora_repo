import React from 'react';
import LibraryAdminCrudPage from '../../../../components/library/LibraryAdminCrudPage.jsx';
import { createLibraryLocation, deleteLibraryLocation, getLibraryLocations, updateLibraryLocation } from '../../../../api/library.api.js';

export default function PhysicalSystemAdministratorLocationsJsx() {
  return (
    <LibraryAdminCrudPage
      title="Physical / System Administrator / Locations"
      subtitle="Manage physical locations and shelves through the backend API."
      listFn={getLibraryLocations}
      createFn={createLibraryLocation}
      updateFn={updateLibraryLocation}
      deleteFn={deleteLibraryLocation}
      idKey="location_id"
      fields={[
        { name: 'branch_id', label: 'Branch id', placeholder: 'Required branch UUID' },
        { name: 'parent_location_id', label: 'Parent location id' },
        { name: 'code', label: 'Code', placeholder: 'A-01' },
        { name: 'name', label: 'Name', placeholder: 'Shelf A-01' },
        { name: 'location_type', label: 'Type', placeholder: 'room / shelf / section' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'is_active', label: 'Active', type: 'checkbox', defaultValue: true },
      ]}
      searchPlaceholder="Search locations..."
    />
  );
}
