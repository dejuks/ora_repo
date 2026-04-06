import React, { useEffect, useState } from 'react';
import MainLayout from '../../../components/layout/MainLayout.jsx';
import { getLibrarySecurityAlerts } from '../../../api/admin.api';

export default function LibrarySecurityAlertsPage() {
  const [data, setData] = useState({ alerts: [], recent_activity: [], totals: { total: 0, critical: 0, warning: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getLibrarySecurityAlerts();
      setData({
        alerts: res.data?.alerts || [],
        recent_activity: res.data?.recent_activity || [],
        totals: res.data?.totals || { total: 0, critical: 0, warning: 0 },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load security alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const statCard = (title, value, color) => (
    <div className="col-md-4">
      <div className={`small-box ${color}`}>
        <div className="inner"><h3>{value}</h3><p>{title}</p></div>
        <div className="icon"><i className="fas fa-shield-alt" /></div>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <section className="content-header"><div className="container-fluid d-flex justify-content-between align-items-center"><div><h1>Security Alerts</h1><p className="text-muted mb-0">Highlights suspicious delete spikes and failed authorization activity from the library audit log.</p></div><button className="btn btn-outline-secondary" onClick={load}>Refresh</button></div></section>
      <section className="content"><div className="container-fluid">
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <div className="row">
          {statCard('Total alerts', data.totals.total, 'bg-primary')}
          {statCard('Critical alerts', data.totals.critical, 'bg-danger')}
          {statCard('Warning alerts', data.totals.warning, 'bg-warning')}
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Active alerts</h3></div>
          <div className="card-body table-responsive p-0">
            <table className="table table-striped mb-0">
              <thead><tr><th>Level</th><th>Type</th><th>Actor</th><th>Count</th><th>Message</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan="5" className="text-center p-4">Loading...</td></tr> : null}
                {!loading && data.alerts.length === 0 ? <tr><td colSpan="5" className="text-center p-4">No alerts detected.</td></tr> : null}
                {!loading && data.alerts.map((row, idx) => <tr key={`${row.type}-${idx}`}><td className="text-capitalize">{row.level}</td><td>{row.type}</td><td>{row.actor_user_id || '-'}</td><td>{row.count}</td><td>{row.message}</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Recent audit activity</h3></div>
          <div className="card-body table-responsive p-0">
            <table className="table table-sm table-hover mb-0">
              <thead><tr><th>Action</th><th>Entity</th><th>Actor</th><th>Entity ID</th><th>When</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan="5" className="text-center p-4">Loading...</td></tr> : null}
                {!loading && data.recent_activity.map((row, idx) => <tr key={`${row.action}-${idx}`}><td>{row.action}</td><td>{row.entity_type}</td><td>{row.actor_user_id || '-'}</td><td>{row.entity_id || '-'}</td><td>{row.created_at ? new Date(row.created_at).toLocaleString() : ''}</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </div></section>
    </MainLayout>
  );
}
