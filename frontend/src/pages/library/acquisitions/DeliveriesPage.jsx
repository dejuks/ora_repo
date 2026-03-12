import React from "react";
import ResourcePage from "../../../components/library/ResourcePage";

export default function DeliveriesPage() {
  return (
    <ResourcePage
      title="Deliveries"
      subtitle="Capture received purchase order deliveries and receiving notes."
      resource="acquisition-receipts"
      idField="receipt_id"
      columns={[
        { key: "receipt_number", label: "Receipt Number" },
        { key: "purchase_order_id", label: "PO" },
        { key: "received_date", label: "Received Date" },
        { key: "received_by", label: "Received By" },
      ]}
      fields={[
        { name: "purchase_order_id", label: "Purchase Order", type: "select", resource: "purchase-orders", valueKey: "purchase_order_id", labelKey: "po_number" },
        { name: "receipt_number", label: "Receipt Number" },
        { name: "received_date", label: "Received Date", type: "date" },
        { name: "note", label: "Note", type: "textarea" },
      ]}
    />
  );
}
