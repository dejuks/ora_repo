import React from 'react';
import RoleAwareDashboard, { formatCurrency } from '../../../../components/library/RoleAwareDashboard.jsx';

export default function Page() {
  return (
    <RoleAwareDashboard
      title="Digital / Member / Dashboard"
      subtitle="Browse digital resources available to your membership."
      load={(common)=>({ ...common, myLoans:(common.loans||[]).filter((row)=> row.member_id === common.member?.member_id), myHolds:(common.holds||[]).filter((row)=> row.member_id === common.member?.member_id), myFines:(common.fines||[]).filter((row)=> row.member_id === common.member?.member_id), activeLoans:(common.loans||[]).filter((row)=> row.member_id === common.member?.member_id && ['active','overdue'].includes(row.status)), outstandingBalance:(common.fines||[]).filter((row)=> row.member_id === common.member?.member_id).reduce((sum,row)=> sum + Math.max(0, Number(row.amount||0)-Number(row.paid_amount||0)-Number(row.waived_amount||0)),0), downloadableResources:(common.digitalResources||[]).filter((row)=> row.is_active !== false), downloads:(common.downloads||[]) , collections:(common.collections||[]) })}
      statCards={(data)=>[{title:'Digital Resources', value:data.downloadableResources?.length||0, icon:'fas fa-laptop', color:'bg-primary', to:'/library/digital/member/library'},{title:'Recent Activity', value:data.downloads?.length||0, icon:'fas fa-history', color:'bg-info', to:'/library/digital/member/account'},{title:'Active Loans', value:data.activeLoans?.length||0, icon:'fas fa-book-reader', color:'bg-success', to:'/library/my-loans'},{title:'Outstanding Fines', value:formatCurrency(data.outstandingBalance||0), icon:'fas fa-money-bill-wave', color:'bg-warning', to:'/library/my-fines'}]}
      quickLinks={[{to:'/library/digital/member/library', label:'Digital Library', icon:'fas fa-laptop', className:'btn-primary'},{to:'/library/digital/member/account', label:'Account', icon:'fas fa-user', className:'btn-outline-secondary'}]}
      sections={[]}
    />
  );
}
