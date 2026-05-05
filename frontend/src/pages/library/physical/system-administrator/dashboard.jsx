import React from 'react';
import RoleAwareDashboard, { formatCurrency } from '../../../../components/library/RoleAwareDashboard.jsx';

export default function Page() {
  return (
    <RoleAwareDashboard
      title="Physical / System Administrator / Dashboard"
      subtitle="Configure users, roles, settings, and master data."
      load={(common)=>({ ...common })}
      statCards={(data)=>[{title:'Members', value:data.users?.length||0, icon:'fas fa-users', color:'bg-primary', to:'/library/physical/system-administrator/users'},{title:'Audit Logs', value:data.auditLogs?.length||0, icon:'fas fa-clipboard-list', color:'bg-info', to:'/library/physical/system-administrator/audit-logs'},{title:'Member Types', value:data.memberTypes?.length||0, icon:'fas fa-id-badge', color:'bg-success', to:'/library/physical/system-administrator/member-types'},{title:'Branches', value:data.branches?.length||0, icon:'fas fa-code-branch', color:'bg-warning', to:'/library/physical/system-administrator/branches'}]}
      quickLinks={[{to:'/library/physical/system-administrator/users', label:'Users', icon:'fas fa-users-cog', className:'btn-primary'},{to:'/library/physical/system-administrator/material-types', label:'Material Types', icon:'fas fa-tags', className:'btn-outline-secondary'},{to:'/library/physical/system-administrator/system-settings', label:'System Settings', icon:'fas fa-cogs', className:'btn-outline-dark'}]}
      sections={[]}
    />
  );
}
