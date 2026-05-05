import React from 'react';
import ResourcePage from '../../../../components/library/ResourcePage.jsx';

export default function Page() {
  return (
    <ResourcePage
      title="Physical / System Administrator / Member Types"
      subtitle="Configure circulation privileges by membership type."
      resource="member-types"
      idField="member_type_id"
      columns={[{ key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }, { key: 'max_active_loans', label: 'Max Loans' }, { key: 'loan_period_days', label: 'Loan Days' }, { key: 'fine_per_day', label: 'Fine / Day' }]}
      fields={[{ name: 'code', label: 'Code' }, { name: 'name', label: 'Name' }, { name: 'description', label: 'Description', type: 'textarea' }, { name: 'max_active_loans', label: 'Max Active Loans', type: 'number' }, { name: 'max_hold_requests', label: 'Max Holds', type: 'number' }, { name: 'loan_period_days', label: 'Loan Period Days', type: 'number' }, { name: 'renewal_limit', label: 'Renewal Limit', type: 'number' }, { name: 'fine_per_day', label: 'Fine Per Day', type: 'number' }, { name: 'grace_period_days', label: 'Grace Period Days', type: 'number' }, { name: 'can_access_digital', label: 'Can Access Digital', type: 'checkbox' }, { name: 'can_download_digital', label: 'Can Download Digital', type: 'checkbox' }, { name: 'is_active', label: 'Active', type: 'checkbox' }]}
    />
  );
}
