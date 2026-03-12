import React, { useEffect, useState } from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import libraryApi from '../../../api/library.api';
import { getCurrentMember } from '../shared/libraryHelpers';

export default function MyHoldsPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    try {
      const me = await getCurrentMember();
      if (!me) {
        setRows([]);
        return;
      }
      const holds = await libraryApi.list('holds', { limit: 500 });
      setRows((holds.rows || []).filter((row) => row.member_id === me.member_id));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load your holds');
    }
  };

  useEffect(() => { load(); }, []);

  const cancelHold = async (row) => {
    if (!window.confirm('Cancel this hold request?')) return;
    try {
      await libraryApi.cancelHold(row.hold_id, {});
      setNotice('Hold cancelled successfully.');
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to cancel hold');
    }
  };

  return (
    <MainLayout>
      <section className="content-header"><div className="container-fluid"><h1>My Holds</h1><p className="text-muted mb-0">Track reservation queue positions and pickup readiness.</p></div></section>
      <section className="content"><div className="container-fluid">
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {notice ? <div className="alert alert-success">{notice}</div> : null}
        <div className="card"><div className="card-body table-responsive p-0"><table className="table table-striped">
          <thead><tr><th>Material</th><th>Status</th><th>Queue</th><th>Requested</th><th>Action</th></tr></thead>
          <tbody>
            {rows.length===0?<tr><td colSpan="5" className="text-center p-4">No holds found.</td></tr>:rows.map((row)=><tr key={row.hold_id}><td>{row.material_id}</td><td>{row.status}</td><td>{row.queue_position}</td><td>{row.requested_at ? new Date(row.requested_at).toLocaleDateString() : ''}</td><td><button className="btn btn-sm btn-danger" disabled={!['queued','ready_for_pickup'].includes(row.status)} onClick={() => cancelHold(row)}>Cancel</button></td></tr>)}
          </tbody></table></div></div>
      </div></section>
    </MainLayout>
  );
}
