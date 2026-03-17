import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import { formatDate, getRows, loadLibraryLookups, loadResource } from '../shared/libraryHelpers';

export default function DigitalAnalyticsPage() {
  const [rows, setRows] = useState([]);
  const [lookups, setLookups] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [logsRes, lookupData] = await Promise.all([loadResource('digital-usage-logs'), loadLibraryLookups()]);
        setRows(getRows(logsRes));
        setLookups(lookupData);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load digital analytics');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const summary = useMemo(() => rows.reduce((acc, row) => {
    acc.total += 1;
    acc[row.action] = (acc[row.action] || 0) + 1;
    return acc;
  }, { total: 0, view: 0, download: 0, preview: 0, denied: 0 }), [rows]);

  return (
    <MainLayout>
      <section className="content-header"><div className="container-fluid"><h1>Digital Analytics</h1><p className="text-muted mb-0">Usage logs for digital resource views, downloads, previews, and denied access.</p></div></section>
      <section className="content"><div className="container-fluid">
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <div className="row">
          {['total','view','download','preview','denied'].map((key)=><div className="col-lg-2 col-md-4" key={key}><div className="small-box bg-info"><div className="inner"><h3>{loading ? '...' : summary[key] || 0}</h3><p>{key === 'total' ? 'Total logs' : key}</p></div></div></div>)}
        </div>
        <div className="card"><div className="card-header"><h3 className="card-title">Usage log register</h3></div><div className="card-body table-responsive p-0"><table className="table table-striped mb-0"><thead><tr><th>Resource</th><th>Member</th><th>Action</th><th>IP</th><th>Date</th></tr></thead><tbody>
          {loading ? <tr><td colSpan="5" className="text-center p-4">Loading...</td></tr> : null}
          {!loading && rows.length===0 ? <tr><td colSpan="5" className="text-center p-4">No usage logs found.</td></tr> : null}
          {!loading && rows.map((row)=><tr key={row.usage_log_id}><td>{lookups?.materialMap[lookups?.digitalResourceMap[row.digital_resource_id]?.material_id]?.title || row.digital_resource_id}</td><td>{lookups?.memberMap[row.member_id]?.member_code || '-'}</td><td>{row.action}</td><td>{row.ip_address || '-'}</td><td>{formatDate(row.created_at, true)}</td></tr>)}
        </tbody></table></div></div>
      </div></section>
    </MainLayout>
  );
}
