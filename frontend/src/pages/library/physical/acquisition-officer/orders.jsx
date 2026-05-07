import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / Acquisition Officer / Orders"
      subtitle="Create and track purchase orders."
      resource="purchase-orders"
      idField="purchase_order_id"
      columns={[{ key: 'po_number', label: 'PO Number' }, { key: 'request_id', label: 'Request' }, { key: 'vendor_id', label: 'Vendor' }, { key: 'order_date', label: 'Order Date' }, { key: 'status', label: 'Status' }]}
      fields={[{ name: 'request_id', label: 'Request', type: 'select', resource: 'acquisition-requests' }, { name: 'vendor_id', label: 'Vendor', type: 'select', resource: 'vendors' }, { name: 'po_number', label: 'PO Number' }, { name: 'order_date', label: 'Order Date', type: 'date' }, { name: 'expected_delivery_date', label: 'Expected Delivery', type: 'date' }, { name: 'total_amount', label: 'Total Amount', type: 'number' }, { name: 'status', label: 'Status' }, { name: 'note', label: 'Note', type: 'textarea' }]}
      readonly={false}
    />
  );
}
