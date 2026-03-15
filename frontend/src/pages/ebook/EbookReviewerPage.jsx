import React, { useEffect, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import ebookApi from "../../api/ebook.api";
import StatusBadge from "./components/StatusBadge";

export default function EbookReviewerPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [rows, setRows] = useState([]);
  const [forms, setForms] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const result = await ebookApi.getReviewerDashboard();
      setRows(result?.assignments || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load reviewer assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const changeForm = (id, patch) => setForms((prev) => ({ ...prev, [id]: { ...(prev[id] || { recommendation: 'accept', comments_for_author: '', confidential_comments: '' }), ...patch } }));

  const submitReview = async (id) => {
    setError('');
    setNotice('');
    try {
      await ebookApi.submitReview(id, forms[id] || {});
      setNotice('Review submitted successfully.');
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit review.');
    }
  };

  const respond = async (id, status) => {
    setError('');
    setNotice('');
    try {
      await ebookApi.respondAssignment(id, { status });
      setNotice(`Assignment ${status}.`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update assignment response.');
    }
  };

  return (
    <MainLayout>
      <section className="content-header mb-3"><h1>Peer Review Workspace</h1><p className="text-muted mb-0">Accept assignments and submit structured confidential reviews.</p></section>
      {error ? <div className="alert alert-danger">{error}</div> : null}
      {notice ? <div className="alert alert-success">{notice}</div> : null}
      <div className="card card-outline card-primary">
        <div className="card-header"><h3 className="card-title mb-0">My assignments</h3></div>
        <div className="card-body">{loading ? 'Loading…' : !rows.length ? <div className="text-muted">No review assignments found.</div> : rows.map((row) => {
          const form = forms[row.assignment_id] || { recommendation: 'accept', comments_for_author: '', confidential_comments: '' };
          return (
            <div key={row.assignment_id} className="border rounded p-3 mb-4">
              <div className="d-flex justify-content-between align-items-start flex-wrap mb-3">
                <div><h5 className="mb-1">{row.title}</h5><p className="text-muted mb-0">{row.author_name || 'Unknown author'} • Due {row.due_date || '—'}</p></div>
                <StatusBadge value={row.status} />
              </div>
              <p>{row.abstract || 'No abstract provided.'}</p>
              <div className="mb-3">
                <button className="btn btn-sm btn-outline-primary mr-2" onClick={() => respond(row.assignment_id, 'accepted')}>Accept</button>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => respond(row.assignment_id, 'declined')}>Decline</button>
              </div>
              <div className="form-group"><label>Recommendation</label><select className="form-control" value={form.recommendation} onChange={(e)=>changeForm(row.assignment_id, { recommendation: e.target.value })}><option value="accept">Accept</option><option value="minor_revision">Minor revision</option><option value="major_revision">Major revision</option><option value="reject">Reject</option></select></div>
              <div className="form-group"><label>Comments for author</label><textarea className="form-control" rows="3" value={form.comments_for_author} onChange={(e)=>changeForm(row.assignment_id, { comments_for_author: e.target.value })} /></div>
              <div className="form-group"><label>Confidential comments</label><textarea className="form-control" rows="3" value={form.confidential_comments} onChange={(e)=>changeForm(row.assignment_id, { confidential_comments: e.target.value })} /></div>
              <button className="btn btn-primary" onClick={() => submitReview(row.assignment_id)}>Submit review</button>
            </div>
          );
        })}</div>
      </div>
    </MainLayout>
  );
}
