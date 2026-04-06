import React, { useEffect, useState } from 'react';
import MainLayout from '../../../components/layout/MainLayout.jsx';
import libraryApi from '../../../api/library.api';
import { formatCurrency, StatusBadge } from '../shared/libraryHelpers.js';

export default function MyFinesPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const overview = await libraryApi.getMyCirculationOverview();
      setRows(overview?.fines || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load your fines');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  return (
    <MainLayout>
      <section className="content-header"><div className="container-fluid"><h1>My Fines</h1><p className="text-muted mb-0">Review assessed charges, payments, waivers, and outstanding balance.</p></div></section>
      <section className="content"><div className="container-fluid">
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {notice ? <div className="alert alert-success">{notice}</div> : null}
        <div className="card"><div className="card-body table-responsive p-0"><table className="table table-striped mb-0"><thead><tr><th>Reason</th><th>Material</th><th>Copy</th><th>Total</th><th>Paid</th><th>Waived</th><th>Outstanding</th><th>Status</th><th>Action</th></tr></thead><tbody>
          {loading ? <tr><td colSpan="9" className="text-center p-4">Loading...</td></tr> : null}
          {!loading && rows.length===0 ? <tr><td colSpan="9" className="text-center p-4">No fines found.</td></tr> : null}
          {!loading && rows.map((row)=><tr key={row.fine_id}><td>{row.reason}</td><td>{row.material_title || '-'}</td><td>{row.accession_number || '-'}</td><td>{formatCurrency(row.amount)}</td><td>{formatCurrency(row.paid_amount)}</td><td>{formatCurrency(row.waived_amount)}</td><td>{formatCurrency(row.outstanding_amount)}</td><td><StatusBadge status={row.status} /></td><td><button className="btn btn-sm btn-success" disabled={Number(row.outstanding_amount || 0) <= 0} onClick={async()=>{ const amount = window.prompt(`Enter payment amount (outstanding ${row.outstanding_amount})`); if(!amount) return; try { await libraryApi.payFine(row.fine_id,{ amount:Number(amount), payment_method:'manual' }); setNotice('Fine payment recorded successfully.'); await loadData(); } catch(err){ setError(err?.response?.data?.message || 'Failed to record payment'); } }}>Pay</button></td></tr>)}
        </tbody></table></div></div>
      </div></section>
    </MainLayout>
  );
}
