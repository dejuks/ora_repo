import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Digital / Digital Librarian / Resources"
      subtitle="Manage published digital resources and access levels."
      resource="digital-resources"
      idField="digital_resource_id"
      columns={[{ key: 'material_id', label: 'Material' }, { key: 'publisher_id', label: 'Publisher' }, { key: 'access_level', label: 'Access' }, { key: 'is_downloadable', label: 'Downloadable' }, { key: 'is_active', label: 'Active' }]}
      fields={[{ name: 'material_id', label: 'Material', type: 'select', resource: 'materials' }, { name: 'publisher_id', label: 'Publisher', type: 'select', resource: 'publishers' }, { name: 'access_level', label: 'Access Level' }, { name: 'drm_required', label: 'DRM Required', type: 'checkbox' }, { name: 'license_start_date', label: 'License Start', type: 'date' }, { name: 'license_end_date', label: 'License End', type: 'date' }, { name: 'embargo_until', label: 'Embargo Until', type: 'date' }, { name: 'is_downloadable', label: 'Downloadable', type: 'checkbox' }, { name: 'is_streamable', label: 'Streamable', type: 'checkbox' }, { name: 'is_active', label: 'Active', type: 'checkbox' }]}
      readonly={false}
    />
  );
}
