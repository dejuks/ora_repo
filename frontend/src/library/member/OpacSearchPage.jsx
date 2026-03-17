import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import libraryApi from '../../../api/library.api';
import api from '../../../api/api';
import { formatDate, StatusBadge } from '../shared/libraryHelpers';

const initialFilters = {
  search: '',
  material_format: '',
  available_only: '',
  has_digital: '',
  publication_year_from: '',
  publication_year_to: '',
};

export default function OpacSearchPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({});
  const [selected, setSelected] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const memberId = overview?.member?.member_id || null;
  const base = api.defaults.baseURL || 'http://localhost:5000/api';

  const loadCatalog = async () => {
    setLoading(true);
    setError('');
    try {
      const [catalog, myOverview] = await Promise.all([
        libraryApi.searchCatalog({ page: 1, limit: 50, ...filters }),
        libraryApi.getMyCirculationOverview(),
      ]);
      setRows(catalog?.rows || []);
      setMeta(catalog?.meta || {});
      setOverview(myOverview || null);
      if (!selected && catalog?.rows?.length) setSelected(catalog.rows[0]);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load library catalog');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDetails = async (materialId) => {
    if (!materialId) return;
    setDetailsLoading(true);
    try {
      const [details, avail] = await Promise.all([
        libraryApi.getCatalogMaterial(materialId),
        libraryApi.getCatalogAvailability(materialId),
      ]);
      setSelected(details);
      setAvailability(avail);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load item details');
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => { loadCatalog(); }, []);
  useEffect(() => { if (selected?.material_id) loadDetails(selected.material_id); }, [selected?.material_id]);

  const availableCopies = useMemo(() => (availability?.copies || []).filter((row) => row.status === 'available' && row.is_circulation_allowed), [availability]);
  const activeDigital = useMemo(() => availability?.digitalResources || [], [availability]);

  const borrowCopy = async (copyId) => {
    if (!memberId) return setError('No library member account is linked to this user.');
    try {
      await libraryApi.borrowLoan({ member_id: memberId, copy_id: copyId });
      setNotice('Borrowing completed successfully.');
      await loadCatalog();
      await loadDetails(selected?.material_id);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to borrow this item');
    }
  };

  const placeHold = async () => {
    if (!memberId || !selected?.material_id) return setError('Unable to place hold right now.');
    try {
      await libraryApi.createHold({ member_id: memberId, material_id: selected.material_id });
      setNotice('Hold placed successfully.');
      await loadCatalog();
      await loadDetails(selected.material_id);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to place hold');
    }
  };

  return (
    <MainLayout>
      <section className="content-header"><div className="container-fluid"><h1>OPAC Search</h1><p className="text-muted mb-0">Search the catalog, borrow available copies, place holds, and open digital resources.</p></div></section>
      <section className="content"><div className="container-fluid">
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {notice ? <div className="alert alert-success">{notice}</div> : null}
        <div className="card card-outline card-primary"><div className="card-body"><div className="row">
          <div className="col-md-4 mb-3"><label>Search</label><input className="form-control" value={filters.search} onChange={(e)=>setFilters((s)=>({...s, search:e.target.value}))} placeholder="Title, ISBN, contributor, subject..." /></div>
          <div className="col-md-2 mb-3"><label>Format</label><select className="form-control" value={filters.material_format} onChange={(e)=>setFilters((s)=>({...s, material_format:e.target.value}))}><option value="">All</option><option value="physical">Physical</option><option value="digital">Digital</option><option value="hybrid">Hybrid</option></select></div>
          <div className="col-md-2 mb-3"><label>Available only</label><select className="form-control" value={filters.available_only} onChange={(e)=>setFilters((s)=>({...s, available_only:e.target.value}))}><option value="">Any</option><option value="true">Yes</option><option value="false">No</option></select></div>
          <div className="col-md-2 mb-3"><label>Has digital</label><select className="form-control" value={filters.has_digital} onChange={(e)=>setFilters((s)=>({...s, has_digital:e.target.value}))}><option value="">Any</option><option value="true">Yes</option><option value="false">No</option></select></div>
          <div className="col-md-1 mb-3"><label>Year from</label><input className="form-control" value={filters.publication_year_from} onChange={(e)=>setFilters((s)=>({...s, publication_year_from:e.target.value}))} /></div>
          <div className="col-md-1 mb-3"><label>Year to</label><input className="form-control" value={filters.publication_year_to} onChange={(e)=>setFilters((s)=>({...s, publication_year_to:e.target.value}))} /></div>
        </div><div className="d-flex gap-2"><button className="btn btn-primary mr-2" onClick={loadCatalog}>Search</button><button className="btn btn-secondary" onClick={()=>{ setFilters(initialFilters); setTimeout(loadCatalog, 0); }}>Reset</button></div></div></div>
        <div className="row">
          <div className="col-lg-7">
            <div className="card"><div className="card-header"><h3 className="card-title">Results</h3><span className="float-right text-muted">{meta.total || rows.length} item(s)</span></div><div className="card-body table-responsive p-0"><table className="table table-hover table-striped mb-0"><thead><tr><th>Title</th><th>Format</th><th>Year</th><th>Available</th><th>Digital</th><th>Action</th></tr></thead><tbody>
              {loading ? <tr><td colSpan="6" className="text-center p-4">Loading...</td></tr> : null}
              {!loading && rows.length === 0 ? <tr><td colSpan="6" className="text-center p-4">No materials found.</td></tr> : null}
              {!loading && rows.map((row)=><tr key={row.material_id} className={selected?.material_id===row.material_id ? 'table-primary' : ''}><td><div className="font-weight-bold">{row.title}</div><small className="text-muted">{row.publisher_name || '-'} {row.isbn ? `• ${row.isbn}` : ''}</small></td><td>{row.material_format}</td><td>{row.publication_year || '-'}</td><td>{row.available_copies || 0}/{row.total_copies || 0}</td><td>{row.has_digital ? 'Yes' : 'No'}</td><td><button className="btn btn-sm btn-outline-primary" onClick={()=>loadDetails(row.material_id)}>Open</button></td></tr>)}
            </tbody></table></div></div>
          </div>
          <div className="col-lg-5">
            <div className="card card-outline card-info"><div className="card-header"><h3 className="card-title">Item details</h3></div><div className="card-body">
              {detailsLoading ? <p className="text-muted mb-0">Loading details...</p> : null}
              {!detailsLoading && !selected ? <p className="text-muted mb-0">Select a catalog record to view more information.</p> : null}
              {!detailsLoading && selected ? <>
                <h4>{selected.title}</h4>
                <p className="text-muted">{selected.subtitle || 'No subtitle'}</p>
                <div className="mb-2"><strong>Publisher:</strong> {selected.publisher_name || '-'}<br /><strong>Material type:</strong> {selected.material_type_name || '-'}<br /><strong>Category:</strong> {selected.category_name || '-'}<br /><strong>Language:</strong> {selected.language_name || '-'}<br /><strong>Call number:</strong> {selected.call_number || '-'}<br /><strong>Publication year:</strong> {selected.publication_year || '-'}<br /><strong>Reference only:</strong> {selected.is_reference_only ? 'Yes' : 'No'}</div>
                {selected.abstract ? <div className="mb-3"><strong>Abstract:</strong><p className="mb-0">{selected.abstract}</p></div> : null}
                <div className="mb-3"><strong>Contributors:</strong> {(selected.contributors || []).length ? <ul className="mb-0 pl-3">{selected.contributors.map((c)=><li key={c.contributor_id}>{c.full_name}{c.role ? ` (${c.role})` : ''}</li>)}</ul> : <div className="text-muted">No contributors linked.</div>}</div>
                <div className="mb-3"><strong>Subjects:</strong> {(selected.subjects || []).length ? <div>{selected.subjects.map((s)=><span className="badge badge-light border mr-1 mb-1" key={s.subject_id}>{s.name}</span>)}</div> : <div className="text-muted">No subjects linked.</div>}</div>
                <hr />
                <h6>Physical availability</h6>
                {(availability?.copies || []).length ? <div className="table-responsive"><table className="table table-sm table-bordered"><thead><tr><th>Accession</th><th>Branch</th><th>Status</th><th></th></tr></thead><tbody>{availability.copies.map((copy)=><tr key={copy.copy_id}><td>{copy.accession_number}</td><td>{copy.branch_name || '-'}</td><td><StatusBadge status={copy.status} /></td><td>{copy.status === 'available' && copy.is_circulation_allowed && !selected.is_reference_only ? <button className="btn btn-xs btn-success" onClick={()=>borrowCopy(copy.copy_id)}>Borrow</button> : '-'}</td></tr>)}</tbody></table></div> : <p className="text-muted">No copy records found.</p>}
                <div className="mt-2">
                  <button className="btn btn-warning btn-sm" disabled={!memberId || selected.is_reference_only} onClick={placeHold}>Place Hold</button>
                </div>
                <hr />
                <h6>Digital access</h6>
                {activeDigital.length ? activeDigital.map((dr)=><div key={dr.digital_resource_id} className="border rounded p-2 mb-2"><div><strong>Access:</strong> {String(dr.access_level || '').replaceAll('_',' ')}</div><div><strong>License:</strong> {formatDate(dr.license_start_date)} - {formatDate(dr.license_end_date)}</div><div className="mt-2"><button className="btn btn-sm btn-outline-primary mr-2" onClick={()=>window.open(`${base}/library/digital-resources/${dr.digital_resource_id}/preview`, '_blank')}>Preview</button><button className="btn btn-sm btn-outline-success" disabled={!dr.is_downloadable} onClick={()=>window.open(`${base}/library/digital-resources/${dr.digital_resource_id}/download`, '_blank')}>Download</button></div></div>) : <p className="text-muted mb-0">No digital resource published for this title.</p>}
              </> : null}
            </div></div>
          </div>
        </div>
      </div></section>
    </MainLayout>
  );
}
