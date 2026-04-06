import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../../components/layout/MainLayout.jsx';
import libraryApi from '../../../api/library.api';

export default function TagsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [processing, setProcessing] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await libraryApi.list('copies', { limit: 200, search: filters.search || undefined });
      setRows(result?.rows || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load copy tags');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => !filters.status || row.status === filters.status);
  }, [rows, filters.status]);

  const generateBarcode = async (copyId) => {
    setProcessing(copyId);
    setError('');
    setNotice('');
    try {
      await libraryApi.generateCopyBarcode(copyId);
      setNotice('Barcode generated successfully.');
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to generate barcode');
    } finally {
      setProcessing('');
    }
  };

  const generateMissing = async () => {
    setProcessing('all');
    setError('');
    setNotice('');
    try {
      await libraryApi.generateMissingCopyBarcodes();
      setNotice('Missing barcodes generated successfully.');
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to generate missing barcodes');
    } finally {
      setProcessing('');
    }
  };

  return (
    <MainLayout>
      <section className="content-header">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <div>
            <h1>Barcode / RFID Tags</h1>
            <p className="text-muted mb-0">Review accession labels, generate missing barcodes, and verify circulation tags.</p>
          </div>
          <button className="btn btn-primary" onClick={generateMissing} disabled={processing === 'all'}>
            {processing === 'all' ? 'Generating...' : 'Generate Missing Barcodes'}
          </button>
        </div>
      </section>
      <section className="content">
        <div className="container-fluid">
          {error ? <div className="alert alert-danger">{error}</div> : null}
          {notice ? <div className="alert alert-success">{notice}</div> : null}

          <div className="card card-outline card-primary">
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label>Search accession / barcode / RFID</label>
                  <input className="form-control" value={filters.search} onChange={(e) => setFilters((s) => ({ ...s, search: e.target.value }))} placeholder="Type accession, barcode, or RFID tag" />
                </div>
                <div className="col-md-3 mb-3">
                  <label>Status</label>
                  <select className="form-control" value={filters.status} onChange={(e) => setFilters((s) => ({ ...s, status: e.target.value }))}>
                    <option value="">All statuses</option>
                    <option value="available">Available</option>
                    <option value="borrowed">Borrowed</option>
                    <option value="reserved">Reserved</option>
                    <option value="processing">Processing</option>
                    <option value="lost">Lost</option>
                    <option value="damaged">Damaged</option>
                  </select>
                </div>
                <div className="col-md-3 mb-3 d-flex align-items-end justify-content-end">
                  <button className="btn btn-secondary mr-2" onClick={() => setFilters({ search: '', status: '' })}>Reset</button>
                  <button className="btn btn-outline-primary" onClick={load}>Refresh</button>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="card-title">Copy tags</h3></div>
            <div className="card-body table-responsive p-0">
              <table className="table table-striped mb-0">
                <thead>
                  <tr>
                    <th>Accession</th>
                    <th>Barcode</th>
                    <th>RFID Tag</th>
                    <th>Branch</th>
                    <th>Status</th>
                    <th>Circulation</th>
                    <th style={{ width: '180px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && filteredRows.length === 0 ? <tr><td colSpan="7" className="text-center p-4">No copies found.</td></tr> : null}
                  {loading ? <tr><td colSpan="7" className="text-center p-4">Loading copy tags...</td></tr> : null}
                  {!loading && filteredRows.map((row) => (
                    <tr key={row.copy_id}>
                      <td>{row.accession_number || '-'}</td>
                      <td>{row.barcode || <span className="badge badge-warning">Missing</span>}</td>
                      <td>{row.rfid_tag || <span className="text-muted">Not assigned</span>}</td>
                      <td>{row.branch_id || '-'}</td>
                      <td className="text-capitalize">{String(row.status || '').replaceAll('_', ' ')}</td>
                      <td>{row.is_circulation_allowed ? 'Allowed' : 'Blocked'}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => generateBarcode(row.copy_id)} disabled={processing === row.copy_id}>
                          {processing === row.copy_id ? 'Generating...' : 'Generate Barcode'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
