import React from 'react';
import RoleAwareDashboard, { formatCurrency } from '../../../../components/library/RoleAwareDashboard.jsx';

export default function Page() {
  return (
    <RoleAwareDashboard
      title="Physical / Acquisition Officer / Dashboard"
      subtitle="Track requests, orders, vendors, and deliveries."
      load={(common)=>({ ...common })}
      statCards={(data)=>[{title:'Requests', value:data.acquisitionRequests?.length||0, icon:'fas fa-file-alt', color:'bg-primary', to:'/library/physical/acquisition-officer/requests'},{title:'Orders', value:data.purchaseOrders?.length||0, icon:'fas fa-shopping-cart', color:'bg-info', to:'/library/physical/acquisition-officer/orders'},{title:'Deliveries', value:data.deliveries?.length||0, icon:'fas fa-truck', color:'bg-success', to:'/library/physical/acquisition-officer/deliveries'},{title:'Vendors', value:data.vendors?.length||0, icon:'fas fa-building', color:'bg-warning', to:'/library/physical/acquisition-officer/vendors'}]}
      quickLinks={[{to:'/library/physical/acquisition-officer/requests', label:'Requests', icon:'fas fa-list', className:'btn-primary'},{to:'/library/physical/acquisition-officer/vendors', label:'Vendors', icon:'fas fa-building', className:'btn-outline-secondary'}]}
      sections={[]}
    />
  );
}
