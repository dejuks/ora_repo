// src/pages/ebooks/EditorReviewSummary.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout.jsx";
import {
  getReviewSummary,
  getEbookById,
} from "../../../api/ebooks";

// Recommendation Badge Component
const RecommendationBadge = ({ recommendation }) => {
  const config = {
    ACCEPT: { class: "success", icon: "bi-check-circle", text: "Accept" },
    MINOR_REVISION: { class: "info", icon: "bi-pencil", text: "Minor Revision" },
    MAJOR_REVISION: { class: "warning", icon: "bi-exclamation-triangle", text: "Major Revision" },
    REJECT: { class: "danger", icon: "bi-x-circle", text: "Reject" },
  };
  const cfg = config[recommendation] || { class: "secondary", icon: "bi-question", text: recommendation };
  return (
    <span className={`badge bg-${cfg.class} px-3 py-2`}>
      <i className={`bi ${cfg.icon} me-1`}></i>
      {cfg.text}
    </span>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const config = {
    SUBMITTED: { class: "secondary", icon: "bi-send", text: "Submitted" },
    SCREENING: { class: "info", icon: "bi-search", text: "Screening" },
    UNDER_REVIEW: { class: "warning", icon: "bi-people", text: "Under Review" },
    REVISION_REQUESTED: { class: "warning", icon: "bi-pencil", text: "Revision Required" },
    ACCEPTED: { class: "success", icon: "bi-check-circle", text: "Accepted" },
    REJECTED: { class: "danger", icon: "bi-x-circle", text: "Rejected" },
  };
  const cfg = config[status] || { class: "secondary", icon: "bi-question", text: status };
  return (
    <span className={`badge bg-${cfg.class} px-3 py-2`}>
      <i className={`bi ${cfg.icon} me-1`}></i>
      {cfg.text}
    </span>
  );
};

export default function EditorReviewSummary() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ebook, setEbook] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [author, setAuthor] = useState(null);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        // Load review summary
        const summaryRes = await getReviewSummary(id);
        if (!summaryRes?.success) {
          throw new Error(summaryRes?.message || "Failed to load review summary");
        }
        setEbook(summaryRes.data.ebook);
        setAuthor(summaryRes.data.ebook.author);
        setAssignments(summaryRes.data.assignments || []);

        // Also load full ebook details if needed
        const ebookRes = await getEbookById(id);
        if (ebookRes?.success && !ebook) {
          setEbook(ebookRes.data.ebook);
          setAuthor(ebookRes.data.ebook.author);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id]);

  // Calculate review stats
  const stats = {
    total: assignments.length,
    completed: assignments.filter(a => a.status === "COMPLETED").length,
    pending: assignments.filter(a => a.status === "PENDING").length,
    accepted: assignments.filter(a => a.status === "ACCEPTED").length,
    declined: assignments.filter(a => a.status === "DECLINED").length,
    recommendations: {
      accept: assignments.filter(a => a.recommendation === "ACCEPT").length,
      minor: assignments.filter(a => a.recommendation === "MINOR_REVISION").length,
      major: assignments.filter(a => a.recommendation === "MAJOR_REVISION").length,
      reject: assignments.filter(a => a.recommendation === "REJECT").length,
    }
  };

  // Check if all reviews are completed
  const allReviewsCompleted = stats.completed === stats.total && stats.total > 0;

  // Handle make decision
  const handleMakeDecision = () => {
    navigate(`/editor/${id}/make-decision`);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-5">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Loading review summary...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !ebook) {
    return (
      <MainLayout>
        <div className="container py-5">
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error || "Failed to load review summary"}
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/editor/screening")}>
            <i className="bi bi-arrow-left me-2"></i>
            Back to Screening Queue
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex flex-wrap justify-content-between align-items-center">
              <div>
                <button
                  className="btn btn-link text-decoration-none p-0 mb-2"
                  onClick={() => navigate("/editor/screening")}
                >
                  <i className="bi bi-arrow-left me-1"></i>
                  Back to Screening Queue
                </button>
                <h3 className="mb-1 fw-bold">
                  <i className="bi bi-journal-text me-2" style={{ color: "#667eea" }}></i>
                  Review Summary
                </h3>
                <p className="text-muted mb-0">
                  View all reviewer feedback and make editorial decision
                </p>
              </div>
              <div className="mt-2 mt-sm-0 d-flex gap-2">
                <StatusBadge status={ebook.status} />
                {allReviewsCompleted && ebook.status === "UNDER_REVIEW" && (
                  <button
                    className="btn btn-success"
                    onClick={handleMakeDecision}
                  >
                    <i className="bi bi-check-circle me-2"></i>
                    Make Decision
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Manuscript Info Card */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-white py-3">
                <h5 className="card-title mb-0">
                  <i className="bi bi-file-text me-2"></i>
                  Manuscript Details
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-8">
                    <h5>{ebook.title}</h5>
                    <p className="text-muted mb-2">
                      <i className="bi bi-person me-2"></i>
                      {author?.full_name || "Unknown"} · {author?.email}
                    </p>
                    {ebook.abstract && (
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Abstract</label>
                        <p className="text-muted bg-light p-3 rounded">
                          {ebook.abstract}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="col-md-4">
                    <div className="bg-light p-3 rounded">
                      <div className="mb-2">
                        <small className="text-muted d-block">Submitted</small>
                        <span>{new Date(ebook.submitted_at).toLocaleDateString()}</span>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted d-block">Status</small>
                        <StatusBadge status={ebook.status} />
                      </div>
                      <div>
                        <small className="text-muted d-block">Reviews Completed</small>
                        <span className="fw-bold">{stats.completed}/{stats.total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card bg-primary text-white shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-white-50 mb-1">Total Reviews</h6>
                    <h3 className="mb-0">{stats.total}</h3>
                  </div>
                  <i className="bi bi-people fs-1 opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-success text-white shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-white-50 mb-1">Completed</h6>
                    <h3 className="mb-0">{stats.completed}</h3>
                  </div>
                  <i className="bi bi-check-circle fs-1 opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-warning text-white shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-white-50 mb-1">Accepted Reviews</h6>
                    <h3 className="mb-0">{stats.accepted}</h3>
                  </div>
                  <i className="bi bi-person-check fs-1 opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-info text-white shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-white-50 mb-1">Pending Response</h6>
                    <h3 className="mb-0">{stats.pending}</h3>
                  </div>
                  <i className="bi bi-hourglass-split fs-1 opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Summary */}
        {stats.completed > 0 && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-header bg-white py-3">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-bar-chart me-2"></i>
                    Recommendations Summary
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3">
                      <div className="text-center p-3 bg-success bg-opacity-10 rounded">
                        <h3 className="text-success">{stats.recommendations.accept}</h3>
                        <span className="text-muted">Accept</span>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center p-3 bg-info bg-opacity-10 rounded">
                        <h3 className="text-info">{stats.recommendations.minor}</h3>
                        <span className="text-muted">Minor Revision</span>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center p-3 bg-warning bg-opacity-10 rounded">
                        <h3 className="text-warning">{stats.recommendations.major}</h3>
                        <span className="text-muted">Major Revision</span>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center p-3 bg-danger bg-opacity-10 rounded">
                        <h3 className="text-danger">{stats.recommendations.reject}</h3>
                        <span className="text-muted">Reject</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Review Assignments */}
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-white py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-list-ul me-2"></i>
                    Review Assignments
                  </h5>
                  <span className="badge bg-primary">{assignments.length} total</span>
                </div>
              </div>

              <div className="card-body p-0">
                {assignments.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-inbox fs-1 text-muted d-block mb-3"></i>
                    <h5 className="text-muted">No review assignments yet</h5>
                    <p className="text-muted small">
                      Reviewers haven't been assigned to this manuscript yet.
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Reviewer</th>
                          <th>Status</th>
                          <th>Assigned</th>
                          <th>Response</th>
                          <th>Completed</th>
                          <th>Recommendation</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignments.map((a) => (
                          <tr key={a.assignment_id}>
                            <td>
                              <div className="fw-semibold">{a.reviewer_name}</div>
                              <small className="text-muted">{a.reviewer_email}</small>
                            </td>
                            <td>
                              <span className={`badge bg-${
                                a.status === "COMPLETED" ? "success" :
                                a.status === "ACCEPTED" ? "info" :
                                a.status === "PENDING" ? "warning" :
                                a.status === "DECLINED" ? "danger" : "secondary"
                              } px-3 py-2`}>
                                {a.status}
                              </span>
                            </td>
                            <td>
                              <div>{new Date(a.assigned_at).toLocaleDateString()}</div>
                              <small className="text-muted">{new Date(a.assigned_at).toLocaleTimeString()}</small>
                            </td>
                            <td>
                              {a.accepted_at ? (
                                <div>
                                  <div>{new Date(a.accepted_at).toLocaleDateString()}</div>
                                  <small className="text-muted">{new Date(a.accepted_at).toLocaleTimeString()}</small>
                                </div>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>
                            <td>
                              {a.completed_at ? (
                                <div>
                                  <div>{new Date(a.completed_at).toLocaleDateString()}</div>
                                  <small className="text-muted">{new Date(a.completed_at).toLocaleTimeString()}</small>
                                </div>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>
                            <td>
                              {a.recommendation ? (
                                <RecommendationBadge recommendation={a.recommendation} />
                              ) : (
                                <span className="text-muted">Pending</span>
                              )}
                            </td>
                            <td>
                              {a.status === "COMPLETED" && (
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => {
                                    // Open review details modal
                                    alert("View review details - to be implemented");
                                  }}
                                >
                                  <i className="bi bi-eye me-1"></i>
                                  View
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Completed Reviews Details */}
        {assignments.filter(a => a.status === "COMPLETED").length > 0 && (
          <div className="row mt-4">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-header bg-white py-3">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-chat-text me-2"></i>
                    Review Comments
                  </h5>
                </div>
                <div className="card-body">
                  {assignments
                    .filter(a => a.status === "COMPLETED")
                    .map((a, idx) => (
                      <div key={a.assignment_id} className={`${idx > 0 ? "mt-4 pt-4 border-top" : ""}`}>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h6 className="mb-1">{a.reviewer_name}</h6>
                            <small className="text-muted">Completed: {formatDate(a.completed_at)}</small>
                          </div>
                          <RecommendationBadge recommendation={a.recommendation} />
                        </div>

                        {a.comments && (
                          <div className="mb-3">
                            <label className="form-label fw-semibold">Comments (visible to author)</label>
                            <div className="bg-light p-3 rounded">
                              {a.comments}
                            </div>
                          </div>
                        )}

                        {a.confidential_comments && (
                          <div>
                            <label className="form-label fw-semibold text-danger">
                              <i className="bi bi-lock me-1"></i>
                              Confidential Comments (editor only)
                            </label>
                            <div className="bg-danger bg-opacity-10 p-3 rounded border border-danger">
                              {a.confidential_comments}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="d-flex gap-3 justify-content-end">
              <button
                className="btn btn-outline-secondary btn-lg"
                onClick={() => navigate("/editor/screening")}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back to Queue
              </button>
              
              {allReviewsCompleted && ebook.status === "UNDER_REVIEW" && (
                <button
                  className="btn btn-success btn-lg"
                  onClick={handleMakeDecision}
                >
                  <i className="bi bi-check-circle me-2"></i>
                  Proceed to Decision
                </button>
              )}

              {ebook.status === "REVISION_REQUESTED" && (
                <button
                  className="btn btn-warning btn-lg"
                  onClick={() => navigate(`/editor/${id}/screening-assessment`)}
                >
                  <i className="bi bi-pencil me-2"></i>
                  Review Revision
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .badge {
          font-weight: 500;
          padding: 0.5em 0.8em;
        }
        .table > :not(caption) > * > * {
          padding: 1rem 0.75rem;
        }
      `}</style>
    </MainLayout>
  );
}