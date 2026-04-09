import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / Library Manager / Policies"
      subtitle="Maintain circulation rules by member and material type."
      resource="circulation-policies"
      idField="policy_id"
      columns={[{ key: 'name', label: 'Policy' }, { key: 'member_type_id', label: 'Member Type' }, { key: 'material_type_id', label: 'Material Type' }, { key: 'loan_period_days', label: 'Loan Days' }, { key: 'is_active', label: 'Active' }]}
      fields={[{ name: 'name', label: 'Policy Name' }, { name: 'member_type_id', label: 'Member Type', type: 'select', resource: 'member-types' }, { name: 'material_type_id', label: 'Material Type', type: 'select', resource: 'material-types' }, { name: 'max_active_loans', label: 'Max Active Loans', type: 'number' }, { name: 'loan_period_days', label: 'Loan Period Days', type: 'number' }, { name: 'renewal_limit', label: 'Renewal Limit', type: 'number' }, { name: 'grace_period_days', label: 'Grace Period Days', type: 'number' }, { name: 'fine_per_day', label: 'Fine Per Day', type: 'number' }, { name: 'max_fine_amount', label: 'Max Fine Amount', type: 'number' }, { name: 'allow_holds', label: 'Allow Holds', type: 'checkbox' }, { name: 'allow_renewal', label: 'Allow Renewal', type: 'checkbox' }, { name: 'allow_reference_checkout', label: 'Allow Reference Checkout', type: 'checkbox' }, { name: 'is_active', label: 'Active', type: 'checkbox' }]}
      readonly={false}
    />
  );
}
