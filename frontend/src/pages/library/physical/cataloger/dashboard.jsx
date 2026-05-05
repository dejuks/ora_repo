import React from 'react';
import RoleAwareDashboard, { formatCurrency } from '../../../../components/library/RoleAwareDashboard.jsx';

export default function Page() {
  return (
    <RoleAwareDashboard
      title="Physical / Cataloger / Dashboard"
      subtitle="Create and maintain catalog records, metadata, and copy assignments."
      load={(common)=>({ ...common, materialTypes: common.materialTypes||[], categories: common.categories||[], contributors: common.contributors||[] })}
      statCards={(data)=>[{title:'Catalog Records', value:data.materials?.length||0, icon:'fas fa-book', color:'bg-primary', to:'/library/physical/cataloger/catalog-records'},{title:'Material Types', value:data.materialTypes?.length||0, icon:'fas fa-tags', color:'bg-info', to:'/library/settings/material-types'},{title:'Categories', value:data.categories?.length||0, icon:'fas fa-folder', color:'bg-success', to:'/library/settings/categories'},{title:'Contributors', value:data.contributors?.length||0, icon:'fas fa-user-edit', color:'bg-warning', to:'/library/physical/system-administrator/contributors'}]}
      quickLinks={[{to:'/library/physical/cataloger/new-record', label:'New Record', icon:'fas fa-plus', className:'btn-primary'},{to:'/library/physical/cataloger/copies', label:'Manage Copies', icon:'fas fa-copy', className:'btn-outline-secondary'}]}
      sections={[]}
    />
  );
}
