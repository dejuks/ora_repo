import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../../components/layout/MainLayout.jsx';
import libraryApi from '../../../api/library.api';
import api from '../../../api/api.js';
import { formatDate, getRows, loadResource, mapBy, StatusBadge } from '../shared/libraryHelpers.js';

export default function DigitalResourcesPage() {
  const [rows, setRows] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  const materialMap = useMemo(() => mapBy(materials, 'material_id'), [materials]);
  const publisherMap = useMemo(() => mapBy(publishers, 'publisher_id'), [publishers]);
  const base = api.defaults.baseURL || 'http://localhost:5000/api';

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [resourcesRes, materialsRes, publishersRes] = await Promise.all([
        loadResource('digital-resources'),
        loadResource('materials'),
        loadResource('publishers'),
      ]);
      setRows(getRows(resourcesRes));
      setMaterials(getRows(materialsRes));
      setPublishers(getRows(publishersRes));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load digital resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  return (
    <MainLayout>
      <section className="content-header"><div className="container-fluid"><h1>Digital Library</h1><p className="text-muted mb-0">Browse active digital resources, licensing windows, and access settings.</p></div></section>
      <section className="content"><div className="container-fluid">
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {notice ? <div className="alert alert-success">{notice}</div> : null}
        <div className="card"><div className="card-header"><h3 className="card-title">Published digital resources</h3></div><div className="card-body table-responsive p-0"><table className="table table-striped table-hover mb-0"><thead><tr><th>Material</th><th>Publisher</th><th>Access</th><th>License</th><th>Download</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          {loading ? <tr><td colSpan="7" className="text-center p-4">Loading...</td></tr> : null}
          {!loading && rows.length===0 ? <tr><td colSpan="7" className="text-center p-4">No digital resources found.</td></tr> : null}
          {!loading && rows.map((row)=><tr key={row.digital_resource_id}><td><div className="font-weight-bold">{materialMap[row.material_id]?.title || '-'}</div><small className="text-muted">{materialMap[row.material_id]?.publication_year || '-'}</small></td><td>{publisherMap[row.publisher_id]?.name || '-'}</td><td>{String(row.access_level || '-').replaceAll('_',' ')}</td><td>{formatDate(row.license_start_date)} - {formatDate(row.license_end_date)}</td><td>{row.is_downloadable ? 'Allowed' : 'No'}</td><td><StatusBadge status={row.is_active ? 'active' : 'inactive'} /></td><td><button className="btn btn-sm btn-info mr-2" onClick={async()=>{ try { const data = await libraryApi.accessDigitalResource(row.digital_resource_id); setNotice(`Access granted. ${data.files?.length || 0} file(s) available.`); } catch(err){ setError(err?.response?.data?.message || 'Failed to access resource'); } }}>Access</button><button className="btn btn-sm btn-secondary mr-2" onClick={()=>window.open(`${base}/library/digital-resources/${row.digital_resource_id}/preview`, '_blank')}>Preview</button><button className="btn btn-sm btn-success" disabled={!row.is_downloadable} onClick={()=>window.open(`${base}/library/digital-resources/${row.digital_resource_id}/download`, '_blank')}>Download</button></td></tr>)}
        </tbody></table></div></div>
      </div></section>
    </MainLayout>
  );
}
