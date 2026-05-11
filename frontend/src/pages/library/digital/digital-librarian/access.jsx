import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Digital / Digital Librarian / Access"
      subtitle="Configure digital access rules by member type."
      resource="digital-access-rules"
      idField="rule_id"
      columns={[{ key: 'digital_resource_id', label: 'Resource' }, { key: 'member_type_id', label: 'Member Type' }, { key: 'allow_view', label: 'View' }, { key: 'allow_download', label: 'Download' }, { key: 'allow_print', label: 'Print' }]}
      fields={[{ name: 'digital_resource_id', label: 'Digital Resource', type: 'select', resource: 'digital-resources' }, { name: 'member_type_id', label: 'Member Type', type: 'select', resource: 'member-types' }, { name: 'allow_view', label: 'Allow View', type: 'checkbox' }, { name: 'allow_download', label: 'Allow Download', type: 'checkbox' }, { name: 'allow_print', label: 'Allow Print', type: 'checkbox' }, { name: 'max_downloads_per_user', label: 'Max Downloads Per User', type: 'number' }, { name: 'note', label: 'Note', type: 'textarea' }]}
      readonly={false}
    />
  );
}
