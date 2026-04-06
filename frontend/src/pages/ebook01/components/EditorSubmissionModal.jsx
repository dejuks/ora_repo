import React, { useEffect, useMemo, useState } from 'react';
import ebookApi from '../../../api/ebook.api';
import StatusBadge from './StatusBadge';

function ModalShell({ title, children, onClose, footer = null, size = 'modal-xl' }) {
  return (
    <>
      <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.35)' }} onClick={onClose} />
      <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog">
        <div className={`modal-dialog ${size} modal-dialog-scrollable`} role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="close" onClick={onClose}><span>&times;</span></button>
            </div>
            <div className="modal-body">{children}</div>
            {footer ? <div className="modal-footer">{footer}</div> : null}
          </div>
        </div>
      </div>
    </>
  );
}

function DataTable({ rows = [] }) {
  return (
    <div className="table-responsive">
      <table className="table table-sm table-bordered mb-0">
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th style={{ width: '220px' }}>{row.label}</th>
              <td>{row.value ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SubmissionDetailModal({ submissionId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [workflow, setWorkflow] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await ebookApi.getWorkflow(submissionId);
        if (active) setWorkflow(data);
      } catch (err) {
        if (active) setError(err?.response?.data?.message || 'Failed to load submission details.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [submissionId]);

  const submission = workflow?.submission || {};
  const metadataRows = useMemo(() => ([
    { label: 'Title', value: submission.title },
    { label: 'Subtitle', value: submission.subtitle || '—' },
    { label: 'Author', value: submission.author_name || '—' },
    { label: 'Status', value: <StatusBadge value={submission.status} /> },
    { label: 'Category', value: submission.category || '—' },
    { label: 'Language', value: submission.language || '—' },
    { label: 'Publication Year', value: submission.publication_year || '—' },
    { label: 'Target Audience', value: submission.target_audience || '—' },
    { label: 'Submitted At', value: submission.submitted_at ? new Date(submission.submitted_at).toLocaleString() : '—' },
    { label: 'Updated At', value: submission.updated_at ? new Date(submission.updated_at).toLocaleString() : '—' },
    { label: 'Keywords', value: Array.isArray(submission.keywords) && submission.keywords.length ? submission.keywords.join(', ') : '—' },
    { label: 'Abstract', value: submission.abstract || '—' },
  ]), [submission]);

  return (
    <ModalShell title="Submission Details" onClose={onClose} size="modal-xl" footer={<button className="btn btn-secondary" onClick={onClose}>Close</button>}>
      {loading ? <div>Loading…</div> : error ? <div className="alert alert-danger mb-0">{error}</div> : (
        <div>
          <div className="mb-4">
            <h6 className="mb-2">Metadata</h6>
            <DataTable rows={metadataRows} />
          </div>

          <div className="mb-4">
            <h6 className="mb-2">Files</h6>
            <div className="table-responsive">
              <table className="table table-sm table-striped table-bordered">
                <thead>
                  <tr>
                    <th>Version</th>
                    <th>Role</th>
                    <th>Name</th>
                    <th>Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {(workflow?.files || []).length ? workflow.files.map((file) => (
                    <tr key={file.file_id}>
                      <td>{file.version_no || '—'}</td>
                      <td>{file.file_role || '—'}</td>
                      <td>{file.original_name || '—'}</td>
                      <td>{file.created_at ? new Date(file.created_at).toLocaleString() : '—'}</td>
                    </tr>
                  )) : <tr><td colSpan="4" className="text-center text-muted">No files found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-4">
            <h6 className="mb-2">Reviewer Assignments</h6>
            <div className="table-responsive">
              <table className="table table-sm table-striped table-bordered">
                <thead>
                  <tr>
                    <th>Reviewer</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th>Assigned</th>
                  </tr>
                </thead>
                <tbody>
                  {(workflow?.assignments || []).length ? workflow.assignments.map((item) => (
                    <tr key={item.assignment_id}>
                      <td>{item.reviewer_name || item.reviewer_email || '—'}</td>
                      <td><StatusBadge value={item.status} /></td>
                      <td>{item.due_date || '—'}</td>
                      <td>{item.assigned_at ? new Date(item.assigned_at).toLocaleString() : '—'}</td>
                    </tr>
                  )) : <tr><td colSpan="4" className="text-center text-muted">No assignments found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-4">
            <h6 className="mb-2">Reviews</h6>
            <div className="table-responsive">
              <table className="table table-sm table-striped table-bordered">
                <thead>
                  <tr>
                    <th>Reviewer</th>
                    <th>Recommendation</th>
                    <th>Comments for Author</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {(workflow?.reviews || []).length ? workflow.reviews.map((item) => (
                    <tr key={item.review_id}>
                      <td>{item.reviewer_name || item.reviewer_email || '—'}</td>
                      <td>{item.recommendation || '—'}</td>
                      <td style={{ whiteSpace: 'pre-wrap' }}>{item.comments_for_author || '—'}</td>
                      <td>{item.submitted_at ? new Date(item.submitted_at).toLocaleString() : '—'}</td>
                    </tr>
                  )) : <tr><td colSpan="4" className="text-center text-muted">No reviews found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h6 className="mb-2">Workflow History</h6>
            <div className="table-responsive">
              <table className="table table-sm table-striped table-bordered mb-0">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Actor</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Note</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(workflow?.history || []).length ? workflow.history.map((item) => (
                    <tr key={item.history_id}>
                      <td>{item.action || '—'}</td>
                      <td>{item.actor_name || item.actor_email || '—'}</td>
                      <td>{item.from_status || '—'}</td>
                      <td>{item.to_status || '—'}</td>
                      <td style={{ whiteSpace: 'pre-wrap' }}>{item.note || '—'}</td>
                      <td>{item.acted_at ? new Date(item.acted_at).toLocaleString() : '—'}</td>
                    </tr>
                  )) : <tr><td colSpan="6" className="text-center text-muted">No workflow history found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </ModalShell>
  );
}

export function SubmissionActionModal({ mode, row, reviewerOptions = [], onClose, onDone }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedReviewers, setSelectedReviewers] = useState([]);
  const [decision, setDecision] = useState('accept');

  useEffect(() => {
    setError('');
    setSaving(false);
    setNote('');
    setDueDate('');
    setSelectedReviewers([]);
    setDecision('accept');
  }, [mode, row?.submission_id]);

  const titleMap = {
    reject: 'Reject Submission',
    revision: 'Request Revision',
    assign: 'Assign Reviewers',
    decision: 'Editorial Decision',
  };

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      if (mode === 'reject') {
        await ebookApi.screening(row.submission_id, { decision: 'reject', note });
      } else if (mode === 'revision') {
        await ebookApi.screening(row.submission_id, { decision: 'request_revision', note });
      } else if (mode === 'assign') {
        await ebookApi.assignReviewer(row.submission_id, { reviewer_ids: selectedReviewers, due_date: dueDate || null, invitation_note: note });
      } else if (mode === 'decision') {
        await ebookApi.makeDecision(row.submission_id, { decision, note });
      }
      await onDone();
    } catch (err) {
      setError(err?.response?.data?.message || 'Action failed.');
    } finally {
      setSaving(false);
    }
  };

  const footer = (
    <>
      <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
      <button className="btn btn-primary" onClick={submit} disabled={saving || (mode === 'assign' && !selectedReviewers.length)}>{saving ? 'Saving…' : 'Save'}</button>
    </>
  );

  return (
    <ModalShell title={titleMap[mode] || 'Action'} onClose={onClose} footer={footer} size="modal-lg">
      {error ? <div className="alert alert-danger">{error}</div> : null}
      <div className="mb-3">
        <strong>{row?.title || 'Submission'}</strong>
        <div className="text-muted small">{row?.author_name || '—'}</div>
      </div>

      {mode === 'assign' ? (
        <>
          <div className="form-group">
            <label>Reviewers</label>
            <select multiple className="form-control" value={selectedReviewers} onChange={(e) => setSelectedReviewers(Array.from(e.target.selectedOptions).map((option) => option.value))} style={{ minHeight: '160px' }}>
              {reviewerOptions.map((item) => (
                <option key={item.uuid} value={item.uuid}>{item.full_name || item.email}</option>
              ))}
            </select>
            <small className="form-text text-muted">Hold Ctrl or Cmd to select multiple reviewers.</small>
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input type="date" className="form-control" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </>
      ) : null}

      {mode === 'decision' ? (
        <div className="form-group">
          <label>Decision</label>
          <select className="form-control" value={decision} onChange={(e) => setDecision(e.target.value)}>
            <option value="accept">Accept</option>
            <option value="minor_revision">Minor Revision</option>
            <option value="major_revision">Major Revision</option>
            <option value="reject">Reject</option>
          </select>
        </div>
      ) : null}

      <div className="form-group mb-0">
        <label>{mode === 'assign' ? 'Invitation Note' : 'Note'}</label>
        <textarea className="form-control" rows="5" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Write note here..." />
      </div>
    </ModalShell>
  );
}
