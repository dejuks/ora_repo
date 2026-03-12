import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "../layout/MainLayout";
import libraryApi from "../../api/library.api";

function getValue(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

function normalizeRows(result) {
  if (Array.isArray(result)) return { rows: result, meta: {} };
  if (result?.rows) return result;
  return { rows: [], meta: {} };
}

export default function ResourcePage({
  title,
  subtitle,
  resource,
  idField,
  columns,
  fields = [],
  loadParams = {},
  readonly = false,
  allowDelete = true,
  extraRowActions = [],
  toolbar = null,
  transformBeforeSave,
  transformRows,
  pageSize = 200,
  onCreate = null,
  onUpdate = null,
}) {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [options, setOptions] = useState({});

  const effectiveIdField = idField || `${resource.replace(/-/g, '_').replace(/s$/, '')}_id`;

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await libraryApi.list(resource, { limit: pageSize, search, ...loadParams });
      const normalized = normalizeRows(transformRows ? transformRows(data) : data);
      setRows(normalized.rows || []);
      setMeta(normalized.meta || {});
    } catch (err) {
      setError(err?.response?.data?.message || `Failed to load ${title}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search]);

  useEffect(() => {
    let mounted = true;
    const loadOptions = async () => {
      const optionFields = fields.filter((f) => f.type === 'select' && f.resource);
      const results = {};
      for (const field of optionFields) {
        try {
          const res = await libraryApi.list(field.resource, { limit: 200 });
          results[field.name] = normalizeRows(res).rows || [];
        } catch {
          results[field.name] = [];
        }
      }
      if (mounted) setOptions(results);
    };
    loadOptions();
    return () => { mounted = false; };
  }, [resource]);

  const beginCreate = () => {
    setEditing(null);
    const initial = {};
    fields.forEach((f) => {
      if (f.defaultValue !== undefined) initial[f.name] = f.defaultValue;
      else if (f.type === 'checkbox') initial[f.name] = false;
      else initial[f.name] = '';
    });
    setForm(initial);
    setNotice('');
  };

  useEffect(() => { if (!readonly && !editing && Object.keys(form).length === 0) beginCreate(); }, [readonly]);

  const beginEdit = (row) => {
    setEditing(row);
    const next = {};
    fields.forEach((f) => {
      next[f.name] = row[f.name] ?? (f.type === 'checkbox' ? false : '');
    });
    setForm(next);
    setNotice('');
  };

  const handleChange = (name, value, type) => {
    setForm((prev) => ({ ...prev, [name]: type === 'number' && value !== '' ? Number(value) : value }));
  };

  const submit = async (e) => {
    e?.preventDefault?.();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const payload = transformBeforeSave ? transformBeforeSave(form, editing) : form;
      if (editing) {
        if (onUpdate) await onUpdate(editing, payload);
        else await libraryApi.update(resource, editing[effectiveIdField], payload);
        setNotice(`${title} updated successfully.`);
      } else {
        if (onCreate) await onCreate(payload);
        else await libraryApi.create(resource, payload);
        setNotice(`${title} created successfully.`);
      }
      beginCreate();
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || `Failed to save ${title}`);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete this ${title.toLowerCase()} record?`)) return;
    try {
      await libraryApi.remove(resource, row[effectiveIdField]);
      setNotice(`${title} deleted successfully.`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || `Failed to delete ${title}`);
    }
  };

  const tableRows = useMemo(() => rows, [rows]);

  return (
    <MainLayout>
      <section className="content-header">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <div>
            <h1>{title}</h1>
            {subtitle ? <p className="text-muted mb-0">{subtitle}</p> : null}
          </div>
          {toolbar}
        </div>
      </section>
      <section className="content">
        <div className="container-fluid">
          {error ? <div className="alert alert-danger">{error}</div> : null}
          {notice ? <div className="alert alert-success">{notice}</div> : null}
          <div className="row">
            {!readonly && fields.length ? (
              <div className="col-lg-4">
                <div className="card card-primary">
                  <div className="card-header">
                    <h3 className="card-title">{editing ? `Edit ${title}` : `New ${title}`}</h3>
                  </div>
                  <form onSubmit={submit}>
                    <div className="card-body">
                      {fields.map((field) => {
                        const value = form[field.name] ?? (field.type === 'checkbox' ? false : '');
                        if (field.type === 'textarea') {
                          return (
                            <div className="form-group" key={field.name}>
                              <label>{field.label}</label>
                              <textarea className="form-control" rows="3" value={value} onChange={(e) => handleChange(field.name, e.target.value)} />
                            </div>
                          );
                        }
                        if (field.type === 'checkbox') {
                          return (
                            <div className="form-group form-check" key={field.name}>
                              <input type="checkbox" className="form-check-input" checked={Boolean(value)} onChange={(e) => handleChange(field.name, e.target.checked)} />
                              <label className="form-check-label">{field.label}</label>
                            </div>
                          );
                        }
                        if (field.type === 'select') {
                          const opts = field.options || options[field.name] || [];
                          return (
                            <div className="form-group" key={field.name}>
                              <label>{field.label}</label>
                              <select className="form-control" value={value} onChange={(e) => handleChange(field.name, e.target.value)}>
                                <option value="">Select {field.label}</option>
                                {opts.map((opt) => {
                                  const optionValue = opt[field.valueKey || field.idField || 'id'] || opt[field.valueKey || field.idField || `${field.resource?.replace(/-/g, '_').replace(/s$/, '')}_id`] || opt.uuid || opt.id;
                                  const optionLabel = field.getOptionLabel ? field.getOptionLabel(opt) : (opt[field.labelKey || 'name'] || opt.title || opt.code || optionValue);
                                  return <option key={optionValue} value={optionValue}>{optionLabel}</option>;
                                })}
                              </select>
                            </div>
                          );
                        }
                        return (
                          <div className="form-group" key={field.name}>
                            <label>{field.label}</label>
                            <input className="form-control" type={field.type || 'text'} value={value} onChange={(e) => handleChange(field.name, e.target.value, field.type)} />
                          </div>
                        );
                      })}
                    </div>
                    <div className="card-footer d-flex justify-content-between">
                      <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
                      {editing ? <button type="button" className="btn btn-secondary" onClick={beginCreate}>Cancel</button> : null}
                    </div>
                  </form>
                </div>
              </div>
            ) : null}
            <div className={readonly || !fields.length ? 'col-12' : 'col-lg-8'}>
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h3 className="card-title mb-0">Records</h3>
                  <div className="input-group" style={{ maxWidth: 320 }}>
                    <input className="form-control" placeholder={`Search ${title.toLowerCase()}`} value={search} onChange={(e) => setSearch(e.target.value)} />
                    <div className="input-group-append">
                      <button className="btn btn-outline-secondary" type="button" onClick={load}>Refresh</button>
                    </div>
                  </div>
                </div>
                <div className="card-body table-responsive p-0">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        {columns.map((column) => <th key={column.key}>{column.label}</th>)}
                        {!readonly || extraRowActions.length ? <th style={{ width: 220 }}>Actions</th> : null}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? <tr><td colSpan={columns.length + 1} className="text-center p-4">Loading...</td></tr> : null}
                      {!loading && tableRows.length === 0 ? <tr><td colSpan={columns.length + 1} className="text-center p-4">No records found.</td></tr> : null}
                      {!loading && tableRows.map((row) => (
                        <tr key={row[effectiveIdField] || row.id}>
                          {columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : String(getValue(row, column.key) ?? '')}</td>)}
                          {!readonly || extraRowActions.length ? (
                            <td>
                              {!readonly && fields.length ? <button className="btn btn-sm btn-primary mr-2" onClick={() => beginEdit(row)}>Edit</button> : null}
                              {!readonly && allowDelete ? <button className="btn btn-sm btn-danger mr-2" onClick={() => remove(row)}>Delete</button> : null}
                              {extraRowActions.map((action) => (
                                <button key={action.label} className={`btn btn-sm ${action.className || 'btn-secondary'} mr-2 mb-1`} onClick={() => action.onClick(row, { reload: load, setError, setNotice })}>
                                  {action.label}
                                </button>
                              ))}
                            </td>
                          ) : null}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="card-footer text-muted">Showing {tableRows.length} record(s){meta?.total ? ` of ${meta.total}` : ''}.</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
