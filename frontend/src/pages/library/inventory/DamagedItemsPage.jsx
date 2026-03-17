import React from "react";
import ResourcePage from "../../../components/library/ResourcePage.jsx";

export default function DamagedItemsPage() {
  return (
    <ResourcePage
      title="Damaged Items"
      subtitle="Record damaged copies, severity, cost, and repair resolution."
      resource="damage-reports"
      idField="damage_report_id"
      columns={[
        { key: "copy_id", label: "Copy" },
        { key: "severity", label: "Severity" },
        { key: "estimated_cost", label: "Estimated Cost" },
        { key: "resolved", label: "Resolved", render: (row) => (row.resolved ? 'Yes' : 'No') },
      ]}
      fields={[
        { name: "copy_id", label: "Copy", type: "select", resource: "copies", valueKey: "copy_id", labelKey: "accession_number" },
        { name: "loan_id", label: "Loan", type: "select", resource: "loans", valueKey: "loan_id", labelKey: "loan_id" },
        { name: "severity", label: "Severity", type: "select", options: [{ id:'minor',name:'Minor'},{id:'moderate',name:'Moderate'},{id:'severe',name:'Severe'}], valueKey:'id', labelKey:'name' },
        { name: "estimated_cost", label: "Estimated Cost", type: "number" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "resolved", label: "Resolved", type: "checkbox" },
      ]}
    />
  );
}
