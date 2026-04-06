import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout.jsx';
import ebookApi from './mock/ebookMockApi.js';
import StatusBadge from './components/StatusBadge.jsx';

const statusOptions = [
  '', 'submitted', 'editor_screening', 'under_review', 'revision_requested', 'accepted', 'rejected', 'production_approved'
];

export default function EbookEditorQueuePage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [filters, setFilters] = useState({ status: '', search: '', overdue_only: false });
  const [commentText, setCommentText] = useState({});
  const [notifyText, setNotifyText] = useState({});

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ebookApi.getEditorQueue({
        ...filters,
        overdue_only: filters.overdue_only ? 'true' : '',
      });
      setRows(data?.rows || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load editor queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const act = async (runner, success) => {
    setError('');
    setNotice('');
    try {
      await runner();
      setNotice(success);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Action failed.');
    }
  };

  return (
    <MainLayout>
      <section className="content-header mb-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h1 className="mb-1">Legacy Editor Queue</h1>
            <p className="text-muted mb-0">This page remains available, but the simplified editor workflow now uses separate stage queues for screening, review monitoring, and accepted handoff.</p>
          </div>
          <Link className="btn btn-outline-primary" to="/ebook/editor/reviews">Open reviewer manager</Link>
        </div>
      </section>

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {notice ? <div className="alert alert-success">{notice}</div> : null}

      <div className="card card-outline card-primary mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-3 mb-3">
              <label>Status</label>
              <select className="form-control" value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
                {statusOptions.map((item) => <option key={item || 'all'} value={item}>{item || 'all statuses'}</option>)}
              </select>
            </div>
            <div className="col-md-5 mb-3">
              <label>Search</label>
              <input className="form-control" value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))} placeholder="Search title, subtitle, author" />
            </div>
            <div className="col-md-2 mb-3 d-flex align-items-end">
              <div className="form-check">
                <input id="overdueOnly" className="form-check-input" type="checkbox" checked={filters.overdue_only} onChange={(e) => setFilters((p) => ({ ...p, overdue_only: e.target.checked }))} />
                <label htmlFor="overdueOnly" className="form-check-label">Overdue only</label>
              </div>
            </div>
            <div className="col-md-2 mb-3 d-flex align-items-end">
              <button className="btn btn-primary btn-block" onClick={load}>Apply filters</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card card-outline card-primary">
        <div className="card-header"><h3 className="card-title mb-0">Queue items</h3></div>
        <div className="card-body table-responsive p-0">
          {loading ? <div className="p-3">Loading…</div> : !rows.length ? <div className="p-3 text-muted">No submissions found.</div> : (
            <table className="table table-hover text-nowrap mb-0">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th>Assignments</th>
                  <th>Reviews</th>
                  <th>Overdue</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.submission_id}>
                    <td>
                      <div className="font-weight-bold">{row.title}</div>
                      <small className="text-muted">{row.reviewer_names?.filter(Boolean)?.join(', ') || 'No reviewers yet'}</small>
                    </td>
                    <td>{row.author_name || '—'}</td>
                    <td><StatusBadge value={row.status} /></td>
                    <td>{row.assignment_count || 0}</td>
                    <td>{row.review_count || 0}</td>
                    <td>{row.overdue_assignment_count || 0}</td>
                    <td style={{ minWidth: 360 }}>
                      <div className="btn-group btn-group-sm mb-2 mr-2">
                        <Link className="btn btn-outline-primary" to={`/ebook/submissions/${row.submission_id}`}>Open</Link>
                        <Link className="btn btn-outline-secondary" to={`/ebook/editor/reviews?submissionId=${row.submission_id}`}>Compare reviews</Link>
                        <button className="btn btn-outline-success" onClick={() => act(() => ebookApi.approveForProduction(row.submission_id, { note: 'Approved by editor from queue' }), 'Submission approved for production.')}>Approve production</button>
                      </div>
                      <div className="input-group input-group-sm mb-2">
                        <input className="form-control" placeholder="Notify author" value={notifyText[row.submission_id] || ''} onChange={(e) => setNotifyText((p) => ({ ...p, [row.submission_id]: e.target.value }))} />
                        <div className="input-group-append">
                          <button className="btn btn-outline-info" onClick={() => act(() => ebookApi.notifyAuthor(row.submission_id, { message: notifyText[row.submission_id] || 'Editorial update available.' }), 'Author notification saved.')}>Send</button>
                        </div>
                      </div>
                      <div className="input-group input-group-sm">
                        <input className="form-control" placeholder="Internal editor comment" value={commentText[row.submission_id] || ''} onChange={(e) => setCommentText((p) => ({ ...p, [row.submission_id]: e.target.value }))} />
                        <div className="input-group-append">
                          <button className="btn btn-outline-dark" onClick={() => act(() => ebookApi.addEditorComment(row.submission_id, { note: commentText[row.submission_id] || 'Editor comment added.' }), 'Editor comment added.')}>Add comment</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
