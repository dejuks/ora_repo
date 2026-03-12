import React from "react";
import ResourcePage from "../../../components/library/ResourcePage";

export default function PoliciesPage() {
  return (
    <ResourcePage
      title="Circulation Policies"
      subtitle="Control loan periods, holds, renewals, and fine rules by member and material type."
      resource="circulation-policies"
      idField="policy_id"
      columns={[
        { key: "name", label: "Policy" },
        { key: "member_type_id", label: "Member Type" },
        { key: "material_type_id", label: "Material Type" },
        { key: "loan_period_days", label: "Loan Days" },
        { key: "renewal_limit", label: "Renewals" },
        { key: "fine_per_day", label: "Fine / Day" },
      ]}
      fields={[
        { name: "name", label: "Policy Name" },
        { name: "member_type_id", label: "Member Type", type: "select", resource: "member-types", valueKey: "member_type_id", labelKey: "name" },
        { name: "material_type_id", label: "Material Type", type: "select", resource: "material-types", valueKey: "material_type_id", labelKey: "name" },
        { name: "max_active_loans", label: "Max Active Loans", type: "number" },
        { name: "loan_period_days", label: "Loan Period Days", type: "number" },
        { name: "renewal_limit", label: "Renewal Limit", type: "number" },
        { name: "grace_period_days", label: "Grace Period Days", type: "number" },
        { name: "fine_per_day", label: "Fine Per Day", type: "number" },
        { name: "allow_holds", label: "Allow Holds", type: "checkbox", defaultValue: true },
        { name: "allow_renewal", label: "Allow Renewal", type: "checkbox", defaultValue: true },
        { name: "allow_reference_checkout", label: "Allow Reference Checkout", type: "checkbox" },
        { name: "is_active", label: "Active", type: "checkbox", defaultValue: true },
      ]}
    />
  );
}
