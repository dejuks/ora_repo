import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import ebookApi from '../../api/ebook.api';
import StatusBadge from './components/StatusBadge';

const stageConfig = {
  screening: {
    title: 'Editor Screening Queue',
    description: 'New submissions waiting for initial editorial screening.',
    empty: 'No new submissions waiting for screening.',
    columns: 'screening',
  },
  revisions: {
    title: 'Resubmitted by Author',
    description: 'Submissions returned by authors after a revision request.',
    empty: 'No author resubmissions are waiting.',
    columns: 'screening',
  },
  under_review: {
    title: 'Assigned / Under Review',
    description: 'Track reviewer assignments, due dates, and overdue reviews.',
    empty: 'No submissions are currently under review.',
    columns: 'review',
  },
  decisions: {
    title: 'Reviewed Submissions',
    description: 'Submissions with reviewer feedback ready for editorial decision.',
    empty: 'No reviewed submissions are waiting for a decision.',
    columns: 'decision',
  },
  handoff: {
    title: 'Accepted / Handoff',
    description: 'Accepted submissions moving through finance and production.',
    empty: 'No accepted submissions are waiting for handoff tracking.',
    columns: 'handoff',
  },
};

const cardStyle = {
  borderRadius: 16,
  border: '1px solid #e5e7eb',
  boxShadow: '0 1px 2px rgba(16,24,40,.04)',
};

const thStyle = {
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: '.04em',
  color: '#6b7280',
  borderTop: 0,
  background: '#f8fafc',
};

function QueueStats({ rows }) {
  const stats = useMemo(() => {
    const total = rows.length;
    const overdue = rows.filter((r) => Number(r.overdue_assignment_count || 0) > 0).length;
    const ready = rows.filter((r) => Number(r.review_count || 0) > 0).length;
    const assigned = rows.filter((r) => Number(r.assignment_count || 0) > 0).length;
    return { total, overdue, ready, assigned };
  }, [rows]);

  return (
    <div className="row mb-3">
      {[
        ['Total', stats.total],
        ['Assigned', stats.assigned],
        ['Reviewed', stats.ready],
        ['Overdue', stats.overdue],
      ].map(([label, value]) => (
        <div className="col-md-3 col-6 mb-3" key={label}>
          <div className="bg-white p-3" style={cardStyle}>
            <div className="text-muted small text-uppercase">{label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.1 }}>{value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EbookEditorStagePage({ stage = 'screening' }) {
  const config = stageConfig[stage] || stageConfig.screening;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const location = useLocation();

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await ebookApi.getEditorQueue({ stage, limit: 100, search, overdue_only: stage === 'under_review' ? 'false' : '' });
      setRows(result?.rows || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load editor queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [stage]);

  return (
    <MainLayout>
      <section className="content-header mb-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h1 className="mb-1">{config.title}</h1>
            <p className="text-muted mb-0">{config.description}</p>
          </div>
          <div className="d-flex" style={{ gap: 8 }}>
            <Link className={`btn ${location.pathname === '/ebook/editor/screening' ? 'btn-primary' : 'btn-outline-primary'}`} to="/ebook/editor/screening">Screening</Link>
            <Link className={`btn ${location.pathname === '/ebook/editor/revisions' ? 'btn-primary' : 'btn-outline-primary'}`} to="/ebook/editor/revisions">Resubmitted</Link>
            <Link className={`btn ${location.pathname === '/ebook/editor/under-review' ? 'btn-primary' : 'btn-outline-primary'}`} to="/ebook/editor/under-review">Under Review</Link>
            <Link className={`btn ${location.pathname === '/ebook/editor/decisions' ? 'btn-primary' : 'btn-outline-primary'}`} to="/ebook/editor/decisions">Decisions</Link>
            <Link className={`btn ${location.pathname === '/ebook/editor/handoff' ? 'btn-primary' : 'btn-outline-primary'}`} to="/ebook/editor/handoff">Handoff</Link>
          </div>
        </div>
      </section>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="bg-white p-3 mb-3" style={cardStyle}>
        <form className="d-flex justify-content-between align-items-end flex-wrap" onSubmit={(e) => { e.preventDefault(); load(); }}>
          <div>
            <div className="text-muted small text-uppercase mb-1">Search submissions</div>
            <input
              className="form-control"
              style={{ minWidth: 320, borderRadius: 12 }}
              placeholder="Search title, subtitle, author, or keywords"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="d-flex mt-2 mt-md-0" style={{ gap: 8 }}>
            <button className="btn btn-outline-secondary" type="button" onClick={() => { setSearch(''); setTimeout(load, 0); }}>Reset</button>
            <button className="btn btn-primary" type="submit">Apply</button>
          </div>
        </form>
      </div>

      <QueueStats rows={rows} />

      <div className="bg-white" style={cardStyle}>
        <div className="px-3 py-3 border-bottom d-flex justify-content-between align-items-center">
          <div>
            <div style={{ fontWeight: 700 }}>Queue List</div>
            <div className="text-muted small">Open a submission to work on the next appropriate editor action.</div>
          </div>
          <div className="text-muted small">{rows.length} item(s)</div>
        </div>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th style={thStyle}>Submission</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Author</th>
                {config.columns !== 'handoff' ? <th style={thStyle}>Review Progress</th> : <th style={thStyle}>Finance / Proof</th>}
                <th style={thStyle}>Updated</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-4">Loading…</td></tr>
              ) : !rows.length ? (
                <tr><td colSpan="6" className="text-center text-muted py-5">{config.empty}</td></tr>
              ) : rows.map((row) => (
                <tr key={row.submission_id}>
                  <td style={{ minWidth: 280 }}>
                    <div style={{ fontWeight: 600 }}>{row.title}</div>
                    <div className="text-muted small mt-1">{row.subtitle || row.abstract?.slice?.(0, 80) || 'No subtitle'}</div>
                    {row.latest_resubmitted_at ? <div className="small mt-1 text-primary">Resubmitted: {new Date(row.latest_resubmitted_at).toLocaleString()}</div> : null}
                  </td>
                  <td><StatusBadge value={row.status} /></td>
                  <td>
                    <div>{row.author_name || '—'}</div>
                    <div className="text-muted small">{row.author_email || 'No email'}</div>
                  </td>
                  <td>
                    <div className="small"><strong>Assignments:</strong> {row.assignment_count || 0}</div>
                    <div className="small"><strong>Reviews:</strong> {row.review_count || 0}</div>
                    {config.columns === 'handoff' ? (
                      <>
                        <div className="small"><strong>Payment:</strong> {row.payment_status || '—'}</div>
                        <div className="small"><strong>Proof:</strong> {row.proof_sent_to_author ? (row.author_proof_approved ? 'approved' : 'sent') : 'not sent'}</div>
                      </>
                    ) : (
                      <div className="small text-muted">{(row.reviewer_names || []).filter(Boolean).join(', ') || 'No reviewers yet'}</div>
                    )}
                  </td>
                  <td className="small text-muted">{new Date(row.updated_at || row.created_at).toLocaleString()}</td>
                  <td>
                    <div className="d-flex flex-column" style={{ gap: 8, minWidth: 120 }}>
                      <Link className="btn btn-sm btn-outline-primary" to={`/ebook/submissions/${row.submission_id}`}>Open details</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
