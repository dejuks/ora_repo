import React from 'react';
import RoleAwareDashboard, { formatCurrency } from '../../../../components/library/RoleAwareDashboard.jsx';

export default function Page() {
  return (
    <RoleAwareDashboard
      title="Physical / Library Manager / Dashboard"
      subtitle="Management overview, policy monitoring, and reports."
      load={(common)=>({ ...common })}
      statCards={(data)=>[{title:'Members', value:data.members?.length||0, icon:'fas fa-users', color:'bg-primary', to:'/library/account'},{title:'Materials', value:data.materials?.length||0, icon:'fas fa-book', color:'bg-info', to:'/library/physical/library-manager/usage-reports'},{title:'Active Loans', value:data.loans?.filter((row)=>['active','overdue'].includes(row.status)).length||0, icon:'fas fa-book-reader', color:'bg-success', to:'/library/physical/library-manager/loan-reports'},{title:'Inventory Alerts', value:(data.damageReports?.length||0)+(data.lostReports?.length||0), icon:'fas fa-bell', color:'bg-warning', to:'/library/physical/library-manager/inventory-reports'}]}
      quickLinks={[{to:'/library/physical/library-manager/policies', label:'Policies', icon:'fas fa-gavel', className:'btn-primary'},{to:'/library/physical/library-manager/usage-reports', label:'Usage Reports', icon:'fas fa-chart-line', className:'btn-outline-secondary'}]}
      sections={[]}
    />
  );
}
