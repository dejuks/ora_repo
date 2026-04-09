import React from 'react';
import RoleAwareDashboard, { formatCurrency } from '../../../../components/library/RoleAwareDashboard.jsx';

export default function Page() {
  return (
    <RoleAwareDashboard
      title="Physical / Librarian / Dashboard"
      subtitle="Daily circulation operations overview."
      load={(common)=>({ ...common, categories: common.categories || [], contributors: common.contributors || [], activeLoans: (common.loans||[]).filter((row)=> ['active','overdue'].includes(row.status)).length, pendingHolds: (common.holds||[]).filter((row)=> ['queued','ready_for_pickup'].includes(row.status)).length, outstandingFineBalance: (common.fines||[]).reduce((sum,row)=> sum + Math.max(0, Number(row.amount||0)-Number(row.paid_amount||0)-Number(row.waived_amount||0)),0) })}
      statCards={(data)=>[{title:'Active Loans', value:data.activeLoans||0, icon:'fas fa-book-reader', color:'bg-primary', to:'/library/physical/librarian/loans'},{title:'Pending Holds', value:data.pendingHolds||0, icon:'fas fa-bookmark', color:'bg-warning', to:'/library/physical/librarian/holds'},{title:'Outstanding Fines', value:formatCurrency(data.outstandingFineBalance||0), icon:'fas fa-money-bill-wave', color:'bg-danger', to:'/library/physical/librarian/fines'},{title:'Catalog Materials', value:data.materials||0, icon:'fas fa-book', color:'bg-success', to:'/library/physical/librarian/history'}]}
      quickLinks={[{to:'/library/physical/librarian/circulation-desk', label:'Open Circulation Desk', icon:'fas fa-exchange-alt', className:'btn-primary'},{to:'/library/physical/librarian/history', label:'History', icon:'fas fa-history', className:'btn-outline-secondary'}]}
      sections={[]}
    />
  );
}
