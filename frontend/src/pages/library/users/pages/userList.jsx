import React from "react";
import ResourcePage from "../../../../components/library/ResourcePage.jsx";

export default function LibraryUsersPage() {
  return (
    <ResourcePage
      title="Library Members"
      subtitle="Maintain borrowing profiles, status, branch assignment, and membership expiry."
      resource="members"
      idField="member_id"
      columns={[
        { key: 'member_code', label: 'Member Code' },
        { key: 'user_id', label: 'User' },
        { key: 'member_type_id', label: 'Member Type' },
        { key: 'branch_id', label: 'Branch' },
        { key: 'status', label: 'Status' },
      ]}
      fields={[
        { name: 'user_id', label: 'User UUID' },
        { name: 'member_type_id', label: 'Member Type', type: 'select', resource: 'member-types', valueKey: 'member_type_id', labelKey: 'name' },
        { name: 'member_code', label: 'Member Code' },
        { name: 'branch_id', label: 'Branch', type: 'select', resource: 'branches', valueKey: 'branch_id', labelKey: 'name' },
        { name: 'department', label: 'Department' },
        { name: 'program', label: 'Program' },
        { name: 'admission_year', label: 'Admission Year', type: 'number' },
        { name: 'expiry_date', label: 'Expiry Date', type: 'date' },
        { name: 'status', label: 'Status', type: 'select', options: [{id:'active',name:'Active'},{id:'inactive',name:'Inactive'},{id:'suspended',name:'Suspended'},{id:'expired',name:'Expired'},{id:'blocked',name:'Blocked'}], valueKey:'id', labelKey:'name' },
        { name: 'notes', label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
