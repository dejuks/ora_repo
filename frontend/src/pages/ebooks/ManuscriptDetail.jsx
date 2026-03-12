// src/ebook/pages/ManuscriptDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout.jsx";

import {
  ebookDetail,
  editorStartScreening,
  editorRequestRevision,
  editorSendToReview,
  editorDeskReject,
  getScreeningFormData,
  submitScreeningAssessment,
  getReviewSummary,
} from "../../api/ebooks.js";

export default function ManuscriptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Editor states
  const [editorNote, setEditorNote] = useState("");
  const [revisionType, setRevisionType] = useState("MINOR");
  const [actionLoading, setActionLoading] = useState(false);

  // Screening assessment states
  const [screeningData, setScreeningData] = useState(null);
  const [showScreeningModal, setShowScreeningModal] = useState(false);
  const [screeningForm, setScreeningForm] = useState({
    relevanceScore: 3,
    scopeMatch: true,
    qualityScore: 3,
    comments: "",
    recommendedAction: "SEND_TO_REVIEW",
    reviewerIds: [],
  });

  // Review summary
  const [reviewSummary, setReviewSummary] = useState(null);

  // Compute user permissions
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const userRoles = useMemo(() => (Array.isArray(user.roles) ? user.roles : []), [user]);

  const isEditor = useMemo(() => userRoles.includes("EBOOK_EDITOR") || user.isStaff === true, [userRoles, user.isStaff]);
  const isReviewer = useMemo(() => userRoles.includes("PEER_REVIEWER"), [userRoles]);

  const isAuthor = useMemo(() => data?.ebook?.author_id === user.uuid, [data, user.uuid]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ebookDetail(id);
      if (!res.success) {
        setError(res.message || "Failed to load manuscript details");
      } else {
        setData(res.data);

        // If editor, load screening data
        if ((userRoles.includes("EBOOK_EDITOR") || user.isStaff === true) && res.data?.ebook?.status === "SCREENING") {
          const screeningRes = await getScreeningFormData(id);
          if (screeningRes.success) setScreeningData(screeningRes.data);
        }

        // If editor and manuscript is under review, load review summary
        if ((userRoles.includes("EBOOK_EDITOR") || user.isStaff === true) && res.data?.ebook?.status === "UNDER_REVIEW") {
          const reviewRes = await getReviewSummary(id);
          if (reviewRes.success) setReviewSummary(reviewRes.data);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleEditorAction = async (action) => {
    const nice = action.toLowerCase().replace(/_/g, " ");
    if (!window.confirm(`Are you sure you want to ${nice} this manuscript?`)) return;

    setActionLoading(true);
    try {
      let res;
      switch (action) {
        case "START_SCREENING":
          res = await editorStartScreening(id);
          break;
        case "DESK_REJECT":
          res = await editorDeskReject(id, { note: editorNote });
          break;
        case "SEND_TO_REVIEW":
          res = await editorSendToReview(id, { note: editorNote });
          break;
        default:
          setActionLoading(false);
          return;
      }

      if (!res.success) {
        alert(res.message || `Failed to ${action}`);
      } else {
        setEditorNote("");
        loadData();
      }
    } catch (err) {
      alert(`Error performing action: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!window.confirm(`Request ${revisionType.toLowerCase()} revision for this manuscript?`)) return;

    setActionLoading(true);
    try {
      const res = await editorRequestRevision(id, { revisionType, note: editorNote });
      if (!res.success) {
        alert(res.message || "Failed to request revision");
      } else {
        setEditorNote("");
        setRevisionType("MINOR");
        loadData();
      }
    } catch (err) {
      alert(`Error requesting revision: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleScreeningSubmit = async () => {
    if (screeningForm.recommendedAction === "SEND_TO_REVIEW" && screeningForm.reviewerIds.length === 0) {
      alert("Please select at least one reviewer");
      return;
    }

    setActionLoading(true);
    try {
      const res = await submitScreeningAssessment(id, screeningForm);
      if (!res.success) {
        alert(res.message || "Failed to submit screening");
      } else {
        setShowScreeningModal(false);
        loadData();
      }
    } catch (err) {
      alert(`Error submitting screening: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      DRAFT: "badge-secondary",
      SUBMITTED: "badge-primary",
      SCREENING: "badge-info",
      UNDER_REVIEW: "badge-warning",
      REVISION_REQUESTED: "badge-warning",
      REVIEW_COMPLETED: "badge-success",
      ACCEPTED: "badge-success",
      REJECTED: "badge-danger",
      IN_PRODUCTION: "badge-secondary",
      PUBLISHED: "badge-success",
    };
    return classes[status] || "badge-secondary";
  };

  const formatStatus = (status) => (status?.replace(/_/g, " ") || "");

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes) => {
    const b = Number(bytes || 0);
    if (b <= 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return `${parseFloat((b / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const fileTypeLabel = (t) => {
    if (t === "ORIGINAL") return { text: "ORIGINAL", cls: "badge-primary", icon: "fa-file-pdf" };
    if (t === "REVISED") return { text: "REVISED", cls: "badge-warning", icon: "fa-file-signature" };
    if (t === "FINAL_PDF") return { text: "FINAL PDF", cls: "badge-success", icon: "fa-file-check" };
    if (t === "SUPPLEMENTARY") return { text: "SUPPLEMENTARY", cls: "badge-info", icon: "fa-paperclip" };
    return { text: t || "FILE", cls: "badge-secondary", icon: "fa-file" };
  };

  const actionIconFa = (action) => {
    const icons = {
      SUBMIT: "fa-paper-plane",
      SAVE_DRAFT: "fa-save",
      START_SCREENING: "fa-play-circle",
      REQUEST_REVISION: "fa-edit",
      SEND_TO_REVIEW: "fa-share-square",
      DESK_REJECT: "fa-times-circle",
      RESUBMIT_REVISION: "fa-sync-alt",
      UPLOAD_FILE: "fa-upload",
      DELETE: "fa-trash",
    };
    return icons[action] || "fa-history";
  };

  const handleDownload = (file) => {
    window.open(`/api/files/${file.stored_name}`, "_blank");
  };

  // Loading
  if (loading) {
    return (
      <MainLayout>
        <div className="content-header">
          <section className="content">
            <div className="container-fluid">
              <div className="card">
                <div className="card-body text-center py-5">
                  <div className="spinner-border text-primary" role="status" />
                  <div className="text-muted mt-3">Loading manuscript details...</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </MainLayout>
    );
  }

  // Error
  if (error) {
    return (
      <MainLayout>
        <div className="content-header">
          <section className="content">
            <div className="container-fluid">
              <div className="alert alert-danger">
                <i className="fas fa-exclamation-triangle mr-2" />
                {error}
              </div>
            </div>
          </section>
        </div>
      </MainLayout>
    );
  }

  if (!data) {
    return (
      <MainLayout>
        <div className="content-header">
          <section className="content">
            <div className="container-fluid">
              <div className="alert alert-warning">
                <i className="fas fa-exclamation-circle mr-2" />
                Manuscript not found
              </div>
            </div>
          </section>
        </div>
      </MainLayout>
    );
  }

  const { ebook, versions = [], files = [], history = [] } = data;
  const currentVersion = versions?.[0]?.version_no || 1;

  return (
    <MainLayout>
      <div className="content-header">
        {/* Header */}
        <section className="content-header">
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-start flex-wrap">
              <div>
                <button className="btn btn-default mb-2" onClick={() => navigate(-1)}>
                  <i className="fas fa-arrow-left mr-1" />
                  Back
                </button>

                <h1 className="m-0">{ebook.title}</h1>

                <div className="mt-2 d-flex flex-wrap align-items-center">
                  <span className={`badge ${getStatusBadgeClass(ebook.status)} mr-2 text-uppercase`}>
                    {formatStatus(ebook.status)}
                  </span>
                  <span className="text-muted mr-3">
                    <i className="fas fa-code-branch mr-1" /> Version {currentVersion}
                  </span>
                  <span className="text-muted">
                    <i className="far fa-calendar-alt mr-1" /> Submitted: {formatDate(ebook.submitted_at)}
                  </span>
                </div>
              </div>

              <div className="mt-2">
                {isAuthor && ebook.status === "DRAFT" && (
                  <button className="btn btn-primary mr-2" onClick={() => navigate(`/ebook/${id}/edit`)}>
                    <i className="fas fa-edit mr-2" />
                    Continue Editing
                  </button>
                )}

                {isAuthor && ebook.status === "REVISION_REQUESTED" && (
                  <button className="btn btn-warning" onClick={() => navigate(`/ebook/${id}/revision`)}>
                    <i className="fas fa-sync-alt mr-2" />
                    Submit Revision
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="content">
          <div className="container-fluid">
            {/* Tabs (AdminLTE pills) */}
            <div className="card">
              <div className="card-header p-2">
                <ul className="nav nav-pills">
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
                      onClick={() => setActiveTab("overview")}
                    >
                      <i className="fas fa-info-circle mr-1" /> Overview
                    </button>
                  </li>

                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link ${activeTab === "files" ? "active" : ""}`}
                      onClick={() => setActiveTab("files")}
                    >
                      <i className="fas fa-folder-open mr-1" /> Files ({files.length})
                    </button>
                  </li>

                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link ${activeTab === "history" ? "active" : ""}`}
                      onClick={() => setActiveTab("history")}
                    >
                      <i className="fas fa-history mr-1" /> History
                    </button>
                  </li>

                  {isEditor && ebook.status === "UNDER_REVIEW" && (
                    <li className="nav-item">
                      <button
                        type="button"
                        className={`nav-link ${activeTab === "reviews" ? "active" : ""}`}
                        onClick={() => setActiveTab("reviews")}
                      >
                        <i className="fas fa-comments mr-1" /> Reviews
                      </button>
                    </li>
                  )}
                </ul>
              </div>

              <div className="card-body">
                {/* OVERVIEW */}
                {activeTab === "overview" && (
                  <div className="row">
                    <div className="col-lg-8">
                      <div className="card card-outline card-primary">
                        <div className="card-header">
                          <h3 className="card-title">
                            <i className="fas fa-align-left mr-2" />
                            Abstract
                          </h3>
                        </div>
                        <div className="card-body">
                          <div className="text-muted small mb-2">Summary</div>
                          <div>{ebook.abstract || <span className="text-muted">No abstract provided.</span>}</div>
                        </div>
                      </div>

                      <div className="card card-outline card-secondary">
                        <div className="card-header">
                          <h3 className="card-title">
                            <i className="fas fa-tags mr-2" />
                            Keywords
                          </h3>
                        </div>
                        <div className="card-body">
                          {Array.isArray(ebook.keywords) && ebook.keywords.length > 0 ? (
                            <div>
                              {ebook.keywords.map((kw, i) => (
                                <span key={i} className="badge badge-light mr-1 mb-1">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="text-muted">No keywords provided.</div>
                          )}
                        </div>
                      </div>

                      <div className="card card-outline card-info">
                        <div className="card-header">
                          <h3 className="card-title">
                            <i className="fas fa-code-branch mr-2" />
                            Version History
                          </h3>
                        </div>
                        <div className="card-body p-0">
                          <ul className="list-group list-group-flush">
                            {versions.map((v, idx) => (
                              <li key={v.version_id} className="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                  <div className="font-weight-bold">Version {v.version_no}</div>
                                  <div className="text-muted small">
                                    <i className="far fa-calendar-alt mr-1" />
                                    {formatDate(v.submitted_at)}
                                  </div>
                                </div>
                                {idx === 0 ? <span className="badge badge-primary">Current</span> : null}
                              </li>
                            ))}
                            {versions.length === 0 && (
                              <li className="list-group-item text-muted">No versions found.</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-4">
                      <div className="card card-outline card-secondary">
                        <div className="card-header">
                          <h3 className="card-title">
                            <i className="fas fa-info-circle mr-2" />
                            Metadata
                          </h3>
                        </div>

                        <div className="card-body">
                          <div className="mb-3">
                            <div className="text-muted small">Submission ID</div>
                            <div className="text-monospace">{ebook.ebook_id}</div>
                          </div>

                          <div className="mb-3">
                            <div className="text-muted small">Submitted</div>
                            <div>{formatDate(ebook.submitted_at)}</div>
                          </div>

                          <div className="mb-3">
                            <div className="text-muted small">Last Updated</div>
                            <div>{formatDate(ebook.updated_at)}</div>
                          </div>

                          <div className="mb-3">
                            <div className="text-muted small">Current Version</div>
                            <div>{currentVersion}</div>
                          </div>

                          <div>
                            <div className="text-muted small">Total Files</div>
                            <div>{files.length}</div>
                          </div>
                        </div>
                      </div>

                      <div className="card card-outline card-info">
                        <div className="card-header">
                          <h3 className="card-title">
                            <i className="fas fa-bolt mr-2" />
                            Quick Actions
                          </h3>
                        </div>

                        <div className="card-body">
                          <button className="btn btn-outline-secondary btn-block" onClick={() => window.print()}>
                            <i className="fas fa-print mr-2" />
                            Print
                          </button>

                          <button
                            className="btn btn-outline-secondary btn-block"
                            onClick={() => {
                              navigator.clipboard.writeText(window.location.href);
                              alert("Link copied!");
                            }}
                          >
                            <i className="fas fa-link mr-2" />
                            Copy Link
                          </button>
                        </div>
                      </div>

                      {(isEditor || isReviewer) && (
                        <div className="callout callout-info">
                          <h5 className="mb-1">
                            <i className="fas fa-lock mr-2" />
                            Access control
                          </h5>
                          <div className="small mb-0">Only authorized editors/reviewers can access confidential content.</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* FILES */}
                {activeTab === "files" && (
                  <div className="card card-outline card-primary">
                    <div className="card-header">
                      <h3 className="card-title">
                        <i className="fas fa-folder-open mr-2" />
                        Manuscript Files
                      </h3>
                    </div>

                    <div className="card-body p-0">
                      {files.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-hover mb-0">
                            <thead>
                              <tr>
                                <th>Version</th>
                                <th>Type</th>
                                <th>File</th>
                                <th>Size</th>
                                <th>Uploaded</th>
                                <th className="text-right">Action</th>
                              </tr>
                            </thead>

                            <tbody>
                              {files.map((f) => {
                                const ft = fileTypeLabel(f.file_type);
                                return (
                                  <tr key={f.file_id}>
                                    <td>
                                      <span className="badge badge-secondary">v{f.version_no}</span>
                                    </td>

                                    <td>
                                      <span className={`badge ${ft.cls}`}>
                                        <i className={`fas ${ft.icon} mr-1`} />
                                        {ft.text}
                                      </span>
                                    </td>

                                    <td>
                                      <div className="font-weight-bold">{f.original_name}</div>
                                      <div className="text-muted small">ID: {String(f.file_id).slice(0, 8)}...</div>
                                    </td>

                                    <td>{formatFileSize(f.size_bytes)}</td>

                                    <td>
                                      <div>{formatDate(f.uploaded_at)}</div>
                                      <div className="text-muted small">by {f.uploaded_by_name || "Unknown"}</div>
                                    </td>

                                    <td className="text-right">
                                      <button className="btn btn-sm btn-outline-primary" onClick={() => handleDownload(f)}>
                                        <i className="fas fa-download mr-1" />
                                        Download
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="card-body text-center py-5">
                          <i className="far fa-folder-open fa-3x text-muted mb-3" />
                          <div className="text-muted">No files uploaded yet.</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* HISTORY */}
                {activeTab === "history" && (
                  <div className="card card-outline card-secondary">
                    <div className="card-header">
                      <h3 className="card-title">
                        <i className="fas fa-history mr-2" />
                        Workflow History
                      </h3>
                    </div>

                    <div className="card-body">
                      {history.length > 0 ? (
                        <div className="timeline">
                          {history.map((h, idx) => (
                            <div key={h.history_id}>
                              <i className={`fas ${actionIconFa(h.action)} bg-info`} />
                              <div className="timeline-item">
                                <span className="time">
                                  <i className="fas fa-clock" /> {formatDate(h.created_at)}
                                </span>

                                <h3 className="timeline-header">
                                  <span className="text-primary font-weight-bold">
                                    {String(h.action || "").replace(/_/g, " ")}
                                  </span>
                                  {h.from_status || h.to_status ? (
                                    <span className="ml-2">
                                      <span className="badge badge-light mr-1">{h.from_status || "NEW"}</span>
                                      <i className="fas fa-arrow-right mx-1 text-muted" />
                                      <span className="badge badge-light ml-1">{h.to_status || "—"}</span>
                                    </span>
                                  ) : null}
                                  <span className="badge badge-secondary ml-2">
                                    <i className="fas fa-user mr-1" />
                                    {h.actor_name || "System"}
                                  </span>
                                </h3>

                                <div className="timeline-body">
                                  {h.note ? (
                                    <div className="callout callout-info mb-0">
                                      <div className="small text-muted mb-1">Note</div>
                                      <div>{h.note}</div>
                                    </div>
                                  ) : (
                                    <div className="text-muted">No note.</div>
                                  )}
                                </div>

                                {idx === history.length - 1 ? (
                                  <div className="timeline-footer">
                                    <span className="badge badge-secondary">Latest</span>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          ))}
                          <div>
                            <i className="fas fa-clock bg-gray" />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-5">
                          <i className="fas fa-history fa-3x text-muted mb-3" />
                          <div className="text-muted">No history available.</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* REVIEWS */}
                {activeTab === "reviews" && (
                  <div className="card card-outline card-primary">
                    <div className="card-header">
                      <h3 className="card-title">
                        <i className="fas fa-comments mr-2" />
                        Review Summary
                      </h3>
                    </div>

                    <div className="card-body p-0">
                      {reviewSummary?.assignments?.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table mb-0">
                            <thead>
                              <tr>
                                <th>Reviewer</th>
                                <th>Status</th>
                                <th>Recommendation</th>
                                <th>Assigned</th>
                                <th>Completed</th>
                              </tr>
                            </thead>
                            <tbody>
                              {reviewSummary.assignments.map((a) => (
                                <tr key={a.assignment_id}>
                                  <td>
                                    <div className="font-weight-bold">{a.reviewer_name}</div>
                                    <div className="text-muted small">{a.reviewer_email}</div>
                                  </td>
                                  <td>
                                    <span
                                      className={`badge ${
                                        a.status === "COMPLETED"
                                          ? "badge-success"
                                          : a.status === "ACCEPTED"
                                          ? "badge-info"
                                          : a.status === "DECLINED"
                                          ? "badge-danger"
                                          : "badge-warning"
                                      }`}
                                    >
                                      {a.status}
                                    </span>
                                  </td>
                                  <td>{a.recommendation || "—"}</td>
                                  <td>{formatDate(a.assigned_at)}</td>
                                  <td>{a.completed_at ? formatDate(a.completed_at) : "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="card-body">
                          <div className="text-muted mb-0">No reviews assigned yet.</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* EDITOR PANEL */}
            {isEditor && (
              <div className="card card-outline card-primary">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-user-edit mr-2" />
                    Editor Actions
                  </h3>
                </div>

                <div className="card-body">
                  <div className="form-group">
                    <label className="font-weight-bold">Editor Note</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={editorNote}
                      onChange={(e) => setEditorNote(e.target.value)}
                      placeholder="Optional note..."
                      disabled={actionLoading}
                    />
                  </div>

                  <div className="d-flex flex-wrap" style={{ gap: 10 }}>
                    {ebook.status === "SUBMITTED" && (
                      <>
                        <button className="btn btn-info" onClick={() => handleEditorAction("START_SCREENING")} disabled={actionLoading}>
                          {actionLoading ? <span className="spinner-border spinner-border-sm mr-2" /> : <i className="fas fa-play mr-2" />}
                          Start Screening
                        </button>

                        <button className="btn btn-danger" onClick={() => handleEditorAction("DESK_REJECT")} disabled={actionLoading}>
                          {actionLoading ? <span className="spinner-border spinner-border-sm mr-2" /> : <i className="fas fa-times mr-2" />}
                          Desk Reject
                        </button>
                      </>
                    )}

                    {ebook.status === "SCREENING" && (
                      <>
                        <button className="btn btn-success" onClick={() => setShowScreeningModal(true)} disabled={actionLoading}>
                          <i className="fas fa-clipboard-check mr-2" />
                          Complete Screening
                        </button>

                        <div className="d-flex align-items-center">
                          <select
                            className="form-control mr-2"
                            style={{ width: 180 }}
                            value={revisionType}
                            onChange={(e) => setRevisionType(e.target.value)}
                            disabled={actionLoading}
                          >
                            <option value="MINOR">Minor Revision</option>
                            <option value="MAJOR">Major Revision</option>
                          </select>

                          <button className="btn btn-warning mr-2" onClick={handleRequestRevision} disabled={actionLoading}>
                            {actionLoading ? <span className="spinner-border spinner-border-sm mr-2" /> : <i className="fas fa-edit mr-2" />}
                            Request Revision
                          </button>
                        </div>

                        <button className="btn btn-success" onClick={() => handleEditorAction("SEND_TO_REVIEW")} disabled={actionLoading}>
                          {actionLoading ? <span className="spinner-border spinner-border-sm mr-2" /> : <i className="fas fa-share-square mr-2" />}
                          Send to Review
                        </button>

                        <button className="btn btn-danger" onClick={() => handleEditorAction("DESK_REJECT")} disabled={actionLoading}>
                          {actionLoading ? <span className="spinner-border spinner-border-sm mr-2" /> : <i className="fas fa-times-circle mr-2" />}
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SCREENING MODAL */}
            {showScreeningModal && screeningData && (
              <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">
                        <i className="fas fa-clipboard-check mr-2" />
                        Complete Screening Assessment
                      </h5>
                      <button type="button" className="close" onClick={() => setShowScreeningModal(false)}>
                        <span aria-hidden="true">×</span>
                      </button>
                    </div>

                    <div className="modal-body">
                      <div className="row">
                        <div className="col-md-6">
                          <label className="font-weight-bold">Relevance Score (1-5)</label>
                          <input
                            type="range"
                            className="custom-range"
                            min="1"
                            max="5"
                            value={screeningForm.relevanceScore}
                            onChange={(e) =>
                              setScreeningForm({ ...screeningForm, relevanceScore: parseInt(e.target.value, 10) })
                            }
                          />
                          <div className="text-center">
                            {[1, 2, 3, 4, 5].map((v) => (
                              <span
                                key={v}
                                className={`badge mr-1 ${screeningForm.relevanceScore >= v ? "badge-primary" : "badge-light"}`}
                              >
                                {v}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <label className="font-weight-bold">Quality Score (1-5)</label>
                          <input
                            type="range"
                            className="custom-range"
                            min="1"
                            max="5"
                            value={screeningForm.qualityScore}
                            onChange={(e) =>
                              setScreeningForm({ ...screeningForm, qualityScore: parseInt(e.target.value, 10) })
                            }
                          />
                          <div className="text-center">
                            {[1, 2, 3, 4, 5].map((v) => (
                              <span
                                key={v}
                                className={`badge mr-1 ${screeningForm.qualityScore >= v ? "badge-primary" : "badge-light"}`}
                              >
                                {v}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <hr />

                      <div className="form-group">
                        <div className="custom-control custom-checkbox">
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id="scopeMatch"
                            checked={screeningForm.scopeMatch}
                            onChange={(e) => setScreeningForm({ ...screeningForm, scopeMatch: e.target.checked })}
                          />
                          <label className="custom-control-label" htmlFor="scopeMatch">
                            Manuscript matches journal scope
                          </label>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="font-weight-bold">Screening Comments</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={screeningForm.comments}
                          onChange={(e) => setScreeningForm({ ...screeningForm, comments: e.target.value })}
                          placeholder="Enter screening comments..."
                        />
                      </div>

                      <div className="form-group">
                        <label className="font-weight-bold">Recommended Action</label>
                        <select
                          className="form-control"
                          value={screeningForm.recommendedAction}
                          onChange={(e) => setScreeningForm({ ...screeningForm, recommendedAction: e.target.value })}
                        >
                          <option value="SEND_TO_REVIEW">Send to Review</option>
                          <option value="REQUEST_REVISION">Request Revision</option>
                          <option value="REJECT">Reject</option>
                        </select>
                      </div>

                      {screeningForm.recommendedAction === "SEND_TO_REVIEW" && (
                        <div className="form-group">
                          <label className="font-weight-bold">Select Reviewers</label>
                          <div className="border rounded p-2" style={{ maxHeight: 250, overflowY: "auto" }}>
                            {screeningData.reviewers?.map((r) => (
                              <div key={r.uuid} className="custom-control custom-checkbox mb-2">
                                <input
                                  type="checkbox"
                                  className="custom-control-input"
                                  id={`rev-${r.uuid}`}
                                  checked={screeningForm.reviewerIds.includes(r.uuid)}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    const next = checked
                                      ? [...screeningForm.reviewerIds, r.uuid]
                                      : screeningForm.reviewerIds.filter((x) => x !== r.uuid);
                                    setScreeningForm({ ...screeningForm, reviewerIds: next });
                                  }}
                                />
                                <label className="custom-control-label" htmlFor={`rev-${r.uuid}`}>
                                  <div className="font-weight-bold">{r.full_name}</div>
                                  <div className="text-muted small">{r.email}</div>
                                </label>
                              </div>
                            ))}

                            {!screeningData.reviewers?.length && (
                              <div className="text-muted">No reviewers available.</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={() => setShowScreeningModal(false)}>
                        Cancel
                      </button>

                      <button type="button" className="btn btn-primary" onClick={handleScreeningSubmit} disabled={actionLoading}>
                        {actionLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm mr-2" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-check mr-2" />
                            Submit Screening
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}