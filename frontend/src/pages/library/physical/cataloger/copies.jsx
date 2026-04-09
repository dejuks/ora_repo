import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / Cataloger / Copies"
      subtitle="Register and maintain copy-level details."
      resource="copies"
      idField="copy_id"
      columns={[{ key: 'material_id', label: 'Material' }, { key: 'accession_number', label: 'Accession' }, { key: 'barcode', label: 'Barcode' }, { key: 'status', label: 'Status' }, { key: 'branch_id', label: 'Branch' }]}
      fields={[{ name: 'material_id', label: 'Material', type: 'select', resource: 'materials' }, { name: 'branch_id', label: 'Branch', type: 'select', resource: 'branches' }, { name: 'location_id', label: 'Location', type: 'select', resource: 'locations' }, { name: 'accession_number', label: 'Accession Number' }, { name: 'barcode', label: 'Barcode' }, { name: 'rfid_tag', label: 'RFID Tag' }, { name: 'copy_number', label: 'Copy Number', type: 'number' }, { name: 'purchase_price', label: 'Purchase Price', type: 'number' }, { name: 'replacement_cost', label: 'Replacement Cost', type: 'number' }, { name: 'acquisition_date', label: 'Acquisition Date', type: 'date' }, { name: 'condition_note', label: 'Condition Note', type: 'textarea' }, { name: 'status', label: 'Status' }, { name: 'is_circulation_allowed', label: 'Circulation Allowed', type: 'checkbox' }]}
      readonly={false}
    />
  );
}
