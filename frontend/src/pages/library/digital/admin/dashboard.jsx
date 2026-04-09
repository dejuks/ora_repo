import React from 'react';
import RoleAwareDashboard, { formatCurrency } from '../../../../components/library/RoleAwareDashboard.jsx';

export default function Page() {
  return (
    <RoleAwareDashboard
      title="Digital / Admin / Dashboard"
      subtitle="Manage digital library governance, users, and logs."
      load={(common)=>({ ...common })}
      statCards={(data)=>[{title:'Resources', value:data.digitalResources?.length||0, icon:'fas fa-laptop', color:'bg-primary', to:'/library/digital/admin/resources'},{title:'Audit Logs', value:data.auditLogs?.length||0, icon:'fas fa-clipboard-list', color:'bg-info', to:'/library/digital/admin/audit-logs'},{title:'Members', value:data.users?.length||0, icon:'fas fa-users', color:'bg-success', to:'/library/digital/admin/users'},{title:'Pending Uploads', value:data.digitalSubmissions?.filter((x)=>['submitted','under_review'].includes(x.status)).length||0, icon:'fas fa-upload', color:'bg-warning', to:'/library/digital/admin/approvals'}]}
      quickLinks={[{to:'/library/digital/admin/users', label:'Users', icon:'fas fa-users', className:'btn-primary'},{to:'/library/digital/admin/system-settings', label:'System Settings', icon:'fas fa-cogs', className:'btn-outline-secondary'}]}
      sections={[]}
    />
  );
}
