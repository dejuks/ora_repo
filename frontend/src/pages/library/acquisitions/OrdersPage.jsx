import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../../components/layout/MainLayout.jsx';
import CrudModal from '../shared/CrudModal.jsx';
import libraryApi from '../../../api/library.api';
import { formatCurrency, formatDate, getRows, loadResource, mapBy, StatusBadge } from '../shared/libraryHelpers.js';

const initialForm = { request_id: '', vendor_id: '', po_number: '', order_date: '', expected_delivery_date: '', total_amount: '', status: 'draft', note: '' };
const initialReceiveForm = { receipt_number: '', received_date: new Date().toISOString().slice(0, 10), note: '' };
const statuses = ['draft', 'approved', 'sent', 'partially_received', 'received', 'cancelled'];

export default function OrdersPage() {
  const [rows, setRows] = useState([]);
  const [requests, setRequests] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [receiveModal, setReceiveModal] = useState(false);
  const [receiveTarget, setReceiveTarget] = useState(null);
  const [receiveForm, setReceiveForm] = useState(initialReceiveForm);
  const [receiving, setReceiving] = useState(false);

  const requestMap = useMemo(() => mapBy(requests, 'request_id'), [requests]);
  const vendorMap = useMemo(() => mapBy(vendors, 'vendor_id'), [vendors]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [ordersRes, requestsRes, vendorsRes] = await Promise.all([
        loadResource('purchase-orders'),
        loadResource('acquisition-requests'),
        loadResource('vendors'),
      ]);
      setRows(getRows(ordersRes));
      setRequests(getRows(requestsRes));
      setVendors(getRows(vendorsRes));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);
  const resetForm = () => { setEditingId(''); setForm(initialForm); setIsFormOpen(false); };
  const startCreate = () => { setEditingId(''); setForm(initialForm); setIsFormOpen(true); };
  const edit = (row) => { setEditingId(row.purchase_order_id); setForm({ ...initialForm, ...row, total_amount: row.total_amount || '' }); setIsFormOpen(true); };

  const openReceive = (row) => {
    setReceiveTarget(row);
    setReceiveForm({ ...initialReceiveForm, receipt_number: `${row.po_number}-RCV` });
    setReceiveModal(true);
  };

  const save = async (e) => {
    e?.preventDefault?.();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, request_id: form.request_id || null, vendor_id: form.vendor_id || null, total_amount: form.total_amount === '' ? null : Number(form.total_amount) };
      if (editingId) {
        await libraryApi.update('purchase-orders', editingId, payload);
        setNotice('Purchase order updated successfully.');
      } else {
        await libraryApi.create('purchase-orders', payload);
        setNotice('Purchase order created successfully.');
      }
      resetForm();
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save purchase order');
    } finally {
      setSaving(false);
    }
  };

  const receiveOrder = async (e) => {
    e?.preventDefault?.();
    if (!receiveTarget) return;
    setReceiving(true);
    setError('');
    try {
      await libraryApi.receivePurchaseOrder(receiveTarget.purchase_order_id, receiveForm);
      setNotice('Purchase order received successfully.');
      setReceiveModal(false);
      setReceiveTarget(null);
      setReceiveForm(initialReceiveForm);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to receive purchase order');
    } finally {
      setReceiving(false);
    }
  };

  return (
    <MainLayout>
      <section className="content-header"><div className="container-fluid"><h1>Purchase Orders</h1><p className="text-muted mb-0">Create vendor orders from approved acquisition requests and track delivery state.</p></div></section>
      <section className="content"><div className="container-fluid">
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {notice ? <div className="alert alert-success">{notice}</div> : null}
        <div className="card"><div className="card-header d-flex justify-content-between align-items-center flex-wrap"><h3 className="card-title">Order register</h3><button className="btn btn-primary" type="button" onClick={startCreate}>Create Order</button></div><div className="card-body table-responsive p-0"><table className="table table-striped table-hover mb-0"><thead><tr><th>PO</th><th>Request</th><th>Vendor</th><th>Amount</th><th>Status</th><th>Delivery</th><th>Actions</th></tr></thead><tbody>
          {loading ? <tr><td colSpan="7" className="text-center p-4">Loading...</td></tr> : null}
          {!loading && rows.length===0 ? <tr><td colSpan="7" className="text-center p-4">No purchase orders found.</td></tr> : null}
          {!loading && rows.map((row)=><tr key={row.purchase_order_id}><td><div className="font-weight-bold">{row.po_number}</div><small className="text-muted">{formatDate(row.order_date)}</small></td><td>{requestMap[row.request_id]?.title || '-'}</td><td>{vendorMap[row.vendor_id]?.name || '-'}</td><td>{formatCurrency(row.total_amount)}</td><td><StatusBadge status={row.status} /></td><td>{formatDate(row.expected_delivery_date)}</td><td><button className="btn btn-sm btn-success mr-2" disabled={['received','cancelled'].includes(String(row.status || '').toLowerCase())} onClick={()=>openReceive(row)}>Receive</button><button className="btn btn-sm btn-primary mr-2" onClick={()=>edit(row)}>Edit</button><button className="btn btn-sm btn-danger" onClick={async()=>{ if(!window.confirm('Delete this purchase order?')) return; try { await libraryApi.remove('purchase-orders', row.purchase_order_id); setNotice('Purchase order deleted.'); await loadData(); } catch(err){ setError(err?.response?.data?.message || 'Failed to delete purchase order'); } }}>Delete</button></td></tr>)}
        </tbody></table></div></div>

        <CrudModal open={isFormOpen} title={editingId ? 'Edit order' : 'Create order'} onClose={resetForm} footer={<><button type="button" className="btn btn-secondary" onClick={resetForm}>Close</button><button type="button" className="btn btn-primary" disabled={saving} onClick={save}>{saving ? 'Saving...' : editingId ? 'Update' : 'Create'}</button></>}>
          <form onSubmit={save}>
            <div className="form-group"><label>Acquisition request</label><select className="form-control" value={form.request_id} onChange={(e)=>setForm({...form,request_id:e.target.value})}><option value="">Select request</option>{requests.filter((r)=>['approved','ordered'].includes(r.status)).map((row)=><option key={row.request_id} value={row.request_id}>{row.title}</option>)}</select></div>
            <div className="form-group"><label>Vendor</label><select className="form-control" value={form.vendor_id} onChange={(e)=>setForm({...form,vendor_id:e.target.value})}><option value="">Select vendor</option>{vendors.map((row)=><option key={row.vendor_id} value={row.vendor_id}>{row.name}</option>)}</select></div>
            <div className="form-group"><label>PO number</label><input className="form-control" required value={form.po_number} onChange={(e)=>setForm({...form,po_number:e.target.value})} /></div>
            <div className="form-row"><div className="form-group col-md-6"><label>Order date</label><input type="date" className="form-control" value={form.order_date || ''} onChange={(e)=>setForm({...form,order_date:e.target.value})} /></div><div className="form-group col-md-6"><label>Expected delivery</label><input type="date" className="form-control" value={form.expected_delivery_date || ''} onChange={(e)=>setForm({...form,expected_delivery_date:e.target.value})} /></div></div>
            <div className="form-row"><div className="form-group col-md-6"><label>Total amount</label><input type="number" min="0" step="0.01" className="form-control" value={form.total_amount} onChange={(e)=>setForm({...form,total_amount:e.target.value})} /></div><div className="form-group col-md-6"><label>Status</label><select className="form-control" value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})}>{statuses.map((s)=><option key={s} value={s}>{s.replaceAll('_',' ')}</option>)}</select></div></div>
            <div className="form-group"><label>Note</label><textarea className="form-control" rows="3" value={form.note} onChange={(e)=>setForm({...form,note:e.target.value})} /></div>
          </form>
        </CrudModal>

        <CrudModal open={receiveModal} title="Receive Purchase Order" onClose={() => setReceiveModal(false)} size="md" footer={<><button type="button" className="btn btn-secondary" onClick={() => setReceiveModal(false)}>Close</button><button type="button" className="btn btn-success" disabled={receiving} onClick={receiveOrder}>{receiving ? 'Receiving...' : 'Confirm Receive'}</button></>}>
          <form onSubmit={receiveOrder}>
            <p className="mb-3"><strong>{receiveTarget?.po_number}</strong> will be received. If you do not pass item lines, the backend receives all outstanding quantities.</p>
            <div className="form-group"><label>Receipt number</label><input className="form-control" value={receiveForm.receipt_number} onChange={(e)=>setReceiveForm({...receiveForm,receipt_number:e.target.value})} /></div>
            <div className="form-group"><label>Received date</label><input type="date" className="form-control" value={receiveForm.received_date} onChange={(e)=>setReceiveForm({...receiveForm,received_date:e.target.value})} required /></div>
            <div className="form-group"><label>Note</label><textarea className="form-control" rows="3" value={receiveForm.note} onChange={(e)=>setReceiveForm({...receiveForm,note:e.target.value})} placeholder="Optional receiving note" /></div>
          </form>
        </CrudModal>
      </div></section>
    </MainLayout>
  );
}
