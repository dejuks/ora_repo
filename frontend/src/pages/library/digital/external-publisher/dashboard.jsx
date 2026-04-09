import React from 'react';
import RoleAwareDashboard, { formatCurrency } from '../../../../components/library/RoleAwareDashboard.jsx';

export default function Page() {
  return (
    <RoleAwareDashboard
      title="Digital / External Publisher / Dashboard"
      subtitle="Share licensed content packages and track publication handoff."
      load={(common)=>({ ...common })}
      statCards={(data)=>[{title:'Packages', value:data.digitalSubmissions?.length||0, icon:'fas fa-box', color:'bg-primary', to:'/library/digital/external-publisher/packages'},{title:'Publishers', value:data.publishers?.length||0, icon:'fas fa-building', color:'bg-info', to:'/library/digital/external-publisher/packages'},{title:'Active Resources', value:data.digitalResources?.length||0, icon:'fas fa-laptop', color:'bg-success', to:'/library/digital/external-publisher/resources'},{title:'Access Rules', value:data.memberTypes?.length||0, icon:'fas fa-lock', color:'bg-warning', to:'/library/digital/external-publisher/packages'}]}
      quickLinks={[{to:'/library/digital/external-publisher/packages', label:'Packages', icon:'fas fa-boxes', className:'btn-primary'}]}
      sections={[]}
    />
  );
}
