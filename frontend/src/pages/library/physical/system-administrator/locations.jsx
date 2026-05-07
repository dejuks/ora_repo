import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / System Administrator / Locations"
      subtitle="Manage shelves, rooms, racks, and physical storage locations."
      resource="locations"
      idField="location_id"
      columns={[{ key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }, { key: 'branch_id', label: 'Branch' }, { key: 'location_type', label: 'Type' }, { key: 'is_active', label: 'Active' }]}
      fields={[{ name: 'branch_id', label: 'Branch', type: 'select', resource: 'branches' }, { name: 'parent_location_id', label: 'Parent Location', type: 'select', resource: 'locations' }, { name: 'code', label: 'Code' }, { name: 'name', label: 'Name' }, { name: 'location_type', label: 'Location Type' }, { name: 'description', label: 'Description', type: 'textarea' }, { name: 'is_active', label: 'Active', type: 'checkbox' }]}
    />
  );
}
