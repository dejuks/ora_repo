import React from "react";
import ResourcePage from "../../../components/library/ResourcePage";

export default function MemberTypesPage() {
  return (
    <ResourcePage
      title="Member Types"
      subtitle="Configure circulation limits and digital access by member type."
      resource="member-types"
      idField="member_type_id"
      columns={[
        { key: "code", label: "Code" },
        { key: "name", label: "Name" },
        { key: "max_active_loans", label: "Max Loans" },
        { key: "max_hold_requests", label: "Max Holds" },
        { key: "loan_period_days", label: "Loan Days" },
        { key: "fine_per_day", label: "Fine / Day" },
        { key: "is_active", label: "Active", render: (row) => (row.is_active ? "Yes" : "No") },
      ]}
      fields={[
        { name: "code", label: "Code" },
        { name: "name", label: "Name" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "max_active_loans", label: "Max Active Loans", type: "number", defaultValue: 3 },
        { name: "max_hold_requests", label: "Max Hold Requests", type: "number", defaultValue: 2 },
        { name: "loan_period_days", label: "Loan Period (Days)", type: "number", defaultValue: 14 },
        { name: "renewal_limit", label: "Renewal Limit", type: "number", defaultValue: 1 },
        { name: "fine_per_day", label: "Fine Per Day", type: "number", defaultValue: 0 },
        { name: "grace_period_days", label: "Grace Period (Days)", type: "number", defaultValue: 0 },
        { name: "can_access_digital", label: "Can Access Digital", type: "checkbox", defaultValue: true },
        { name: "can_download_digital", label: "Can Download Digital", type: "checkbox", defaultValue: true },
        { name: "is_active", label: "Active", type: "checkbox", defaultValue: true },
      ]}
    />
  );
}
