import React, { useEffect, useState } from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import libraryApi from '../../../api/library.api';
import { formatDate, StatusBadge } from '../shared/libraryHelpers';

export default function MyHoldsPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const overview = await libraryApi.getMyCirculationOverview();
      setRows(overview?.holds || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load your holds');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  return (
    <MainLayout>
      <section className="content-header"><div className="container-fluid"><h1>My Holds</h1><p className="text-muted mb-0">Monitor queued requests and pickup readiness.</p></div></section>
      <section className="content"><div className="container-fluid">
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {notice ? <div className="alert alert-success">{notice}</div> : null}
        <div className="card"><div className="card-body table-responsive p-0"><table className="table table-striped mb-0"><thead><tr><th>Material</th><th>Copy</th><th>Queue</th><th>Status</th><th>Requested</th><th>Ready</th><th>Action</th></tr></thead><tbody>
          {loading ? <tr><td colSpan="7" className="text-center p-4">Loading...</td></tr> : null}
          {!loading && rows.length===0 ? <tr><td colSpan="7" className="text-center p-4">No holds found.</td></tr> : null}
          {!loading && rows.map((row)=><tr key={row.hold_id}><td>{row.material_title || '-'}</td><td>{row.accession_number || '-'}</td><td>{row.queue_position || '-'}</td><td><StatusBadge status={row.status} /></td><td>{formatDate(row.requested_at, true)}</td><td>{formatDate(row.ready_at, true)}</td><td><button className="btn btn-sm btn-danger" disabled={!['queued','ready_for_pickup'].includes(row.status)} onClick={async()=>{ if(!window.confirm('Cancel this hold request?')) return; try { await libraryApi.cancelHold(row.hold_id, {}); setNotice('Hold cancelled successfully.'); await loadData(); } catch(err){ setError(err?.response?.data?.message || 'Failed to cancel hold'); } }}>Cancel</button></td></tr>)}
        </tbody></table></div></div>
      </div></section>
    </MainLayout>
  );
}
