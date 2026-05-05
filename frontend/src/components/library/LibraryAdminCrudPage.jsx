import React from 'react';
import ResourcePage from './ResourcePage.jsx';

function inferResource(listFn) {
  const name = listFn?.name || '';
  if (name.includes('MaterialType')) return 'material-types';
  if (name.includes('LibraryCategor')) return 'categories';
  if (name.includes('Publisher')) return 'publishers';
  if (name.includes('Language')) return 'languages';
  if (name.includes('Subject')) return 'subjects';
  if (name.includes('Contributor')) return 'contributors';
  if (name.includes('Branch')) return 'branches';
  if (name.includes('Location')) return 'locations';
  if (name.includes('MemberType')) return 'member-types';
  if (name.includes('User')) return 'members';
  return 'materials';
}

export default function LibraryAdminCrudPage({ title, subtitle, listFn, idKey, fields, searchPlaceholder, columns }) {
  const resource = inferResource(listFn);
  const effectiveColumns = columns || fields.map((f) => ({ key: f.name, label: f.label }));
  return (
    <ResourcePage
      title={title}
      subtitle={subtitle || searchPlaceholder || ''}
      resource={resource}
      idField={idKey}
      fields={fields}
      columns={effectiveColumns}
    />
  );
}
