import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / Library Manager / Inventory Reports"
      subtitle="Inventory risk and stock report."
      resource="copies"
      idField="copy_id"
      columns={[{ key: 'material_id', label: 'Material' }, { key: 'accession_number', label: 'Accession' }, { key: 'status', label: 'Status' }, { key: 'branch_id', label: 'Branch' }, { key: 'location_id', label: 'Location' }]}
      fields={[]}
      readonly={true}
    />
  );
}
