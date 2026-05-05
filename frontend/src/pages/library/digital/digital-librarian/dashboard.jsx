import React from 'react';
import RoleAwareDashboard, { formatCurrency } from '../../../../components/library/RoleAwareDashboard.jsx';

export default function Page() {
  return (
    <RoleAwareDashboard
      title="Digital / Digital Librarian / Dashboard"
      subtitle="Manage digital resources, approvals, access, and analytics."
      load={(common)=>({ ...common, collections: common.collections || [] })}
      statCards={(data)=>[{title:'Digital Resources', value:data.digitalResources?.length||0, icon:'fas fa-laptop', color:'bg-primary', to:'/library/digital/digital-librarian/resources'},{title:'Submissions', value:data.digitalSubmissions?.length||0, icon:'fas fa-upload', color:'bg-info', to:'/library/digital/digital-librarian/approvals'},{title:'Collections', value:data.collections?.length||0, icon:'fas fa-layer-group', color:'bg-success', to:'/library/digital/digital-librarian/collections'},{title:'Publish Queue', value:data.digitalSubmissions?.filter((x)=>['submitted','under_review'].includes(x.status)).length||0, icon:'fas fa-check-circle', color:'bg-warning', to:'/library/digital/digital-librarian/workflow'}]}
      quickLinks={[{to:'/library/digital/digital-librarian/new-resource', label:'New Resource', icon:'fas fa-plus', className:'btn-primary'},{to:'/library/digital/digital-librarian/access', label:'Access Rules', icon:'fas fa-lock', className:'btn-outline-secondary'}]}
      sections={[]}
    />
  );
}
