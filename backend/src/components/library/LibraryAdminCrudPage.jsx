import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input, Message, PageShell, SectionCard, SimpleTable, Toolbar } from './LibraryUi.jsx';

export default function LibraryAdminCrudPage({
  title,
  subtitle,
  fields,
  listFn,
  createFn,
  updateFn,
  deleteFn,
  idKey,
  searchPlaceholder = 'Search...',
}) {
  const initialForm = useMemo(() => Object.fromEntries(fields.map((field) => [field.name, field.defaultValue ?? ''])), [fields]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await listFn();
      setRows(result?.rows || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { setForm(initialForm); }, [initialForm]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter((row) => fields.some((field) => String(row[field.name] ?? '').toLowerCase().includes(q)));
  }, [rows, search, fields]);

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      setError('');
      setMessage('');
      if (editingId) {
        await updateFn(editingId, form);
        setMessage('Record updated successfully.');
      } else {
        await createFn(form);
        setMessage('Record created successfully.');
      }
      setEditingId(null);
      setForm(initialForm);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to save record.');
    }
  };

  const onEdit = (row) => {
    setEditingId(row[idKey]);
    setForm(Object.fromEntries(fields.map((field) => [field.name, row[field.name] ?? field.defaultValue ?? ''])));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      setError('');
      setMessage('');
      await deleteFn(id);
      setMessage('Record deleted successfully.');
      if (editingId === id) {
        setEditingId(null);
        setForm(initialForm);
      }
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to delete record.');
    }
  };

  return (
    <PageShell title={title} subtitle={subtitle}>
      {message ? <Message kind="success">{message}</Message> : null}
      {error ? <Message kind="error">{error}</Message> : null}

      <SectionCard title={editingId ? 'Edit record' : 'Create record'}>
        <form onSubmit={onSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 16 }}>
            {fields.map((field) => (
              <label key={field.name} style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 13, color: '#4b5563' }}>{field.label}</span>
                {field.type === 'textarea' ? (
                  <textarea
                    value={form[field.name] ?? ''}
                    onChange={(e) => setForm((current) => ({ ...current, [field.name]: e.target.value }))}
                    rows={4}
                    style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8 }}
                  />
                ) : field.type === 'checkbox' ? (
                  <input
                    type="checkbox"
                    checked={Boolean(form[field.name])}
                    onChange={(e) => setForm((current) => ({ ...current, [field.name]: e.target.checked }))}
                    style={{ width: 18, height: 18 }}
                  />
                ) : (
                  <Input
                    type={field.type || 'text'}
                    value={form[field.name] ?? ''}
                    onChange={(e) => setForm((current) => ({ ...current, [field.name]: e.target.value }))}
                    placeholder={field.placeholder || ''}
                  />
                )}
              </label>
            ))}
          </div>
          <Toolbar>
            <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
            <Button type="button" variant="secondary" onClick={() => { setEditingId(null); setForm(initialForm); }}>Clear</Button>
          </Toolbar>
        </form>
      </SectionCard>

      <SectionCard title="Records">
        <Toolbar>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={searchPlaceholder} style={{ minWidth: 280 }} />
          <Button type="button" variant="secondary" onClick={load}>Refresh</Button>
        </Toolbar>
        <SimpleTable
          rows={filteredRows}
          columns={[
            ...fields.slice(0, 4).map((field) => ({
              key: field.name,
              label: field.label,
              render: (row) => field.type === 'checkbox' ? (row[field.name] ? 'Yes' : 'No') : String(row[field.name] ?? '-'),
            })),
            {
              key: '__actions',
              label: 'Actions',
              render: (row) => (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Button type="button" variant="secondary" onClick={() => onEdit(row)}>Edit</Button>
                  <Button type="button" variant="danger" onClick={() => onDelete(row[idKey])}>Delete</Button>
                </div>
              ),
            },
          ]}
          emptyText={loading ? 'Loading records...' : 'No records found.'}
        />
      </SectionCard>
    </PageShell>
  );
}
