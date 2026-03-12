import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../../components/layout/MainLayout';

function normalize(loadResult) {
  if (Array.isArray(loadResult)) return loadResult;
  return loadResult?.data?.rows || loadResult?.rows || loadResult?.data || [];
}

export default function MasterDataPage({
  title,
  loadFn,
  createFn,
  updateFn,
  deleteFn,
  idField,
  nameField = 'name',
  descriptionField = 'description',
  extraFields = [],
}) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ [nameField]: '', [descriptionField]: '' });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');

  const emptyForm = useMemo(() => {
    const next = { [nameField]: '', [descriptionField]: '' };
    extraFields.forEach((field) => {
      next[field.name] = field.defaultValue ?? (field.type === 'checkbox' ? false : '');
    });
    return next;
  }, [nameField, descriptionField, extraFields]);

  const load = async () => {
    try {
      const data = await loadFn();
      setRows(normalize(data));
    } catch (err) {
      setError(err?.response?.data?.message || `Failed to load ${title}`);
    }
  };

  useEffect(() => {
    setForm(emptyForm);
    load();
  }, [emptyForm]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await updateFn(editing[idField], form);
        setNotice(`${title} updated successfully.`);
      } else {
        await createFn(form);
        setNotice(`${title} created successfully.`);
      }
      setEditing(null);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || `Failed to save ${title}`);
    }
  };

  const startEdit = (row) => {
    setEditing(row);
    const next = { [nameField]: row[nameField] || '', [descriptionField]: row[descriptionField] || '' };
    extraFields.forEach((field) => {
      next[field.name] = row[field.name] ?? field.defaultValue ?? (field.type === 'checkbox' ? false : '');
    });
    setForm(next);
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete this ${title.toLowerCase()} record?`)) return;
    try {
      await deleteFn(row[idField]);
      setNotice(`${title} deleted successfully.`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || `Failed to delete ${title}`);
    }
  };

  const filtered = rows.filter((row) => {
    const haystack = `${row[nameField] || ''} ${row[descriptionField] || ''}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  return (
    <MainLayout>
      <section className="content-header"><div className="container-fluid"><h1>{title}</h1><p className="text-muted mb-0">Manage master data used across the library module.</p></div></section>
      <section className="content"><div className="container-fluid">
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {notice ? <div className="alert alert-success">{notice}</div> : null}
        <div className="row">
          <div className="col-lg-4">
            <div className="card card-primary">
              <div className="card-header"><h3 className="card-title">{editing ? `Edit ${title}` : `New ${title}`}</h3></div>
              <form onSubmit={submit}>
                <div className="card-body">
                  <div className="form-group"><label>Name</label><input className="form-control" value={form[nameField] || ''} onChange={(e) => setForm((p) => ({ ...p, [nameField]: e.target.value }))} required /></div>
                  <div className="form-group"><label>Description</label><textarea className="form-control" rows="3" value={form[descriptionField] || ''} onChange={(e) => setForm((p) => ({ ...p, [descriptionField]: e.target.value }))} /></div>
                  {extraFields.map((field) => (
                    field.type === 'checkbox' ? (
                      <div className="form-group form-check" key={field.name}>
                        <input type="checkbox" className="form-check-input" checked={Boolean(form[field.name])} onChange={(e) => setForm((p) => ({ ...p, [field.name]: e.target.checked }))} />
                        <label className="form-check-label">{field.label}</label>
                      </div>
                    ) : (
                      <div className="form-group" key={field.name}>
                        <label>{field.label}</label>
                        <input type={field.type || 'text'} className="form-control" value={form[field.name] || ''} onChange={(e) => setForm((p) => ({ ...p, [field.name]: e.target.value }))} required={field.required} />
                      </div>
                    )
                  ))}
                </div>
                <div className="card-footer d-flex justify-content-between">
                  <button className="btn btn-primary" type="submit">{editing ? 'Update' : 'Create'}</button>
                  {editing ? <button className="btn btn-secondary" type="button" onClick={() => { setEditing(null); setForm(emptyForm); }}>Cancel</button> : null}
                </div>
              </form>
            </div>
          </div>
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h3 className="card-title mb-0">Records</h3>
                <input className="form-control" style={{ maxWidth: 280 }} placeholder={`Search ${title.toLowerCase()}`} value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="card-body table-responsive p-0">
                <table className="table table-striped table-hover">
                  <thead><tr><th>Name</th><th>Description</th>{extraFields.map((field) => <th key={field.name}>{field.label}</th>)}<th>Action</th></tr></thead>
                  <tbody>
                    {filtered.length === 0 ? <tr><td colSpan={3 + extraFields.length} className="text-center p-4">No records found.</td></tr> : filtered.map((row) => (
                      <tr key={row[idField]}>
                        <td>{row[nameField]}</td>
                        <td>{row[descriptionField]}</td>
                        {extraFields.map((field) => <td key={field.name}>{field.type === 'checkbox' ? (row[field.name] ? 'Yes' : 'No') : String(row[field.name] ?? '')}</td>)}
                        <td>
                          <button className="btn btn-sm btn-primary mr-2" onClick={() => startEdit(row)}>Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={() => remove(row)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div></section>
    </MainLayout>
  );
}
