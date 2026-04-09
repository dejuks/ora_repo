import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / Acquisition Officer / Deliveries"
      subtitle="Log item receipts and delivery notes."
      resource="acquisition-receipts"
      idField="receipt_id"
      columns={[{ key: 'receipt_number', label: 'Receipt No.' }, { key: 'purchase_order_id', label: 'Order' }, { key: 'received_date', label: 'Received Date' }, { key: 'received_by', label: 'Received By' }]}
      fields={[{ name: 'purchase_order_id', label: 'Purchase Order', type: 'select', resource: 'purchase-orders' }, { name: 'receipt_number', label: 'Receipt Number' }, { name: 'received_date', label: 'Received Date', type: 'date' }, { name: 'note', label: 'Note', type: 'textarea' }]}
      readonly={false}
    />
  );
}
