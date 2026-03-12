import React from "react";
import ResourcePage from "../../../components/library/ResourcePage";

export default function RequestsPage() {
  return (
    <ResourcePage
      title="Acquisition Requests"
      subtitle="Track proposed purchases and suggestions awaiting procurement processing."
      resource="acquisition-requests"
      idField="request_id"
      columns={[
        { key: "title", label: "Title" },
        { key: "author_text", label: "Author" },
        { key: "quantity", label: "Qty" },
        { key: "estimated_price", label: "Est. Price" },
        { key: "status", label: "Status" },
      ]}
      fields={[
        { name: "title", label: "Title" },
        { name: "author_text", label: "Author" },
        { name: "publisher_text", label: "Publisher" },
        { name: "isbn", label: "ISBN" },
        { name: "quantity", label: "Quantity", type: "number" },
        { name: "estimated_price", label: "Estimated Price", type: "number" },
        { name: "justification", label: "Justification", type: "textarea" },
        { name: "status", label: "Status", type: "select", options: [{ id:'draft',name:'Draft'},{id:'submitted',name:'Submitted'},{id:'approved',name:'Approved'},{id:'rejected',name:'Rejected'},{id:'ordered',name:'Ordered'}], valueKey:'id', labelKey:'name' },
      ]}
    />
  );
}
