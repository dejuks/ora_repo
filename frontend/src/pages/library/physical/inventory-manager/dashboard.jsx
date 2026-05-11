import React from 'react';
import RoleAwareDashboard, { formatCurrency } from '../../../../components/library/RoleAwareDashboard.jsx';

export default function Page() {
  return (
    <RoleAwareDashboard
      title="Physical / Inventory Manager / Dashboard"
      subtitle="Monitor copies, audits, damage, and missing items."
      load={(common)=>({ ...common })}
      statCards={(data)=>[{title:'Copies', value:data.copies?.length||0, icon:'fas fa-copy', color:'bg-primary', to:'/library/physical/inventory-manager/report'},{title:'Audits', value:data.audits?.length||0, icon:'fas fa-clipboard-check', color:'bg-info', to:'/library/physical/inventory-manager/audits'},{title:'Damage Reports', value:data.damageReports?.length||0, icon:'fas fa-exclamation-triangle', color:'bg-danger', to:'/library/physical/inventory-manager/damaged-items'},{title:'Lost Reports', value:data.lostReports?.length||0, icon:'fas fa-question-circle', color:'bg-warning', to:'/library/physical/inventory-manager/missing-items'}]}
      quickLinks={[{to:'/library/physical/inventory-manager/audits', label:'Inventory Audits', icon:'fas fa-clipboard-check', className:'btn-primary'},{to:'/library/physical/inventory-manager/report', label:'Inventory Report', icon:'fas fa-chart-bar', className:'btn-outline-secondary'}]}
      sections={[]}
    />
  );
}
