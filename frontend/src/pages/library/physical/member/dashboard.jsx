import React from 'react';
import RoleAwareDashboard, { formatCurrency } from '../../../../components/library/RoleAwareDashboard.jsx';

export default function Page() {
  return (
    <RoleAwareDashboard
      title="Physical / Library Member / Dashboard"
      subtitle="Borrow, renew, and follow your library activity."
      load={(common)=>({ ...common, myLoans:(common.loans||[]).filter((row)=> row.member_id === common.member?.member_id), myHolds:(common.holds||[]).filter((row)=> row.member_id === common.member?.member_id), myFines:(common.fines||[]).filter((row)=> row.member_id === common.member?.member_id), activeLoans:(common.loans||[]).filter((row)=> row.member_id === common.member?.member_id && ['active','overdue'].includes(row.status)), outstandingBalance:(common.fines||[]).filter((row)=> row.member_id === common.member?.member_id).reduce((sum,row)=> sum + Math.max(0, Number(row.amount||0)-Number(row.paid_amount||0)-Number(row.waived_amount||0)),0), downloadableResources:(common.digitalResources||[]).filter((row)=> row.is_active !== false), downloads:(common.downloads||[]) , collections:(common.collections||[]) })}
      statCards={(data)=>[{title:'My Loans', value:data.myLoans?.length||0, icon:'fas fa-book-reader', color:'bg-primary', to:'/library/physical/member/my-loans'},{title:'My Holds', value:data.myHolds?.length||0, icon:'fas fa-bookmark', color:'bg-warning', to:'/library/physical/member/my-holds'},{title:'My Fines', value:formatCurrency(data.outstandingBalance||0), icon:'fas fa-money-bill-wave', color:'bg-danger', to:'/library/physical/member/my-fines'},{title:'Digital Access', value:data.downloadableResources?.length||0, icon:'fas fa-laptop', color:'bg-success', to:'/library/digital/member/library'}]}
      quickLinks={[{to:'/library/physical/member/opac', label:'Browse OPAC', icon:'fas fa-search', className:'btn-outline-primary'},{to:'/library/physical/member/account', label:'My Account', icon:'fas fa-user', className:'btn-outline-secondary'}]}
      sections={[]}
    />
  );
}
