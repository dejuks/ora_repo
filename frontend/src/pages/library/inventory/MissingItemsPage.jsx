import React from "react";
import ResourcePage from "../../../components/library/ResourcePage.jsx";

export default function MissingItemsPage() {
  return (
    <ResourcePage
      title="Missing Items"
      subtitle="Track lost copies and unresolved inventory discrepancies."
      resource="lost-item-reports"
      idField="lost_report_id"
      columns={[
        { key: "copy_id", label: "Copy" },
        { key: "loan_id", label: "Loan" },
        { key: "replacement_cost", label: "Replacement Cost" },
        { key: "resolved", label: "Resolved", render: (row) => (row.resolved ? 'Yes' : 'No') },
      ]}
      fields={[
        { name: "copy_id", label: "Copy", type: "select", resource: "copies", valueKey: "copy_id", labelKey: "accession_number" },
        { name: "loan_id", label: "Loan", type: "select", resource: "loans", valueKey: "loan_id", labelKey: "loan_id" },
        { name: "replacement_cost", label: "Replacement Cost", type: "number" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "resolved", label: "Resolved", type: "checkbox" },
      ]}
    />
  );
}
