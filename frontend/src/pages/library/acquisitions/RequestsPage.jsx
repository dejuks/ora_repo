import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../../components/layout/MainLayout.jsx';
import CrudModal from '../shared/CrudModal.jsx';
import libraryApi from '../../../api/library.api';
import { formatCurrency, formatDate, getRows, loadResource, mapBy, StatusBadge } from '../shared/libraryHelpers.js';

const initialForm = {
  material_type_id: '',
  title: '',
  author_text: '',
  publisher_text: '',
  publication_year: '',
  isbn: '',
  quantity: 1,
  estimated_price: '',
  justification: '',
};

export default function RequestsPage() {
  const [rows, setRows] = useState([]);
  const [materialTypes, setMaterialTypes] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const materialTypeMap = useMemo(() => mapBy(materialTypes, 'material_type_id'), [materialTypes]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [requestsRes, materialTypesRes] = await Promise.all([
        loadResource('acquisition-requests'),
        loadResource('material-types'),
      ]);
      setRows(getRows(requestsRes));
      setMaterialTypes(getRows(materialTypesRes));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load acquisition requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const startCreate = () => {
    setEditingId('');
    setForm(initialForm);
    setIsFormOpen(true);
    setNotice('');
    setError('');
  };

  const startEdit = (row) => {
    setEditingId(row.request_id);
    setForm({
      material_type_id: row.material_type_id || '',
      title: row.title || '',
      author_text: row.author_text || '',
      publisher_text: row.publisher_text || '',
      publication_year: row.publication_year || '',
      isbn: row.isbn || '',
      quantity: row.quantity || 1,
      estimated_price: row.estimated_price || '',
      justification: row.justification || '',
    });
    setIsFormOpen(true);
    setNotice('');
    setError('');
  };

  const resetForm = () => {
    setEditingId('');
    setForm(initialForm);
    setIsFormOpen(false);
  };

  const save = async (e) => {
    e?.preventDefault?.();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const payload = {
        ...form,
        publication_year: form.publication_year ? Number(form.publication_year) : null,
        quantity: Number(form.quantity || 1),
        estimated_price: form.estimated_price === '' ? null : Number(form.estimated_price),
        material_type_id: form.material_type_id || null,
      };
      if (editingId) {
        await libraryApi.update('acquisition-requests', editingId, payload);
        setNotice('Acquisition request updated successfully.');
      } else {
        await libraryApi.create('acquisition-requests', payload);
        setNotice('Acquisition request created successfully.');
      }
      resetForm();
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save acquisition request');
    } finally {
      setSaving(false);
    }
  };

  const submitRequest = async (row) => {
    try {
      await libraryApi.submitAcquisitionRequest(row.request_id);
      setNotice('Request submitted for approval.');
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit request');
    }
  };

  return (
    <MainLayout>
      <section className="content-header"><div className="container-fluid"><h1>Acquisition Requests</h1><p className="text-muted mb-0">Create and track title requests before procurement and ordering.</p></div></section>
      <section className="content"><div className="container-fluid">
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {notice ? <div className="alert alert-success">{notice}</div> : null}

        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center flex-wrap">
            <h3 className="card-title">Request register</h3>
            <button className="btn btn-primary" type="button" onClick={startCreate}>Create Request</button>
          </div>
          <div className="card-body table-responsive p-0">
            <table className="table table-striped table-hover mb-0">
              <thead><tr><th>Title</th><th>Type</th><th>Qty</th><th>Estimated</th><th>Status</th><th>Submitted</th><th style={{ width: 170 }}>Actions</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan="7" className="text-center p-4">Loading...</td></tr> : null}
                {!loading && rows.length === 0 ? <tr><td colSpan="7" className="text-center p-4">No requests found.</td></tr> : null}
                {!loading && rows.map((row) => (
                  <tr key={row.request_id}>
                    <td><div className="font-weight-bold">{row.title}</div><small className="text-muted">{row.author_text || '-'}</small></td>
                    <td>{materialTypeMap[row.material_type_id]?.name || '-'}</td>
                    <td>{row.quantity}</td>
                    <td>{formatCurrency(row.estimated_price)}</td>
                    <td><StatusBadge status={row.status} /></td>
                    <td>{formatDate(row.submitted_at || row.created_at, true)}</td>
                    <td>
                      <button className="btn btn-sm btn-primary mr-2 mb-1" onClick={() => startEdit(row)} disabled={!['draft', 'submitted'].includes(row.status)}>Edit</button>
                      <button className="btn btn-sm btn-success mb-1" onClick={() => submitRequest(row)} disabled={row.status !== 'draft'}>Submit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <CrudModal
          open={isFormOpen}
          title={editingId ? 'Edit request' : 'Create request'}
          onClose={resetForm}
          footer={<><button type="button" className="btn btn-secondary" onClick={resetForm}>Close</button><button type="button" className="btn btn-primary" disabled={saving} onClick={save}>{saving ? 'Saving...' : editingId ? 'Update' : 'Create'}</button></>}
        >
          <form onSubmit={save}>
            <div className="form-group"><label>Material type</label><select className="form-control" value={form.material_type_id} onChange={(e) => setForm({ ...form, material_type_id: e.target.value })}><option value="">Select type</option>{materialTypes.map((row) => <option key={row.material_type_id} value={row.material_type_id}>{row.name}</option>)}</select></div>
            <div className="form-group"><label>Title</label><input className="form-control" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="form-group"><label>Author</label><input className="form-control" value={form.author_text} onChange={(e) => setForm({ ...form, author_text: e.target.value })} /></div>
            <div className="form-group"><label>Publisher</label><input className="form-control" value={form.publisher_text} onChange={(e) => setForm({ ...form, publisher_text: e.target.value })} /></div>
            <div className="form-row">
              <div className="form-group col-md-6"><label>Publication year</label><input type="number" className="form-control" value={form.publication_year} onChange={(e) => setForm({ ...form, publication_year: e.target.value })} /></div>
              <div className="form-group col-md-6"><label>ISBN</label><input className="form-control" value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group col-md-6"><label>Quantity</label><input type="number" min="1" className="form-control" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
              <div className="form-group col-md-6"><label>Estimated price</label><input type="number" min="0" step="0.01" className="form-control" value={form.estimated_price} onChange={(e) => setForm({ ...form, estimated_price: e.target.value })} /></div>
            </div>
            <div className="form-group"><label>Justification</label><textarea className="form-control" rows="4" value={form.justification} onChange={(e) => setForm({ ...form, justification: e.target.value })} /></div>
          </form>
        </CrudModal>
      </div></section>
    </MainLayout>
  );
}
