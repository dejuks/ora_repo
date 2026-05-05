import React from 'react';
import RoleAwareDashboard, { formatCurrency } from '../../../../components/library/RoleAwareDashboard.jsx';

export default function Page() {
  return (
    <RoleAwareDashboard
      title="Digital / Content Uploader / Dashboard"
      subtitle="Prepare digital submissions and submit them for review."
      load={(common)=>({ ...common })}
      statCards={(data)=>[{title:'My Drafts', value:data.digitalSubmissions?.filter((x)=>x.status==='draft').length||0, icon:'fas fa-edit', color:'bg-primary', to:'/library/digital/content-uploader/submissions'},{title:'Submitted', value:data.digitalSubmissions?.filter((x)=>x.status==='submitted').length||0, icon:'fas fa-paper-plane', color:'bg-info', to:'/library/digital/content-uploader/submissions'},{title:'Metadata Queue', value:data.digitalSubmissions?.length||0, icon:'fas fa-tags', color:'bg-success', to:'/library/digital/content-uploader/metadata'},{title:'Approved', value:data.digitalSubmissions?.filter((x)=>['approved','published'].includes(x.status)).length||0, icon:'fas fa-check', color:'bg-warning', to:'/library/digital/content-uploader/resources'}]}
      quickLinks={[{to:'/library/digital/content-uploader/upload', label:'Upload Content', icon:'fas fa-upload', className:'btn-primary'},{to:'/library/digital/content-uploader/submissions', label:'Submissions', icon:'fas fa-list', className:'btn-outline-secondary'}]}
      sections={[]}
    />
  );
}
