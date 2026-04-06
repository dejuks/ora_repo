import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../../components/layout/MainLayout.jsx';
import libraryApi from '../../../api/library.api';

const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
};

const canResubmit = (status) => ['draft', 'correction_requested', 'rejected'].includes(String(status || '').toLowerCase());

export default function SubmissionWorkflowPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({
    title: '', subtitle: '', abstract: '', publication_year: '', isbn: '', issn: '',
    access_level: 'registered_users', note: ''
  });
  const [revisionReason, setRevisionReason] = useState('Corrected metadata and files as requested.');
  const [fileRole, setFileRole] = useState('main');
  const [selectedFile, setSelectedFile] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await libraryApi.getSubmissionWorkflow(id);
      setData(result);
      const submission = result?.submission || {};
      setForm({
        title: submission.title || '',
        subtitle: submission.subtitle || '',
        abstract: submission.abstract || '',
        publication_year: submission.publication_year || '',
        isbn: submission.isbn || '',
        issn: submission.issn || '',
        access_level: submission.access_level || 'registered_users',
        note: submission.note || '',
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load submission workflow.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const latestCorrection = useMemo(() => {
    const reviews = data?.reviews || [];
    return reviews.find((item) => String(item.decision || '').toLowerCase() === 'correction_requested') || null;
  }, [data]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await libraryApi.update('digital-submissions', id, {
        ...form,
        publication_year: form.publication_year ? Number(form.publication_year) : null,
      });
      setNotice('Submission metadata updated.');
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update submission.');
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
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('file_role', fileRole);
      await libraryApi.uploadSubmissionFile(id, selectedFile, fileRole);
      setSelectedFile(null);
      setNotice('Revision file uploaded successfully.');
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to upload revision file.');
    } finally {
      setUploading(false);
    }
  };

  const handleResubmit = async () => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await libraryApi.resubmitDigitalSubmission(id, {
        metadata: {
          ...form,
          publication_year: form.publication_year ? Number(form.publication_year) : null,
        },
        reason: revisionReason,
      });
      setNotice('Submission resubmitted for review.');
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to resubmit submission.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <section className="content-header">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <div>
            <h1>Submission Revision Workflow</h1>
            <p className="text-muted mb-0">Review feedback, update metadata, upload corrected files, and resubmit.</p>
          </div>
          <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/library/uploader/dashboard')}>
            Back to dashboard
          </button>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          {error ? <div className="alert alert-danger">{error}</div> : null}
          {notice ? <div className="alert alert-success">{notice}</div> : null}

          {loading ? (
            <div className="card"><div className="card-body">Loading workflow…</div></div>
          ) : !data?.submission ? (
            <div className="card"><div className="card-body text-muted">Submission not found.</div></div>
          ) : (
            <div className="row">
              <div className="col-lg-8">
                <div className="card card-primary card-outline">
                  <div className="card-header"><h3 className="card-title">Submission Details</h3></div>
                  <div className="card-body">
                    <form onSubmit={handleSave}>
                      <div className="form-group">
                        <label>Title</label>
                        <input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                      </div>
                      <div className="form-group">
                        <label>Subtitle</label>
                        <input className="form-control" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Abstract</label>
                        <textarea className="form-control" rows="5" value={form.abstract} onChange={(e) => setForm({ ...form, abstract: e.target.value })} />
                      </div>
                      <div className="form-row">
                        <div className="form-group col-md-4">
                          <label>Publication Year</label>
                          <input type="number" className="form-control" value={form.publication_year} onChange={(e) => setForm({ ...form, publication_year: e.target.value })} />
                        </div>
                        <div className="form-group col-md-4">
                          <label>ISBN</label>
                          <input className="form-control" value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
                        </div>
                        <div className="form-group col-md-4">
                          <label>ISSN</label>
                          <input className="form-control" value={form.issn} onChange={(e) => setForm({ ...form, issn: e.target.value })} />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group col-md-6">
                          <label>Access Level</label>
                          <select className="form-control" value={form.access_level} onChange={(e) => setForm({ ...form, access_level: e.target.value })}>
                            <option value="public">Public</option>
                            <option value="registered_users">Registered Users</option>
                            <option value="students_only">Students Only</option>
                            <option value="staff_only">Staff Only</option>
                            <option value="restricted">Restricted</option>
                          </select>
                        </div>
                        <div className="form-group col-md-6">
                          <label>Internal note</label>
                          <input className="form-control" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-primary mr-2" disabled={saving}>Save metadata</button>
                        {canResubmit(data.submission.status) ? (
                          <button type="button" className="btn btn-success" disabled={saving} onClick={handleResubmit}>Resubmit for review</button>
                        ) : null}
                      </div>
                    </form>
                  </div>
                </div>

                <div className="card card-info card-outline">
                  <div className="card-header"><h3 className="card-title">Upload Corrected Files</h3></div>
                  <div className="card-body">
                    <form onSubmit={handleUpload}>
                      <div className="form-row align-items-end">
                        <div className="form-group col-md-3">
                          <label>File role</label>
                          <select className="form-control" value={fileRole} onChange={(e) => setFileRole(e.target.value)}>
                            <option value="main">Main</option>
                            <option value="cover">Cover</option>
                            <option value="supplementary">Supplementary</option>
                            <option value="preview">Preview</option>
                          </select>
                        </div>
                        <div className="form-group col-md-6">
                          <label>Select file</label>
                          <input type="file" className="form-control" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                        </div>
                        <div className="form-group col-md-3">
                          <button type="submit" className="btn btn-info btn-block" disabled={uploading || !selectedFile}>Upload file</button>
                        </div>
                      </div>
                    </form>
                    <div className="table-responsive mt-3">
                      <table className="table table-sm table-bordered mb-0">
                        <thead>
                          <tr>
                            <th>Original file</th>
                            <th>Role</th>
                            <th>Uploaded at</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(data.files || []).length === 0 ? (
                            <tr><td colSpan="3" className="text-center text-muted">No files uploaded yet.</td></tr>
                          ) : (
                            data.files.map((file) => (
                              <tr key={file.submission_file_id}>
                                <td>{file.original_name}</td>
                                <td>{file.file_role}</td>
                                <td>{formatDateTime(file.uploaded_at)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card card-warning card-outline">
                  <div className="card-header"><h3 className="card-title">Latest Review Feedback</h3></div>
                  <div className="card-body">
                    {latestCorrection ? (
                      <>
                        <p><strong>Decision:</strong> {latestCorrection.decision}</p>
                        <p><strong>Reviewer:</strong> {latestCorrection.reviewer_name || latestCorrection.reviewer_email || '—'}</p>
                        <p><strong>Reviewed:</strong> {formatDateTime(latestCorrection.reviewed_at)}</p>
                        <p><strong>Comments:</strong><br />{latestCorrection.comments || 'No comments provided.'}</p>
                      </>
                    ) : (
                      <p className="text-muted mb-0">No correction request found for this submission.</p>
                    )}
                    {canResubmit(data.submission.status) ? (
                      <div className="mt-3">
                        <label>Resubmission note</label>
                        <textarea className="form-control" rows="4" value={revisionReason} onChange={(e) => setRevisionReason(e.target.value)} />
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="card card-secondary card-outline">
                  <div className="card-header"><h3 className="card-title">Workflow History</h3></div>
                  <div className="card-body p-0">
                    <ul className="list-group list-group-flush">
                      {(data.history || []).length === 0 ? (
                        <li className="list-group-item text-muted">No status history available.</li>
                      ) : (
                        data.history.map((item) => (
                          <li key={item.history_id} className="list-group-item">
                            <div className="d-flex justify-content-between">
                              <strong>{item.old_status || '—'} → {item.new_status}</strong>
                              <span className="text-muted">{formatDateTime(item.changed_at)}</span>
                            </div>
                            <div className="small text-muted">{item.changed_by_name || item.changed_by_email || 'System'}</div>
                            {item.reason ? <div className="small mt-1">{item.reason}</div> : null}
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>

                <div className="card card-light card-outline">
                  <div className="card-header"><h3 className="card-title">Submission Snapshot</h3></div>
                  <div className="card-body">
                    <p><strong>Status:</strong> {data.submission.status}</p>
                    <p><strong>Publisher:</strong> {data.submission.publisher_name || '—'}</p>
                    <p><strong>Material Type:</strong> {data.submission.material_type_name || '—'}</p>
                    <p><strong>Category:</strong> {data.submission.category_name || '—'}</p>
                    <p><strong>Language:</strong> {data.submission.language_name || '—'}</p>
                    <p><strong>Submitted:</strong> {formatDateTime(data.submission.submitted_at)}</p>
                    <p><strong>Reviewed:</strong> {formatDateTime(data.submission.reviewed_at)}</p>
                    <p className="mb-0"><strong>Published:</strong> {formatDateTime(data.submission.publication_published_at || data.submission.published_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
