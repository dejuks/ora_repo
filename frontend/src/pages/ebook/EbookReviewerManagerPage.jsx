import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout.jsx';
import ebookApi from '../../api/ebook.api';
import StatusBadge from './components/StatusBadge.jsx';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function EbookReviewerManagerPage() {
  const query = useQuery();
  const initialSubmissionId = query.get('submissionId') || '';
  const [assignments, setAssignments] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(initialSubmissionId);
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [forms, setForms] = useState({});

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [assignmentRes, reminderRes, reviewerRes] = await Promise.all([
        ebookApi.listReviewAssignments(),
        ebookApi.getReviewerReminders({ only_overdue: 'true' }),
        ebookApi.listReviewerOptions(),
      ]);
      setAssignments(assignmentRes?.rows || assignmentRes || []);
      setReminders(reminderRes?.rows || []);
      setReviewers(reviewerRes?.rows || reviewerRes || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load reviewer manager.');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkflow = async (submissionId) => {
    if (!submissionId) {
      setWorkflow(null);
      return;
    }
    setError('');
    try {
      const data = await ebookApi.getWorkflow(submissionId);
      setWorkflow(data);
      setSelectedSubmissionId(submissionId);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load review reports.');
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (initialSubmissionId) loadWorkflow(initialSubmissionId); }, [initialSubmissionId]);

  const change = (assignmentId, patch) => setForms((p) => ({ ...p, [assignmentId]: { ...(p[assignmentId] || {}), ...patch } }));

  const act = async (runner, success) => {
    setError('');
    setNotice('');
    try {
      await runner();
      setNotice(success);
      await load();
      if (selectedSubmissionId) await loadWorkflow(selectedSubmissionId);
    } catch (err) {
      setError(err?.response?.data?.message || 'Action failed.');
    }
  };

  const grouped = assignments.reduce((acc, row) => {
    const key = row.submission_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});

  return (
    <MainLayout>
      <section className="content-header mb-3">
        <div>
          <h1 className="mb-1">Reviewer Assignment Manager</h1>
          <p className="text-muted mb-0">Reassign reviewers, remove assignments, and compare submitted review reports.</p>
        </div>
      </section>

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {notice ? <div className="alert alert-success">{notice}</div> : null}

      <div className="row">
        <div className="col-lg-5">
          <div className="card card-outline card-warning mb-4">
            <div className="card-header"><h3 className="card-title mb-0">Overdue reviewer monitoring</h3></div>
            <div className="card-body">
              {loading ? 'Loading…' : !reminders.length ? <div className="text-muted">No overdue assignments.</div> : reminders.map((row) => (
                <div key={row.assignment_id} className="border rounded p-2 mb-2">
                  <div className="d-flex justify-content-between"><strong>{row.title}</strong><StatusBadge value={row.status} /></div>
                  <div className="small text-muted">Reviewer: {row.reviewer_name || row.reviewer_email || '—'} • Due: {row.due_date || '—'} • Overdue: {row.overdue_days || 0} day(s)</div>
                  <button className="btn btn-sm btn-outline-primary mt-2" onClick={() => loadWorkflow(row.submission_id)}>Open review comparison</button>
                </div>
              ))}
            </div>
          </div>

          <div className="card card-outline card-primary">
            <div className="card-header"><h3 className="card-title mb-0">Assignments grouped by submission</h3></div>
            <div className="card-body">
              {loading ? 'Loading…' : !Object.keys(grouped).length ? <div className="text-muted">No assignments found.</div> : Object.entries(grouped).map(([submissionId, rows]) => (
                <div key={submissionId} className="border rounded p-3 mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <div className="font-weight-bold">{rows[0]?.title || submissionId}</div>
                      <div className="text-muted small">{rows.length} assignment(s)</div>
                    </div>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => loadWorkflow(submissionId)}>Load reports</button>
                  </div>
                  {rows.map((row) => {
                    const form = forms[row.assignment_id] || { to_reviewer_id: '', note: '', due_date: row.due_date || '' };
                    const reviewerChoices = reviewers.filter((reviewer) => reviewer.uuid !== row.reviewer_id);
                    return (
                      <div key={row.assignment_id} className="bg-light rounded p-2 mb-2">
                        <div className="d-flex justify-content-between flex-wrap">
                          <div>
                            <strong>{row.reviewer_name || row.reviewer_email || row.reviewer_id}</strong>
                            <div className="small text-muted">Status: {row.status} • Due: {row.due_date || '—'}</div>
                          </div>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => act(() => ebookApi.removeReviewAssignment(row.assignment_id), 'Assignment removed.')}>Remove</button>
                        </div>
                        <div className="row mt-2">
                          <div className="col-md-5 mb-2">
                            <select className="form-control form-control-sm" value={form.to_reviewer_id} onChange={(e) => change(row.assignment_id, { to_reviewer_id: e.target.value })}>
                              <option value="">Select new reviewer</option>
                              {reviewerChoices.map((reviewer) => <option key={reviewer.uuid} value={reviewer.uuid}>{reviewer.full_name || reviewer.email} {reviewer.email ? `(${reviewer.email})` : ''}</option>)}
                            </select>
                          </div>
                          <div className="col-md-3 mb-2"><input className="form-control form-control-sm" type="date" value={form.due_date} onChange={(e) => change(row.assignment_id, { due_date: e.target.value })} /></div>
                          <div className="col-md-4 mb-2"><input className="form-control form-control-sm" placeholder="Note" value={form.note} onChange={(e) => change(row.assignment_id, { note: e.target.value })} /></div>
                        </div>
                        <button className="btn btn-sm btn-primary" disabled={!form.to_reviewer_id} onClick={() => act(() => ebookApi.reassignReviewer(row.submission_id, { from_assignment_id: row.assignment_id, to_reviewer_id: form.to_reviewer_id, due_date: form.due_date, note: form.note }), 'Reviewer reassigned.')}>Reassign</button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card card-outline card-success">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="card-title mb-0">Review reports comparison</h3>
              <div className="input-group input-group-sm" style={{ width: 260 }}>
                <input className="form-control" placeholder="Submission UUID" value={selectedSubmissionId} onChange={(e) => setSelectedSubmissionId(e.target.value)} />
                <div className="input-group-append"><button className="btn btn-outline-secondary" onClick={() => loadWorkflow(selectedSubmissionId)}>Load</button></div>
              </div>
            </div>
            <div className="card-body">
              {!workflow ? <div className="text-muted">Select a submission to compare review reports.</div> : (
                <>
                  <div className="mb-3">
                    <h5 className="mb-1">{workflow?.submission?.title}</h5>
                    <div className="text-muted">Current status: {workflow?.submission?.status}</div>
                  </div>
                  <div className="row">
                    {(workflow?.reviews || []).length ? workflow.reviews.map((review) => (
                      <div className="col-md-6" key={review.review_id}>
                        <div className="border rounded p-3 mb-3 h-100">
                          <div className="d-flex justify-content-between mb-2">
                            <strong>{review.reviewer_name || review.reviewer_email || review.reviewer_id}</strong>
                            <StatusBadge value={review.recommendation} />
                          </div>
                          <div className="small text-muted mb-2">Submitted: {review.submitted_at || '—'}</div>
                          <div className="mb-2"><strong>Author comments</strong><div>{review.comments_for_author || '—'}</div></div>
                          <div><strong>Confidential comments</strong><div>{review.confidential_comments || '—'}</div></div>
                        </div>
                      </div>
                    )) : <div className="col-12 text-muted">No reviews submitted yet for this submission.</div>}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
