import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / Inventory Manager / Tags"
      subtitle="Review barcode and RFID coverage across copies."
      resource="copies"
      idField="copy_id"
      columns={[{ key: 'accession_number', label: 'Accession' }, { key: 'barcode', label: 'Barcode' }, { key: 'rfid_tag', label: 'RFID Tag' }, { key: 'status', label: 'Status' }, { key: 'branch_id', label: 'Branch' }]}
      fields={[{ name: 'barcode', label: 'Barcode' }, { name: 'rfid_tag', label: 'RFID Tag' }]}
      readonly={false}
    />
  );
}
