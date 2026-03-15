import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import ebookApi from "../../api/ebook.api";
import StatusBadge from "./components/StatusBadge";

const normalizeRoleName = (value) => (value || "").toString().trim().toUpperCase().replace(/\s+/g, "_");
const hasRole = (user, names = []) => {
  const userRoles = user?.roles?.map((r) => normalizeRoleName(r.role_name || r.name || r.code)) || [];
  return names.some((name) => userRoles.includes(normalizeRoleName(name)));
};

export default function EbookSubmissionDetailPage() {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [data, setData] = useState(null);
  const [fileRole, setFileRole] = useState('manuscript');
  const [selectedFile, setSelectedFile] = useState(null);
  const [screening, setScreening] = useState({ decision: 'send_to_review', note: '' });
  const [reviewerForm, setReviewerForm] = useState({ reviewer_ids: [], due_date: '', invitation_note: '' });
  const [reviewerOptions, setReviewerOptions] = useState([]);
  const [reviewerOptionsError, setReviewerOptionsError] = useState('');
  const [decisionForm, setDecisionForm] = useState({ decision: 'accept', note: '' });
  const [financeForm, setFinanceForm] = useState({ invoice_number: '', currency_code: 'ETB', amount_due: '', amount_paid: '', payment_status: 'pending', payment_reference: '', receipt_number: '', review_note: '' });
  const [productionForm, setProductionForm] = useState({ pdf_ready: false, epub_ready: false, proof_sent_to_author: false, author_proof_approved: false, isbn: '', doi: '', repository_path: '', quality_note: '' });
  const [publishForm, setPublishForm] = useState({ slug: '', access_level: 'open_access', embargo_until: '', license_name: 'All rights reserved', landing_page_title: '', is_public: true });

  const canAuthor = hasRole(user, ['EBOOK_AUTHOR', 'EBOOK_ADMIN']);
  const canEditor = hasRole(user, ['EBOOK_EDITOR', 'EBOOK_ADMIN']);
  const canFinance = hasRole(user, ['EBOOK_FINANCE_OFFICER', 'EBOOK_ADMIN']);
  const canProduction = hasRole(user, ['EBOOK_DIGITAL_CONTENT_MANAGER', 'EBOOK_ADMIN']);

  const loadReviewerOptions = async () => {
    if (!canEditor) return;
    try {
      setReviewerOptionsError('');
      const res = await ebookApi.getReviewerOptions();
      const rows = Array.isArray(res) ? res : (res?.rows || []);
      setReviewerOptions(rows);
    } catch (e) {
      setReviewerOptions([]);
      setReviewerOptionsError(e?.response?.data?.message || e?.message || 'Failed to load EBOOK_REVIEWER users.');
    }
  };

  const toggleReviewer = (uuid) => {
    setReviewerForm((prev) => ({
      ...prev,
      reviewer_ids: prev.reviewer_ids.includes(uuid)
        ? prev.reviewer_ids.filter((id) => id !== uuid)
        : [...prev.reviewer_ids, uuid],
    }));
  };

  const load = async () => {
    setLoading(true);
    try {
      const result = await ebookApi.getWorkflow(id);
      setData(result);
      const sub = result?.submission || {};
      setFinanceForm((p) => ({ ...p, invoice_number: sub.invoice_number || '', amount_due: sub.amount_due || '', amount_paid: sub.amount_paid || '', payment_status: sub.payment_status || 'pending', receipt_number: sub.receipt_number || '' }));
      setProductionForm((p) => ({ ...p, pdf_ready: !!sub.pdf_ready, epub_ready: !!sub.epub_ready, proof_sent_to_author: !!sub.proof_sent_to_author, author_proof_approved: !!sub.author_proof_approved, isbn: sub.isbn || '', doi: sub.doi || '', repository_path: sub.repository_path || '' }));
      setPublishForm((p) => ({ ...p, slug: sub.slug || '', access_level: sub.access_level || 'open_access', landing_page_title: sub.title || '', is_public: sub.is_public ?? true }));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load workflow.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); loadReviewerOptions(); }, [id]);

  const reviewers = useMemo(() => (JSON.parse(localStorage.getItem('all_users_cache') || '[]') || []).filter(Boolean), []);

  const doAction = async (fn, success) => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await fn();
      setNotice(success);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    setError('');
    setNotice('');
    try {
      await ebookApi.uploadFile(id, selectedFile, fileRole);
      setNotice('File uploaded successfully.');
      setSelectedFile(null);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <MainLayout>
      <section className="content-header mb-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h1 className="mb-1">Submission Workflow</h1>
            <p className="text-muted mb-0">Full editorial, review, finance, production, and publication workflow.</p>
          </div>
          <div><Link className="btn btn-outline-secondary" to="/ebook/submissions">Back to submissions</Link></div>
        </div>
      </section>

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {notice ? <div className="alert alert-success">{notice}</div> : null}

      {loading ? <div className="card"><div className="card-body">Loading workflow…</div></div> : !data?.submission ? <div className="card"><div className="card-body text-muted">Submission not found.</div></div> : (
        <div className="row">
          <div className="col-lg-8">
            <div className="card card-primary card-outline mb-4">
              <div className="card-header"><h3 className="card-title mb-0">Submission summary</h3></div>
              <div className="card-body">
                <h4>{data.submission.title}</h4>
                <p className="text-muted">{data.submission.subtitle || 'No subtitle'}</p>
                <p>{data.submission.abstract || 'No abstract'}</p>
                <div className="mb-2"><strong>Status:</strong> <StatusBadge value={data.submission.status} /></div>
                <div className="mb-2"><strong>Author:</strong> {data.submission.author_name || '—'}</div>
                <div className="mb-2"><strong>Editor:</strong> {data.submission.editor_name || '—'}</div>
                <div className="mb-2"><strong>Decision:</strong> {data.submission.final_decision || '—'}</div>
                <div className="mb-0"><strong>Keywords:</strong> {(data.submission.keywords || []).join(', ') || '—'}</div>
              </div>
            </div>

            <div className="card card-secondary card-outline mb-4">
              <div className="card-header"><h3 className="card-title mb-0">Files</h3></div>
              <div className="card-body">
                <form className="mb-4" onSubmit={handleUpload}>
                  <div className="form-row align-items-end">
                    <div className="form-group col-md-3"><label>File role</label><select className="form-control" value={fileRole} onChange={(e)=>setFileRole(e.target.value)}><option value="manuscript">Manuscript</option><option value="revision">Revision</option><option value="proof">Proof</option><option value="pdf">PDF</option><option value="epub">EPUB</option><option value="cover">Cover</option></select></div>
                    <div className="form-group col-md-6"><label>File</label><input type="file" className="form-control" onChange={(e)=>setSelectedFile(e.target.files?.[0] || null)} /></div>
                    <div className="form-group col-md-3"><button className="btn btn-primary btn-block" disabled={uploading}>{uploading ? 'Uploading…' : 'Upload file'}</button></div>
                  </div>
                </form>
                <div className="table-responsive">
                  <table className="table table-sm table-bordered mb-0">
                    <thead><tr><th>Role</th><th>Name</th><th>Version</th><th>Type</th></tr></thead>
                    <tbody>{!(data.files || []).length ? <tr><td colSpan="4" className="text-center text-muted">No files uploaded.</td></tr> : data.files.map((file) => <tr key={file.file_id}><td>{file.file_role}</td><td>{file.original_name}</td><td>{file.version_no}</td><td>{file.mime_type || '—'}</td></tr>)}</tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="card card-secondary card-outline mb-4">
              <div className="card-header"><h3 className="card-title mb-0">Review assignments & reviews</h3></div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Assignments</h6>
                    <ul className="list-group mb-3">{!(data.assignments || []).length ? <li className="list-group-item text-muted">No assignments.</li> : data.assignments.map((item) => <li key={item.assignment_id} className="list-group-item"><div className="font-weight-bold">{item.reviewer_name || item.reviewer_id}</div><div><StatusBadge value={item.status} /></div><small className="text-muted">Due: {item.due_date || '—'}</small></li>)}</ul>
                  </div>
                  <div className="col-md-6">
                    <h6>Reviews</h6>
                    <ul className="list-group mb-0">{!(data.reviews || []).length ? <li className="list-group-item text-muted">No reviews.</li> : data.reviews.map((item) => <li key={item.review_id} className="list-group-item"><div className="font-weight-bold">{item.reviewer_name || item.reviewer_id}</div><div>{item.recommendation}</div><small className="text-muted">{item.comments_for_author || 'No author comments'}</small></li>)}</ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            {canAuthor ? <div className="card card-info card-outline mb-4"><div className="card-header"><h3 className="card-title mb-0">Author actions</h3></div><div className="card-body"><button className="btn btn-primary btn-block mb-2" disabled={saving} onClick={()=>doAction(()=>ebookApi.submitSubmission(id), 'Submission sent for editorial screening.')}>Submit manuscript</button><button className="btn btn-outline-primary btn-block" disabled={saving} onClick={()=>doAction(()=>ebookApi.resubmitSubmission(id, { reason: 'Updated after revision request.' }), 'Submission resubmitted.')}>Resubmit after revision</button></div></div> : null}

            {canEditor ? <div className="card card-warning card-outline mb-4"><div className="card-header"><h3 className="card-title mb-0">Editor actions</h3></div><div className="card-body">
              <div className="form-group"><label>Screening decision</label><select className="form-control" value={screening.decision} onChange={(e)=>setScreening({...screening,decision:e.target.value})}><option value="send_to_review">Send to review</option><option value="request_revision">Request revision</option><option value="reject">Reject</option></select></div>
              <div className="form-group"><label>Note</label><textarea className="form-control" rows="2" value={screening.note} onChange={(e)=>setScreening({...screening,note:e.target.value})} /></div>
              <button className="btn btn-warning btn-block mb-3" disabled={saving} onClick={()=>doAction(()=>ebookApi.screening(id, screening), 'Screening decision saved.')}>Save screening</button>
              <hr />
              <div className="form-group">
                <label>Select reviewer(s)</label>
                {reviewerOptionsError ? <div className="alert alert-danger py-2">{reviewerOptionsError}</div> : null}
                {!reviewerOptionsError && !reviewerOptions.length ? <div className="text-muted small">No EBOOK_REVIEWER users found.</div> : null}
                <div className="border rounded p-2" style={{maxHeight:'200px', overflowY:'auto'}}>
                  {reviewerOptions.map((r) => (
                    <div className="form-check" key={r.uuid}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`reviewer-${r.uuid}`}
                        checked={reviewerForm.reviewer_ids.includes(r.uuid)}
                        onChange={() => toggleReviewer(r.uuid)}
                      />
                      <label className="form-check-label" htmlFor={`reviewer-${r.uuid}`}>
                        {(r.reviewer_name || r.email)} {r.email ? `(${r.email})` : ''}
                        <span className="text-muted"> — active: {r.active_assignment_count || 0}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group"><label>Due date</label><input type="date" className="form-control" value={reviewerForm.due_date} onChange={(e)=>setReviewerForm({...reviewerForm,due_date:e.target.value})} /></div>
              <div className="form-group"><label>Invitation note</label><textarea className="form-control" rows="2" value={reviewerForm.invitation_note} onChange={(e)=>setReviewerForm({...reviewerForm,invitation_note:e.target.value})} /></div>
              <button className="btn btn-outline-warning btn-block mb-3" disabled={saving || !reviewerForm.reviewer_ids.length} onClick={()=>doAction(()=>ebookApi.assignReviewer(id, reviewerForm), 'Reviewer assigned.')}>Assign reviewer</button>
              <hr />
              <div className="form-group"><label>Editorial decision</label><select className="form-control" value={decisionForm.decision} onChange={(e)=>setDecisionForm({...decisionForm,decision:e.target.value})}><option value="accept">Accept</option><option value="minor_revision">Minor revision</option><option value="major_revision">Major revision</option><option value="reject">Reject</option></select></div>
              <div className="form-group"><label>Decision note</label><textarea className="form-control" rows="2" value={decisionForm.note} onChange={(e)=>setDecisionForm({...decisionForm,note:e.target.value})} /></div>
              <button className="btn btn-success btn-block" disabled={saving} onClick={()=>doAction(()=>ebookApi.makeDecision(id, decisionForm), 'Editorial decision recorded.')}>Save decision</button>
            </div></div> : null}

            {canFinance ? <div className="card card-danger card-outline mb-4"><div className="card-header"><h3 className="card-title mb-0">Finance clearance</h3></div><div className="card-body">
              <div className="form-group"><label>Invoice number</label><input className="form-control" value={financeForm.invoice_number} onChange={(e)=>setFinanceForm({...financeForm,invoice_number:e.target.value})} /></div>
              <div className="form-row"><div className="form-group col-6"><label>Amount due</label><input type="number" className="form-control" value={financeForm.amount_due} onChange={(e)=>setFinanceForm({...financeForm,amount_due:e.target.value})} /></div><div className="form-group col-6"><label>Amount paid</label><input type="number" className="form-control" value={financeForm.amount_paid} onChange={(e)=>setFinanceForm({...financeForm,amount_paid:e.target.value})} /></div></div>
              <div className="form-group"><label>Status</label><select className="form-control" value={financeForm.payment_status} onChange={(e)=>setFinanceForm({...financeForm,payment_status:e.target.value})}><option value="pending">Pending</option><option value="waiver_requested">Waiver requested</option><option value="waived">Waived</option><option value="partially_paid">Partially paid</option><option value="paid">Paid</option><option value="cleared">Cleared</option><option value="declined">Declined</option></select></div>
              <button className="btn btn-danger btn-block" disabled={saving} onClick={()=>doAction(()=>ebookApi.upsertFinance(id, financeForm), 'Finance record saved.')}>Save finance</button>
            </div></div> : null}

            {canProduction ? <div className="card card-success card-outline mb-4"><div className="card-header"><h3 className="card-title mb-0">Digital production & publication</h3></div><div className="card-body">
              <div className="form-check mb-2"><input id="pdf_ready" type="checkbox" className="form-check-input" checked={productionForm.pdf_ready} onChange={(e)=>setProductionForm({...productionForm,pdf_ready:e.target.checked})} /><label htmlFor="pdf_ready" className="form-check-label">PDF ready</label></div>
              <div className="form-check mb-2"><input id="epub_ready" type="checkbox" className="form-check-input" checked={productionForm.epub_ready} onChange={(e)=>setProductionForm({...productionForm,epub_ready:e.target.checked})} /><label htmlFor="epub_ready" className="form-check-label">EPUB ready</label></div>
              <div className="form-check mb-2"><input id="proof_sent" type="checkbox" className="form-check-input" checked={productionForm.proof_sent_to_author} onChange={(e)=>setProductionForm({...productionForm,proof_sent_to_author:e.target.checked})} /><label htmlFor="proof_sent" className="form-check-label">Proof sent to author</label></div>
              <div className="form-check mb-3"><input id="proof_ok" type="checkbox" className="form-check-input" checked={productionForm.author_proof_approved} onChange={(e)=>setProductionForm({...productionForm,author_proof_approved:e.target.checked})} /><label htmlFor="proof_ok" className="form-check-label">Author approved proof</label></div>
              <div className="form-group"><label>ISBN</label><input className="form-control" value={productionForm.isbn} onChange={(e)=>setProductionForm({...productionForm,isbn:e.target.value})} /></div>
              <div className="form-group"><label>DOI</label><input className="form-control" value={productionForm.doi} onChange={(e)=>setProductionForm({...productionForm,doi:e.target.value})} /></div>
              <div className="form-group"><label>Repository path</label><input className="form-control" value={productionForm.repository_path} onChange={(e)=>setProductionForm({...productionForm,repository_path:e.target.value})} /></div>
              <button className="btn btn-success btn-block mb-3" disabled={saving} onClick={()=>doAction(()=>ebookApi.upsertProduction(id, productionForm), 'Production metadata saved.')}>Save production</button>
              <hr />
              <div className="form-group"><label>Publication slug</label><input className="form-control" value={publishForm.slug} onChange={(e)=>setPublishForm({...publishForm,slug:e.target.value})} /></div>
              <div className="form-group"><label>Access level</label><select className="form-control" value={publishForm.access_level} onChange={(e)=>setPublishForm({...publishForm,access_level:e.target.value})}><option value="open_access">Open access</option><option value="restricted">Restricted</option><option value="embargoed">Embargoed</option></select></div>
              <div className="form-group"><label>Embargo until</label><input type="date" className="form-control" value={publishForm.embargo_until} onChange={(e)=>setPublishForm({...publishForm,embargo_until:e.target.value})} /></div>
              <div className="form-group"><label>License</label><input className="form-control" value={publishForm.license_name} onChange={(e)=>setPublishForm({...publishForm,license_name:e.target.value})} /></div>
              <button className="btn btn-outline-success btn-block" disabled={saving} onClick={()=>doAction(()=>ebookApi.publishSubmission(id, publishForm), 'Submission published to the ORA eBook catalog.')}>Publish</button>
            </div></div> : null}

            <div className="card card-light card-outline"><div className="card-header"><h3 className="card-title mb-0">Workflow history</h3></div><div className="card-body p-0"><ul className="list-group list-group-flush">{!(data.history || []).length ? <li className="list-group-item text-muted">No workflow history.</li> : data.history.map((item)=> <li className="list-group-item" key={item.history_id}><div className="font-weight-bold">{item.action}</div><div><small>{item.actor_name || item.actor_id || 'System'}</small></div><div><small className="text-muted">{item.from_status || '—'} → {item.to_status || '—'}</small></div><div className="text-muted small">{item.note || ''}</div></li>)}</ul></div></div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
