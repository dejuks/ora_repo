import React, { useEffect, useState } from 'react';
import { Button, Input, PageShell, SectionCard, SimpleTable, Toolbar } from '../../../../components/library/LibraryUi.jsx';
import { searchOpac } from '../../../../api/library.memberLibrarian.js';

export default function MemberDigitalLibraryPage() {
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState([]);

  const load = async (value = '') => {
    const result = await searchOpac(value);
    setRows((result?.rows || []).filter((row) => row.material_type_id === 'mt_ebook' || row.title));
  };

  useEffect(() => { load(''); }, []);

  return (
    <PageShell title="Digital library" subtitle="Browse available digital titles.">
      <SectionCard title="Browse content">
        <Toolbar>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search digital resources" style={{ minWidth: 260 }} />
          <Button onClick={() => load(search)}>Search</Button>
        </Toolbar>
        <SimpleTable rows={rows} columns={[{ key: 'title', label: 'Title' }, { key: 'publication_year', label: 'Year' }, { key: 'call_number', label: 'Call no.' }, { key: 'available_copies', label: 'Copies' }]} emptyText="No digital resources found." />
      </SectionCard>
    </PageShell>
  );
}
