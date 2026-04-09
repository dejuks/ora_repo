import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / Acquisition Officer / Vendors"
      subtitle="Manage supplier and vendor records."
      resource="vendors"
      idField="vendor_id"
      columns={[{ key: 'name', label: 'Name' }, { key: 'contact_person', label: 'Contact' }, { key: 'email', label: 'Email' }, { key: 'phone', label: 'Phone' }, { key: 'is_active', label: 'Active' }]}
      fields={[{ name: 'name', label: 'Name' }, { name: 'contact_person', label: 'Contact Person' }, { name: 'email', label: 'Email' }, { name: 'phone', label: 'Phone' }, { name: 'address', label: 'Address', type: 'textarea' }, { name: 'website', label: 'Website' }, { name: 'tax_id', label: 'Tax ID' }, { name: 'is_active', label: 'Active', type: 'checkbox' }]}
      readonly={false}
    />
  );
}
