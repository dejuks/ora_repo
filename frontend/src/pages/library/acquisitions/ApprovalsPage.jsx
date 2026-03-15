import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import libraryApi from '../../../api/library.api';
import { formatCurrency, formatDate, getRows, loadResource, mapBy, StatusBadge } from '../shared/libraryHelpers';

export default function ApprovalsPage() {
  const [rows, setRows] = useState([]);
  const [materialTypes, setMaterialTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const materialTypeMap = useMemo(() => mapBy(materialTypes, 'material_type_id'), [materialTypes]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [requestsRes, materialTypesRes] = await Promise.all([
        loadResource('acquisition-requests'),
        loadResource('material-types'),
      ]);
      setRows(getRows(requestsRes));
      setMaterialTypes(getRows(materialTypesRes));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load approvals queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const action = async (fn, successMessage) => {
    try {
      await fn();
      setNotice(successMessage);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Workflow action failed');
    }
  };

  const reviewableRows = rows.filter((row) => ['submitted', 'approved', 'rejected', 'ordered'].includes(row.status));

  return (
    <MainLayout>
      <section className="content-header"><div className="container-fluid"><h1>Acquisition Approvals</h1><p className="text-muted mb-0">Approve, reject, and move submitted requests into procurement.</p></div></section>
      <section className="content"><div className="container-fluid">
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {notice ? <div className="alert alert-success">{notice}</div> : null}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Approvals queue</h3></div>
          <div className="card-body table-responsive p-0">
            <table className="table table-striped table-hover mb-0">
              <thead><tr><th>Title</th><th>Type</th><th>Qty</th><th>Estimated</th><th>Status</th><th>Submitted</th><th style={{ width: 260 }}>Actions</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan="7" className="text-center p-4">Loading...</td></tr> : null}
                {!loading && reviewableRows.length === 0 ? <tr><td colSpan="7" className="text-center p-4">No requests awaiting action.</td></tr> : null}
                {!loading && reviewableRows.map((row) => (
                  <tr key={row.request_id}>
                    <td><div className="font-weight-bold">{row.title}</div><small className="text-muted">{row.author_text || '-'}</small></td>
                    <td>{materialTypeMap[row.material_type_id]?.name || '-'}</td>
                    <td>{row.quantity}</td>
                    <td>{formatCurrency(row.estimated_price)}</td>
                    <td><StatusBadge status={row.status} /></td>
                    <td>{formatDate(row.submitted_at || row.created_at, true)}</td>
                    <td>
                      <button className="btn btn-sm btn-success mr-2 mb-1" disabled={row.status !== 'submitted'} onClick={() => action(() => libraryApi.approveAcquisitionRequest(row.request_id), 'Request approved successfully.')}>Approve</button>
                      <button className="btn btn-sm btn-danger mr-2 mb-1" disabled={row.status !== 'submitted'} onClick={() => {
                        const reason = window.prompt('Enter rejection reason');
                        if (!reason) return;
                        action(() => libraryApi.rejectAcquisitionRequest(row.request_id, { rejection_reason: reason }), 'Request rejected successfully.');
                      }}>Reject</button>
                      <button className="btn btn-sm btn-primary mb-1" disabled={row.status !== 'approved'} onClick={() => action(() => libraryApi.markAcquisitionRequestOrdered(row.request_id), 'Request marked as ordered.')}>Mark ordered</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div></section>
    </MainLayout>
  );
}
