import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import CrudModal from '../shared/CrudModal';
import libraryApi from '../../../api/library.api';
import { formatDate, getRows, loadResource, mapBy } from '../shared/libraryHelpers';

const initialForm = { purchase_order_id: '', receipt_number: '', received_date: '', note: '' };

export default function DeliveriesPage() {
  const [rows, setRows] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const purchaseOrderMap = useMemo(() => mapBy(purchaseOrders, 'purchase_order_id'), [purchaseOrders]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [receiptsRes, poRes] = await Promise.all([loadResource('acquisition-receipts'), loadResource('purchase-orders')]);
      setRows(getRows(receiptsRes));
      setPurchaseOrders(getRows(poRes));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);
  const resetForm = () => { setEditingId(''); setForm(initialForm); setIsFormOpen(false); };
  const startCreate = () => { setEditingId(''); setForm(initialForm); setIsFormOpen(true); };
  const edit = (row) => { setEditingId(row.receipt_id); setForm({ ...initialForm, ...row }); setIsFormOpen(true); };
  const save = async (e) => {
    e?.preventDefault?.();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, purchase_order_id: form.purchase_order_id || null };
      if (editingId) {
        await libraryApi.update('acquisition-receipts', editingId, payload);
        setNotice('Delivery receipt updated successfully.');
      } else {
        await libraryApi.create('acquisition-receipts', payload);
        setNotice('Delivery receipt created successfully.');
      }
      resetForm();
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save delivery receipt');
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <section className="content-header"><div className="container-fluid"><h1>Deliveries / Receipts</h1><p className="text-muted mb-0">Register received purchase order deliveries and receiving notes.</p></div></section>
      <section className="content"><div className="container-fluid">
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {notice ? <div className="alert alert-success">{notice}</div> : null}
        <div className="card"><div className="card-header d-flex justify-content-between align-items-center flex-wrap"><h3 className="card-title">Delivery register</h3><button className="btn btn-primary" type="button" onClick={startCreate}>Create Receipt</button></div><div className="card-body table-responsive p-0"><table className="table table-striped table-hover mb-0"><thead><tr><th>Receipt</th><th>PO</th><th>Order date</th><th>Received</th><th>Actions</th></tr></thead><tbody>
          {loading ? <tr><td colSpan="5" className="text-center p-4">Loading...</td></tr> : null}
          {!loading && rows.length===0 ? <tr><td colSpan="5" className="text-center p-4">No delivery receipts found.</td></tr> : null}
          {!loading && rows.map((row)=><tr key={row.receipt_id}><td>{row.receipt_number || '-'}</td><td>{purchaseOrderMap[row.purchase_order_id]?.po_number || '-'}</td><td>{formatDate(purchaseOrderMap[row.purchase_order_id]?.order_date)}</td><td>{formatDate(row.received_date)}</td><td><button className="btn btn-sm btn-primary mr-2" onClick={()=>edit(row)}>Edit</button><button className="btn btn-sm btn-danger" onClick={async()=>{ if(!window.confirm('Delete this receipt?')) return; try { await libraryApi.remove('acquisition-receipts', row.receipt_id); setNotice('Receipt deleted.'); await loadData(); } catch(err){ setError(err?.response?.data?.message || 'Failed to delete receipt'); } }}>Delete</button></td></tr>)}
        </tbody></table></div></div>

        <CrudModal open={isFormOpen} title={editingId ? 'Edit receipt' : 'Create receipt'} onClose={resetForm} footer={<><button type="button" className="btn btn-secondary" onClick={resetForm}>Close</button><button type="button" className="btn btn-primary" disabled={saving} onClick={save}>{saving ? 'Saving...' : editingId ? 'Update' : 'Create'}</button></>}>
          <form onSubmit={save}>
            <div className="form-group"><label>Purchase order</label><select className="form-control" required value={form.purchase_order_id} onChange={(e)=>setForm({...form,purchase_order_id:e.target.value})}><option value="">Select order</option>{purchaseOrders.map((row)=><option key={row.purchase_order_id} value={row.purchase_order_id}>{row.po_number}</option>)}</select></div>
            <div className="form-group"><label>Receipt number</label><input className="form-control" value={form.receipt_number} onChange={(e)=>setForm({...form,receipt_number:e.target.value})} /></div>
            <div className="form-group"><label>Received date</label><input type="date" className="form-control" required value={form.received_date || ''} onChange={(e)=>setForm({...form,received_date:e.target.value})} /></div>
            <div className="form-group"><label>Note</label><textarea className="form-control" rows="3" value={form.note} onChange={(e)=>setForm({...form,note:e.target.value})} /></div>
          </form>
        </CrudModal>
      </div></section>
    </MainLayout>
  );
}
