import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input, Message, PageShell, SectionCard, SimpleTable, StatusBadge, Toolbar } from '../../../../components/library/LibraryUi.jsx';
import { createMemberHold, searchOpac } from '../../../../api/library.memberLibrarian.js';

export default function PhysicalMemberOpacPage() {
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const load = async (value = '') => {
    setLoading(true);
    try {
      const result = await searchOpac(value);
      setRows(result?.rows || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load('');
  }, []);

  const filteredRows = useMemo(() => rows, [rows]);

  return (
    <PageShell title="OPAC Search" subtitle="Search the catalog and place a hold on unavailable titles.">
      {message ? <Message kind="success">{message}</Message> : null}
      <SectionCard title="Search catalog">
        <Toolbar>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, author, class number..." style={{ minWidth: 280 }} />
          <Button onClick={() => load(search)}>Search</Button>
          <Button variant="secondary" onClick={() => { setSearch(''); load(''); }}>Reset</Button>
        </Toolbar>
        <SimpleTable
          rows={filteredRows}
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'classification_code', label: 'Class no.' },
            { key: 'call_number', label: 'Call number' },
            { key: 'available_copies', label: 'Available' },
            {
              key: 'status',
              label: 'Availability',
              render: (row) => <StatusBadge status={row.available_copies > 0 ? 'available' : 'queued'} />,
            },
            {
              key: 'action',
              label: 'Action',
              render: (row) => (
                <Button
                  variant="secondary"
                  onClick={async () => {
                    await createMemberHold(row.material_id);
                    setMessage(`Hold placed for ${row.title}.`);
                  }}
                >
                  Place hold
                </Button>
              ),
            },
          ]}
          emptyText={loading ? 'Searching catalog...' : 'No titles found.'}
        />
      </SectionCard>
    </PageShell>
  );
}
