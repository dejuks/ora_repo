import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout.jsx";
import ebookApi from "../../api/ebook.api";
import StatusBadge from "./components/StatusBadge.jsx";

export default function EbookAuthorReviewCommentsPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [data, setData] = useState(null);
  const [revisionFile, setRevisionFile] = useState(null);
  const [revisionNote, setRevisionNote] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await ebookApi.getReviewComments(id);
      setData(result);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load revision request details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const canResubmit = !!data?.can_resubmit;

  const handleResubmit = async (e) => {
    e.preventDefault();
    if (!revisionFile) {
      setError("Please choose the revised manuscript file before resubmitting.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await ebookApi.uploadFile(id, revisionFile, "revision");
      await ebookApi.resubmitSubmission(id, {
        reason: revisionNote || "Revised manuscript uploaded by author.",
      });
      setRevisionFile(null);
      setRevisionNote("");
      setNotice("Revision uploaded and manuscript resubmitted successfully.");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to resubmit the revised manuscript.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <section className="content-header mb-3 d-flex justify-content-between align-items-center flex-wrap">
        <div>
          <h1 className="mb-1">Author Revision Request</h1>
          <p className="text-muted mb-0">
            This page shows only the selected submission. Revision upload is enabled only when the editor has formally requested a revision.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link className="btn btn-outline-secondary mr-2" to="/ebook/my-revisions">Revision list</Link>
          <Link className="btn btn-outline-secondary" to={`/ebook/submissions/${id}`}>Open submission detail</Link>
        </div>
      </section>

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {notice ? <div className="alert alert-success">{notice}</div> : null}

      {loading ? (
        <div className="card"><div className="card-body">Loading revision request…</div></div>
      ) : !data?.submission ? (
        <div className="card"><div className="card-body text-muted">No revision request data found.</div></div>
      ) : (
        <>
          <div className="card card-primary card-outline mb-4">
            <div className="card-header"><h3 className="card-title mb-0">Selected submission</h3></div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-bordered mb-0">
                  <tbody>
                    <tr>
                      <th style={{ width: 220 }}>Title</th>
                      <td>{data.submission.title || "—"}</td>
                    </tr>
                    <tr>
                      <th>Subtitle</th>
                      <td>{data.submission.subtitle || "—"}</td>
                    </tr>
                    <tr>
                      <th>Status</th>
                      <td><StatusBadge value={data.submission.status} /></td>
                    </tr>
                    <tr>
                      <th>Editor</th>
                      <td>{data.submission.editor_name || "—"}</td>
                    </tr>
                    <tr>
                      <th>Editor decision</th>
                      <td>{data.submission.final_decision || "Revision requested"}</td>
                    </tr>
                    <tr>
                      <th>Editor note</th>
                      <td>{data.revision_request?.note || data.submission.final_decision_note || "—"}</td>
                    </tr>
                    <tr>
                      <th>Revision requested at</th>
                      <td>{data.revision_request?.created_at ? new Date(data.revision_request.created_at).toLocaleString() : "—"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-4 mb-3">
              <div className="small-box bg-info">
                <div className="inner">
                  <h3>{data.summary?.total_reviews || 0}</h3>
                  <p>Reviewer comments</p>
                </div>
              </div>
            </div>
            <div className="col-md-8 mb-3">
              <div className="card card-light card-outline h-100">
                <div className="card-header"><h3 className="card-title mb-0">Reviewer recommendation summary</h3></div>
                <div className="card-body">
                  {!Object.keys(data.summary?.recommendations || {}).length ? (
                    <div className="text-muted">
                      No reviewer recommendation has been submitted yet. Reviewer comments are optional for author resubmission when the editor already requested revision.
                    </div>
                  ) : (
                    <div className="d-flex flex-wrap" style={{ gap: 8 }}>
                      {Object.entries(data.summary?.recommendations || {}).map(([key, value]) => (
                        <span className="badge badge-secondary p-2" key={key}>{key}: {value}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card card-secondary card-outline mb-4">
            <div className="card-header"><h3 className="card-title mb-0">Reviewer feedback</h3></div>
            <div className="card-body">
              {!data.reviews?.length ? (
                <div className="alert alert-light border mb-0">
                  No reviewer comments are available for this submission. That is acceptable if the editor directly requested revision during screening or decision making.
                </div>
              ) : data.reviews.map((review, index) => (
                <div className="border rounded p-3 mb-3" key={review.review_id}>
                  <div className="d-flex justify-content-between align-items-center flex-wrap mb-2">
                    <div className="font-weight-bold">Review #{index + 1}</div>
                    <div className="d-flex align-items-center" style={{ gap: 8 }}>
                      <StatusBadge value={review.assignment_status || "submitted"} />
                      <span className="badge badge-info">{review.recommendation || "No recommendation"}</span>
                    </div>
                  </div>
                  <div className="text-muted small mb-2">
                    Reviewer: {review.reviewer_name || "Anonymous"} • Submitted at: {review.submitted_at ? new Date(review.submitted_at).toLocaleString() : "—"}
                  </div>
                  <div style={{ whiteSpace: "pre-wrap" }}>{review.comments_for_author || "No author-facing comments."}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card card-warning card-outline">
            <div className="card-header"><h3 className="card-title mb-0">Revision & resubmission</h3></div>
            <div className="card-body">
              {!canResubmit ? (
                <div className="alert alert-light border mb-0">
                  Resubmission is only enabled when the editor has placed this submission into a revision-required stage.
                </div>
              ) : (
                <form onSubmit={handleResubmit}>
                  <div className="alert alert-warning">
                    Upload the revised manuscript here. Reviewer comments are optional guidance. The editor's revision request is the actual condition that enables resubmission.
                  </div>
                  <div className="form-group">
                    <label>Revised manuscript file</label>
                    <input type="file" className="form-control" onChange={(e) => setRevisionFile(e.target.files?.[0] || null)} />
                    <small className="text-muted">Use DOCX or PDF for the revised manuscript. Additional supporting files can still be uploaded from the submission detail page.</small>
                  </div>
                  <div className="form-group mb-0">
                    <label>Revision note</label>
                    <textarea className="form-control" rows="4" value={revisionNote} onChange={(e) => setRevisionNote(e.target.value)} placeholder="Explain what you changed based on the editor note and any available reviewer comments." />
                  </div>
                  <div className="mt-3 d-flex flex-wrap" style={{ gap: 8 }}>
                    <button className="btn btn-primary" disabled={saving}>{saving ? "Resubmitting…" : "Upload revision & resubmit"}</button>
                    <Link className="btn btn-outline-secondary" to={`/ebook/submissions/${id}`}>Back to detail</Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        </>
      )}
    </MainLayout>
  );
}
