// src/pages/ebooks/EditorMakeDecision.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout.jsx";
import {
  getEbookById,
  getReviewSummary,
  editorAccept,
  editorDeskReject,
  editorRequestRevision,
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

export default function EditorMakeDecision() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [ebook, setEbook] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [author, setAuthor] = useState(null);

  // Decision form
  const [decision, setDecision] = useState("");
  const [decisionNote, setDecisionNote] = useState("");
  const [sendToAuthor, setSendToAuthor] = useState(true);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        // Load ebook details
        const ebookRes = await getEbookById(id);
        if (!ebookRes?.success) {
          throw new Error(ebookRes?.message || "Failed to load ebook");
        }
        setEbook(ebookRes.data.ebook);
        setAuthor(ebookRes.data.ebook.author);

        // Load review summary
        const summaryRes = await getReviewSummary(id);
        if (summaryRes?.success) {
          setAssignments(summaryRes.data.assignments || []);
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

  // Calculate recommendation stats
  const stats = {
    total: assignments.filter(a => a.status === "COMPLETED").length,
    accept: assignments.filter(a => a.recommendation === "ACCEPT").length,
    minor: assignments.filter(a => a.recommendation === "MINOR_REVISION").length,
    major: assignments.filter(a => a.recommendation === "MAJOR_REVISION").length,
    reject: assignments.filter(a => a.recommendation === "REJECT").length,
  };

  // Get majority recommendation
  const getMajorityRecommendation = () => {
    if (stats.total === 0) return null;
    
    const max = Math.max(stats.accept, stats.minor, stats.major, stats.reject);
    if (max === stats.accept) return "ACCEPT";
    if (max === stats.minor) return "MINOR_REVISION";
    if (max === stats.major) return "MAJOR_REVISION";
    if (max === stats.reject) return "REJECT";
    return null;
  };

  const majorityRec = getMajorityRecommendation();

  // Validate decision
  const validateDecision = () => {
    if (!decision) {
      alert("Please select a decision");
      return false;
    }
    return true;
  };

  // Handle submit decision
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateDecision()) return;

    setSubmitting(true);
    try {
      let res;

      if (decision === "ACCEPT") {
        res = await editorAccept(id, { note: decisionNote });
      } else if (decision === "REJECT") {
        res = await editorDeskReject(id, { note: decisionNote });
      } else if (decision === "REVISION") {
        res = await editorRequestRevision(id, { note: decisionNote });
      } else {
        throw new Error("Invalid decision");
      }

      if (!res?.success) {
        throw new Error(res?.message || `Failed to ${decision.toLowerCase()} manuscript`);
      }

      // Navigate to review summary
      navigate(`/editor/${id}/review-summary`, {
        state: {
          message: `Manuscript ${decision.toLowerCase()}ed successfully`,
          decision
        }
      });
    } catch (err) {
      alert(err.message || "Failed to submit decision");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate(`/editor/${id}/review-summary`);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-5">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Loading decision form...</p>
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
            {error || "Failed to load manuscript details"}
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
                  onClick={handleCancel}
                >
                  <i className="bi bi-arrow-left me-1"></i>
                  Back to Review Summary
                </button>
                <h3 className="mb-1 fw-bold">
                  <i className="bi bi-check2-circle me-2" style={{ color: "#667eea" }}></i>
                  Make Editorial Decision
                </h3>
                <p className="text-muted mb-0">
                  Based on reviewer recommendations, make a final decision
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Main Form Column */}
          <div className="col-lg-8">
            <form onSubmit={handleSubmit}>
              {/* Manuscript Info Card */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white py-3">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-file-text me-2"></i>
                    Manuscript
                  </h5>
                </div>
                <div className="card-body">
                  <h5>{ebook.title}</h5>
                  <p className="text-muted">
                    <i className="bi bi-person me-2"></i>
                    {author?.full_name || "Unknown"} · {author?.email}
                  </p>
                </div>
              </div>

              {/* Review Summary Card */}
              {assignments.length > 0 && (
                <div className="card shadow-sm mb-4">
                  <div className="card-header bg-white py-3">
                    <h5 className="card-title mb-0">
                      <i className="bi bi-bar-chart me-2"></i>
                      Review Summary
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-3">
                        <div className="text-center p-2 bg-success bg-opacity-10 rounded">
                          <h5 className="text-success mb-0">{stats.accept}</h5>
                          <small className="text-muted">Accept</small>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="text-center p-2 bg-info bg-opacity-10 rounded">
                          <h5 className="text-info mb-0">{stats.minor}</h5>
                          <small className="text-muted">Minor</small>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="text-center p-2 bg-warning bg-opacity-10 rounded">
                          <h5 className="text-warning mb-0">{stats.major}</h5>
                          <small className="text-muted">Major</small>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="text-center p-2 bg-danger bg-opacity-10 rounded">
                          <h5 className="text-danger mb-0">{stats.reject}</h5>
                          <small className="text-muted">Reject</small>
                        </div>
                      </div>
                    </div>

                    {majorityRec && (
                      <div className="mt-3 p-3 bg-light rounded">
                        <small className="text-muted d-block">Majority Recommendation</small>
                        <span className="fw-bold">
                          <RecommendationBadge recommendation={majorityRec} />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Decision Card */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white py-3">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-check-circle me-2" style={{ color: "#667eea" }}></i>
                    Editorial Decision <span className="text-danger">*</span>
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <div
                        className={`card h-100 cursor-pointer ${
                          decision === "ACCEPT" ? "border-success bg-success bg-opacity-10" : ""
                        }`}
                        onClick={() => setDecision("ACCEPT")}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="card-body text-center">
                          <i className="bi bi-check-circle fs-1 text-success mb-2"></i>
                          <h6 className="fw-bold">Accept</h6>
                          <p className="small text-muted mb-0">
                            Accept manuscript for publication
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div
                        className={`card h-100 cursor-pointer ${
                          decision === "REVISION" ? "border-warning bg-warning bg-opacity-10" : ""
                        }`}
                        onClick={() => setDecision("REVISION")}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="card-body text-center">
                          <i className="bi bi-pencil fs-1 text-warning mb-2"></i>
                          <h6 className="fw-bold">Request Revision</h6>
                          <p className="small text-muted mb-0">
                            Author needs to revise manuscript
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div
                        className={`card h-100 cursor-pointer ${
                          decision === "REJECT" ? "border-danger bg-danger bg-opacity-10" : ""
                        }`}
                        onClick={() => setDecision("REJECT")}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="card-body text-center">
                          <i className="bi bi-x-circle fs-1 text-danger mb-2"></i>
                          <h6 className="fw-bold">Reject</h6>
                          <p className="small text-muted mb-0">
                            Reject manuscript
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Decision Note
                    </label>
                    <textarea
                      className="form-control"
                      rows={5}
                      value={decisionNote}
                      onChange={(e) => setDecisionNote(e.target.value)}
                      placeholder={
                        decision === "ACCEPT" ? "Add acceptance notes (optional)" :
                        decision === "REVISION" ? "Provide revision requirements and guidelines..." :
                        decision === "REJECT" ? "Provide rejection reason..." :
                        "Add notes about your decision..."
                      }
                    />
                    <small className="text-muted">
                      {sendToAuthor ? "This note will be sent to the author." : "This note is for internal use only."}
                    </small>
                  </div>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="sendToAuthor"
                      checked={sendToAuthor}
                      onChange={(e) => setSendToAuthor(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="sendToAuthor">
                      Send decision notification to author
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="d-flex gap-3 justify-content-end mb-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-lg"
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={submitting || !decision}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Submit Decision
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            {/* Guidelines Card */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white py-3">
                <h5 className="card-title mb-0">
                  <i className="bi bi-question-circle me-2" style={{ color: "#667eea" }}></i>
                  Decision Guidelines
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <h6 className="fw-semibold text-success">Accept</h6>
                  <p className="small text-muted">
                    Manuscript meets all criteria and can be accepted without further changes.
                  </p>
                </div>

                <div className="mb-3">
                  <h6 className="fw-semibold text-warning">Request Revision</h6>
                  <p className="small text-muted">
                    Manuscript has potential but requires changes. Specify what needs to be revised.
                  </p>
                </div>

                <div className="mb-3">
                  <h6 className="fw-semibold text-danger">Reject</h6>
                  <p className="small text-muted">
                    Manuscript does not meet criteria for publication. Provide clear reasons.
                  </p>
                </div>

                <div className="alert alert-info small mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Your decision will be recorded in the workflow history.
                </div>
              </div>
            </div>

            {/* Reviewer Recommendations */}
            {assignments.filter(a => a.status === "COMPLETED").length > 0 && (
              <div className="card shadow-sm">
                <div className="card-header bg-white py-3">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-people me-2"></i>
                    Reviewer Recommendations
                  </h5>
                </div>
                <div className="card-body p-0">
                  <div className="list-group list-group-flush">
                    {assignments
                      .filter(a => a.status === "COMPLETED")
                      .map(a => (
                        <div key={a.assignment_id} className="list-group-item">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fw-semibold">{a.reviewer_name}</span>
                            <RecommendationBadge recommendation={a.recommendation} />
                          </div>
                          {a.comments && (
                            <small className="text-muted d-block text-truncate">
                              {a.comments.substring(0, 60)}...
                            </small>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .cursor-pointer {
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .cursor-pointer:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .badge {
          font-weight: 500;
          padding: 0.5em 0.8em;
        }
      `}</style>
    </MainLayout>
  );
}