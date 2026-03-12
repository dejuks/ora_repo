import React from "react";
import ResourcePage from "../../../components/library/ResourcePage";

export default function OrdersPage() {
  return (
    <ResourcePage
      title="Purchase Orders"
      subtitle="Manage vendor purchase orders and order fulfillment stages."
      resource="purchase-orders"
      idField="purchase_order_id"
      columns={[
        { key: "po_number", label: "PO Number" },
        { key: "vendor_id", label: "Vendor" },
        { key: "order_date", label: "Order Date" },
        { key: "expected_delivery_date", label: "Expected Delivery" },
        { key: "status", label: "Status" },
      ]}
      fields={[
        { name: "request_id", label: "Acquisition Request", type: "select", resource: "acquisition-requests", valueKey: "request_id", labelKey: "title" },
        { name: "vendor_id", label: "Vendor", type: "select", resource: "vendors", valueKey: "vendor_id", labelKey: "name" },
        { name: "po_number", label: "PO Number" },
        { name: "order_date", label: "Order Date", type: "date" },
        { name: "expected_delivery_date", label: "Expected Delivery", type: "date" },
        { name: "total_amount", label: "Total Amount", type: "number" },
        { name: "status", label: "Status", type: "select", options: [{ id:'draft',name:'Draft'},{id:'approved',name:'Approved'},{id:'sent',name:'Sent'},{id:'partially_received',name:'Partially Received'},{id:'received',name:'Received'}], valueKey:'id', labelKey:'name' },
        { name: "note", label: "Note", type: "textarea" },
      ]}
    />
  );
}
