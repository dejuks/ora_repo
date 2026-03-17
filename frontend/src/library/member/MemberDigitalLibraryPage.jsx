import React, { useEffect, useState } from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import libraryApi from '../../../api/library.api';
import api from '../../../api/api';
import { formatDate } from '../shared/libraryHelpers';

export default function MemberDigitalLibraryPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const base = api.defaults.baseURL || 'http://localhost:5000/api';

  useEffect(() => {
    (async () => {
      try {
        const overview = await libraryApi.getMyCirculationOverview();
        setRows(overview?.digitalResources || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load digital library');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <MainLayout>
      <section className="content-header"><div className="container-fluid"><h1>My Digital Library</h1><p className="text-muted mb-0">Open licensed digital resources available to your membership.</p></div></section>
      <section className="content"><div className="container-fluid">
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <div className="card"><div className="card-body table-responsive p-0"><table className="table table-striped mb-0"><thead><tr><th>Title</th><th>Publisher</th><th>Year</th><th>Access</th><th>License</th><th>Actions</th></tr></thead><tbody>
          {loading ? <tr><td colSpan="6" className="text-center p-4">Loading...</td></tr> : null}
          {!loading && rows.length === 0 ? <tr><td colSpan="6" className="text-center p-4">No digital resources available for your account.</td></tr> : null}
          {!loading && rows.map((row)=><tr key={row.digital_resource_id}><td><div className="font-weight-bold">{row.title}</div><small className="text-muted">{row.subtitle || '-'}</small></td><td>{row.publisher_name || '-'}</td><td>{row.publication_year || '-'}</td><td>{String(row.access_level || '').replaceAll('_',' ')}</td><td>{formatDate(row.license_start_date)} - {formatDate(row.license_end_date)}</td><td><button className="btn btn-sm btn-outline-primary mr-2" onClick={()=>window.open(`${base}/library/digital-resources/${row.digital_resource_id}/preview`, '_blank')}>Preview</button><button className="btn btn-sm btn-outline-success" disabled={!row.allow_download} onClick={()=>window.open(`${base}/library/digital-resources/${row.digital_resource_id}/download`, '_blank')}>Download</button></td></tr>)}
        </tbody></table></div></div>
      </div></section>
    </MainLayout>
  );
}
