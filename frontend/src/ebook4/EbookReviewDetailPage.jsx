import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout.jsx";
import ebookApi from "../../api/ebook.api";
import StatusBadge from "./components/StatusBadge.jsx";

const defaultForm = {
  originality_score: 3,
  quality_score: 3,
  relevance_score: 3,
  recommendation: "accept",
  comments_for_author: "",
  confidential_comments: "",
};

export default function EbookReviewDetailPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [assignment, setAssignment] = useState(null);
  const [files, setFiles] = useState({ manuscript_files: [], review_attachments: [] });
  const [template, setTemplate] = useState({ criteria: [], recommendations: [] });
  const [form, setForm] = useState(defaultForm);
  const [extension, setExtension] = useState({ requested_due_date: "", reason: "" });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [assignmentRes, filesRes, templateRes] = await Promise.all([
        ebookApi.getReviewAssignmentDetail(id),
        ebookApi.getReviewAssignmentFiles(id),
        ebookApi.getReviewTemplate(),
      ]);
      setAssignment(assignmentRes);
      setFiles(filesRes || { manuscript_files: [], review_attachments: [] });
      setTemplate(templateRes || { criteria: [], recommendations: [] });
      setForm({
        originality_score: assignmentRes?.review?.originality_score ?? 3,
        quality_score: assignmentRes?.review?.quality_score ?? 3,
        relevance_score: assignmentRes?.review?.relevance_score ?? 3,
        recommendation: assignmentRes?.review?.recommendation || "accept",
        comments_for_author: assignmentRes?.review?.comments_for_author || "",
        confidential_comments: assignmentRes?.review?.confidential_comments || "",
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load review assignment details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const overdue = useMemo(() => {
    if (!assignment?.due_date) return false;
    return new Date(assignment.due_date) < new Date(new Date().toISOString().slice(0, 10));
  }, [assignment]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const saveReview = async (mode) => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      if (mode === "update" && assignment?.review?.review_id) {
        await ebookApi.updateReview(id, form);
        setNotice("Review updated successfully.");
      } else {
        await ebookApi.submitReview(id, form);
        setNotice("Review submitted successfully.");
      }
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save review.");
    } finally {
      setSaving(false);
    }
  };

  const sendResponse = async (status) => {
    setError("");
    setNotice("");
    try {
      await ebookApi.respondAssignment(id, { status });
      setNotice(`Assignment ${status}.`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update assignment response.");
    }
  };

  const requestExtension = async () => {
    setError("");
    setNotice("");
    try {
      await ebookApi.requestReviewExtension(id, extension);
      setNotice("Extension request sent to the editor.");
      setExtension({ requested_due_date: "", reason: "" });
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to request extension.");
    }
  };

  const uploadAttachment = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    setNotice("");
    try {
      await ebookApi.uploadReviewFile(id, file);
      setNotice("Review attachment uploaded successfully.");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to upload review attachment.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <MainLayout>
      <section className="content-header mb-3 d-flex justify-content-between align-items-center flex-wrap">
        <div>
          <h1 className="mb-1">Review Assignment Detail</h1>
          <p className="text-muted mb-0">Structured blinded review workspace for the assigned manuscript.</p>
        </div>
        <Link to="/ebook/reviewer" className="btn btn-outline-secondary">
          Back to Reviewer Workspace
        </Link>
      </section>

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {notice ? <div className="alert alert-success">{notice}</div> : null}

      {loading ? (
        <div className="card card-body">Loading…</div>
      ) : !assignment ? (
        <div className="alert alert-warning">Assignment not found.</div>
      ) : (
        <div className="row">
          <div className="col-lg-8">
            <div className="card card-outline card-primary mb-3">
              <div className="card-header d-flex justify-content-between align-items-start flex-wrap">
                <div>
                  <h3 className="card-title mb-1">{assignment.title}</h3>
                  <div className="text-muted small">
                    <StatusBadge value={assignment.status} />
                    {assignment.due_date ? <> <span className="ml-2">Due {assignment.due_date}</span></> : null}
                    {overdue ? <span className="badge badge-danger ml-2">Overdue</span> : null}
                  </div>
                </div>
              </div>
              <div className="card-body">
                <p className="mb-3">{assignment.abstract || "No abstract provided."}</p>
                <div className="mb-3">
                  <button className="btn btn-sm btn-outline-primary mr-2" onClick={() => sendResponse("accepted")}>Accept assignment</button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => sendResponse("declined")}>Decline assignment</button>
                </div>
                <div className="row">
                  {(template.criteria || []).map((criterion) => (
                    <div className="col-md-4" key={criterion.key}>
                      <div className="form-group">
                        <label>{criterion.label}</label>
                        <select className="form-control" value={form[criterion.key]} onChange={(e) => setField(criterion.key, Number(e.target.value))}>
                          {[1, 2, 3, 4, 5].map((score) => (
                            <option key={score} value={score}>{score}</option>
                          ))}
                        </select>
                        <small className="form-text text-muted">{criterion.help}</small>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="form-group">
                  <label>Recommendation</label>
                  <select className="form-control" value={form.recommendation} onChange={(e) => setField("recommendation", e.target.value)}>
                    {(template.recommendations || []).map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Comments for Author</label>
                  <textarea className="form-control" rows="5" value={form.comments_for_author} onChange={(e) => setField("comments_for_author", e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Confidential Comments to Editor</label>
                  <textarea className="form-control" rows="5" value={form.confidential_comments} onChange={(e) => setField("confidential_comments", e.target.value)} />
                </div>
                <button disabled={saving} className="btn btn-primary" onClick={() => saveReview(assignment?.review ? "update" : "submit")}>{saving ? "Saving…" : assignment?.review ? "Update Review" : "Submit Review"}</button>
              </div>
            </div>

            <div className="card card-outline card-secondary mb-3">
              <div className="card-header"><h3 className="card-title mb-0">Request Deadline Extension</h3></div>
              <div className="card-body row">
                <div className="col-md-4 form-group">
                  <label>Requested due date</label>
                  <input type="date" className="form-control" value={extension.requested_due_date} onChange={(e) => setExtension((prev) => ({ ...prev, requested_due_date: e.target.value }))} />
                </div>
                <div className="col-md-8 form-group">
                  <label>Reason</label>
                  <input className="form-control" value={extension.reason} onChange={(e) => setExtension((prev) => ({ ...prev, reason: e.target.value }))} placeholder="Explain why you need more time" />
                </div>
                <div className="col-12">
                  <button className="btn btn-outline-primary" onClick={requestExtension}>Send extension request</button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card card-outline card-info mb-3">
              <div className="card-header"><h3 className="card-title mb-0">Manuscript Files</h3></div>
              <div className="card-body">
                {!files.manuscript_files?.length ? <div className="text-muted">No manuscript files available.</div> : files.manuscript_files.map((file) => (
                  <div key={file.file_id} className="border rounded p-2 mb-2">
                    <div className="font-weight-bold">{file.original_name}</div>
                    <div className="small text-muted text-capitalize">{String(file.file_role || "").replace(/_/g, " ")}</div>
                    <a className="small" href={`/${file.file_path}`} target="_blank" rel="noreferrer">Open file</a>
                  </div>
                ))}
              </div>
            </div>

            <div className="card card-outline card-info mb-3">
              <div className="card-header"><h3 className="card-title mb-0">Review Attachments</h3></div>
              <div className="card-body">
                <div className="form-group">
                  <label>Upload attachment</label>
                  <input type="file" className="form-control" onChange={uploadAttachment} disabled={uploading} />
                  <small className="form-text text-muted">Upload annotated notes or supporting reviewer files.</small>
                </div>
                {!files.review_attachments?.length ? <div className="text-muted">No review attachments uploaded yet.</div> : files.review_attachments.map((file) => (
                  <div key={file.file_id} className="border rounded p-2 mb-2">
                    <div className="font-weight-bold">{file.original_name}</div>
                    <div className="small text-muted">Uploaded {String(file.created_at || "").slice(0, 10)}</div>
                    <a className="small" href={`/${file.file_path}`} target="_blank" rel="noreferrer">Open attachment</a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
