import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Digital / Admin / System Settings"
      subtitle="Digital governance policies and circulation defaults."
      resource="circulation-policies"
      idField="policy_id"
      columns={[{ key: 'name', label: 'Policy' }, { key: 'loan_period_days', label: 'Loan Days' }, { key: 'renewal_limit', label: 'Renewals' }, { key: 'fine_per_day', label: 'Fine / Day' }, { key: 'is_active', label: 'Active' }]}
      fields={[{ name: 'name', label: 'Policy Name' }, { name: 'member_type_id', label: 'Member Type', type: 'select', resource: 'member-types' }, { name: 'material_type_id', label: 'Material Type', type: 'select', resource: 'material-types' }, { name: 'max_active_loans', label: 'Max Active Loans', type: 'number' }, { name: 'loan_period_days', label: 'Loan Period Days', type: 'number' }, { name: 'renewal_limit', label: 'Renewal Limit', type: 'number' }, { name: 'fine_per_day', label: 'Fine Per Day', type: 'number' }, { name: 'is_active', label: 'Active', type: 'checkbox' }]}
      readonly={false}
    />
  );
}
