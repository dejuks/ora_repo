import React from 'react';
import LibraryAdminCrudPage from '../../../../components/library/LibraryAdminCrudPage.jsx';
import { createMemberType, deleteMemberType, getMemberTypes, updateMemberType } from '../../../../api/library.api.js';

export default function PhysicalSystemAdministratorMemberTypesJsx() {
  return (
    <LibraryAdminCrudPage
      title="Physical / System Administrator / Member Types"
      subtitle="Manage loan and hold rules per member type using the backend API."
      listFn={getMemberTypes}
      createFn={createMemberType}
      updateFn={updateMemberType}
      deleteFn={deleteMemberType}
      idKey="member_type_id"
      fields={[
        { name: 'code', label: 'Code', placeholder: 'STUDENT' },
        { name: 'name', label: 'Name', placeholder: 'Student' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'max_active_loans', label: 'Max active loans', type: 'number', defaultValue: 3 },
        { name: 'max_hold_requests', label: 'Max holds', type: 'number', defaultValue: 3 },
        { name: 'loan_period_days', label: 'Loan period days', type: 'number', defaultValue: 14 },
        { name: 'renewal_limit', label: 'Renewal limit', type: 'number', defaultValue: 1 },
        { name: 'fine_per_day', label: 'Fine per day', type: 'number', defaultValue: 0 },
        { name: 'grace_period_days', label: 'Grace period days', type: 'number', defaultValue: 0 },
        { name: 'can_access_digital', label: 'Can access digital', type: 'checkbox', defaultValue: true },
        { name: 'can_download_digital', label: 'Can download digital', type: 'checkbox', defaultValue: true },
        { name: 'is_active', label: 'Active', type: 'checkbox', defaultValue: true },
      ]}
      searchPlaceholder="Search member types..."
    />
  );
}
