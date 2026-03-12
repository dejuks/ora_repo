// src/pages/ebooks/ReviewerReviewDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout.jsx";
import {
  getEbookById,
  respondToReview,
} from "../../../api/ebooks";

// Status Badge Component
const StatusBadge = ({ status }) => {
  const config = {
    PENDING: { class: "warning", icon: "bi-hourglass-split", text: "Pending" },
    ACCEPTED: { class: "success", icon: "bi-check-circle", text: "Accepted" },
    DECLINED: { class: "danger", icon: "bi-x-circle", text: "Declined" },
    COMPLETED: { class: "info", icon: "bi-check2-all", text: "Completed" },
  };
  const cfg = config[status] || { class: "secondary", icon: "bi-question", text: status };
  return (
    <span className={`badge bg-${cfg.class} px-3 py-2`}>
      <i className={`bi ${cfg.icon} me-1`}></i>
      {cfg.text}
    </span>
  );
};

export default function ReviewerReviewDetail() {
  const { assignmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [error, setError] = useState("");
  const [ebook, setEbook] = useState(null);
  const [author, setAuthor] = useState(null);
  const [review, setReview] = useState(location.state?.review || null);

  // Load data if not passed via state
  useEffect(() => {
    const loadData = async () => {
      if (review) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // In a real app, you'd have an API to get assignment details
        // For now, we'll just show a message
        setError("Review details not available. Please go back to your reviews list.");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (assignmentId) {
      loadData();
    }
  }, [assignmentId, review]);

  // Handle respond
  const handleRespond = async (action) => {
    setResponding(true);
    try {
      const res = await respondToReview(assignmentId, action);
      if (!res?.success) {
        throw new Error(res?.message || `Failed to ${action} review`);
      }

      // Navigate back to my reviews
      navigate("/reviewer/my-reviews", {
        state: {
          message: `Review ${action}ed successfully`,
          action
        }
      });
    } catch (err) {
      alert(err.message || `Failed to ${action} review`);
    } finally {
      setResponding(false);
    }
  };

  // Handle submit review
  const handleSubmitReview = () => {
    navigate(`/reviewer/${assignmentId}/submit`, {
      state: { review, ebook, author }
    });
  };

  // Handle back
  const handleBack = () => {
    navigate("/reviewer/my-reviews");
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-5">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Loading review details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !review) {
    return (
      <MainLayout>
        <div className="container py-5">
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error || "Failed to load review details"}
          </div>
          <button className="btn btn-primary" onClick={handleBack}>
            <i className="bi bi-arrow-left me-2"></i>
            Back to My Reviews
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
                  onClick={handleBack}
                >
                  <i className="bi bi-arrow-left me-1"></i>
                  Back to My Reviews
                </button>
                <h3 className="mb-1 fw-bold">
                  <i className="bi bi-journal-text me-2" style={{ color: "#667eea" }}></i>
                  Review Assignment
                </h3>
                <p className="text-muted mb-0">
                  {review.title}
                </p>
              </div>
              <div className="mt-2 mt-sm-0">
                <StatusBadge status={review.status} />
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Main Content */}
          <div className="col-lg-8">
            {/* Manuscript Info Card */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white py-3">
                <h5 className="card-title mb-0">
                  <i className="bi bi-file-text me-2"></i>
                  Manuscript Details
                </h5>
              </div>
              <div className="card-body">
                <h5>{review.title}</h5>
                <p className="text-muted mb-3">
                  <i className="bi bi-person me-2"></i>
                  Author: {review.author_name || "Unknown"} · {review.author_email}
                </p>

                <div className="row">
                  <div className="col-md-6">
                    <div className="bg-light p-3 rounded">
                      <div className="mb-2">
                        <small className="text-muted d-block">Assigned</small>
                        <span>{new Date(review.assigned_at).toLocaleString()}</span>
                      </div>
                      {review.accepted_at && (
                        <div className="mb-2">
                          <small className="text-muted d-block">Accepted</small>
                          <span>{new Date(review.accepted_at).toLocaleString()}</span>
                        </div>
                      )}
                      {review.completed_at && (
                        <div>
                          <small className="text-muted d-block">Completed</small>
                          <span>{new Date(review.completed_at).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="bg-light p-3 rounded">
                      <div className="mb-2">
                        <small className="text-muted d-block">Manuscript ID</small>
                        <span className="small">{review.ebook_id}</span>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted d-block">Assignment ID</small>
                        <span className="small">{review.assignment_id}</span>
                      </div>
                      <div>
                        <small className="text-muted d-block">Status</small>
                        <StatusBadge status={review.status} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Guidelines Card */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white py-3">
                <h5 className="card-title mb-0">
                  <i className="bi bi-question-circle me-2" style={{ color: "#667eea" }}></i>
                  Review Guidelines
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <h6>Review Criteria</h6>
                  <ul className="text-muted">
                    <li>Evaluate the originality and significance of the work</li>
                    <li>Assess the methodology and technical quality</li>
                    <li>Check for clarity and organization of presentation</li>
                    <li>Verify the validity of conclusions and supporting evidence</li>
                    <li>Provide constructive feedback for improvement</li>
                  </ul>
                </div>

                <div className="mb-3">
                  <h6>Recommendation Options</h6>
                  <div className="row">
                    <div className="col-md-3">
                      <span className="badge bg-success">Accept</span>
                      <small className="d-block text-muted">Accept without changes</small>
                    </div>
                    <div className="col-md-3">
                      <span className="badge bg-info">Minor Revision</span>
                      <small className="d-block text-muted">Minor corrections needed</small>
                    </div>
                    <div className="col-md-3">
                      <span className="badge bg-warning">Major Revision</span>
                      <small className="d-block text-muted">Substantial changes required</small>
                    </div>
                    <div className="col-md-3">
                      <span className="badge bg-danger">Reject</span>
                      <small className="d-block text-muted">Not suitable for publication</small>
                    </div>
                  </div>
                </div>

                <div className="alert alert-info small">
                  <i className="bi bi-info-circle me-2"></i>
                  Your review comments will be shared with the author and editor.
                  Confidential comments are only visible to the editor.
                </div>
              </div>
            </div>

            {/* Action Card */}
            <div className="card shadow-sm">
              <div className="card-header bg-white py-3">
                <h5 className="card-title mb-0">
                  <i className="bi bi-lightning-charge me-2" style={{ color: "#667eea" }}></i>
                  Actions
                </h5>
              </div>
              <div className="card-body">
                {review.status === "PENDING" && (
                  <div>
                    <p className="mb-3">
                      You have been invited to review this manuscript. Please respond to the invitation:
                    </p>
                    <div className="d-flex gap-3">
                      <button
                        className="btn btn-success btn-lg flex-fill"
                        onClick={() => handleRespond("accept")}
                        disabled={responding}
                      >
                        {responding ? (
                          <span className="spinner-border spinner-border-sm me-2"></span>
                        ) : (
                          <i className="bi bi-check-circle me-2"></i>
                        )}
                        Accept Review
                      </button>
                      <button
                        className="btn btn-danger btn-lg flex-fill"
                        onClick={() => handleRespond("decline")}
                        disabled={responding}
                      >
                        {responding ? (
                          <span className="spinner-border spinner-border-sm me-2"></span>
                        ) : (
                          <i className="bi bi-x-circle me-2"></i>
                        )}
                        Decline Review
                      </button>
                    </div>
                  </div>
                )}

                {review.status === "ACCEPTED" && (
                  <div>
                    <p className="mb-3">
                      You have accepted this review assignment. Please submit your review:
                    </p>
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={handleSubmitReview}
                    >
                      <i className="bi bi-pencil me-2"></i>
                      Submit Review
                    </button>
                  </div>
                )}

                {review.status === "DECLINED" && (
                  <div>
                    <div className="alert alert-warning mb-3">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      You have declined this review assignment.
                    </div>
                    <button
                      className="btn btn-outline-primary"
                      onClick={handleBack}
                    >
                      Back to My Reviews
                    </button>
                  </div>
                )}

                {review.status === "COMPLETED" && (
                  <div>
                    <div className="alert alert-success mb-3">
                      <i className="bi bi-check-circle me-2"></i>
                      You have completed this review.
                    </div>
                    <button
                      className="btn btn-outline-primary"
                      onClick={handleBack}
                    >
                      Back to My Reviews
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            {/* Status Timeline Card */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white py-3">
                <h5 className="card-title mb-0">
                  <i className="bi bi-clock-history me-2"></i>
                  Timeline
                </h5>
              </div>
              <div className="card-body">
                <ul className="list-unstyled">
                  <li className="mb-3">
                    <div className="d-flex">
                      <div className="me-3">
                        <i className="bi bi-envelope text-primary"></i>
                      </div>
                      <div>
                        <div className="fw-semibold">Assigned</div>
                        <small className="text-muted">
                          {new Date(review.assigned_at).toLocaleString()}
                        </small>
                      </div>
                    </div>
                  </li>
                  {review.accepted_at && (
                    <li className="mb-3">
                      <div className="d-flex">
                        <div className="me-3">
                          <i className="bi bi-check-circle text-success"></i>
                        </div>
                        <div>
                          <div className="fw-semibold">Accepted</div>
                          <small className="text-muted">
                            {new Date(review.accepted_at).toLocaleString()}
                          </small>
                        </div>
                      </div>
                    </li>
                  )}
                  {review.completed_at && (
                    <li className="mb-3">
                      <div className="d-flex">
                        <div className="me-3">
                          <i className="bi bi-check2-all text-info"></i>
                        </div>
                        <div>
                          <div className="fw-semibold">Completed</div>
                          <small className="text-muted">
                            {new Date(review.completed_at).toLocaleString()}
                          </small>
                        </div>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Tips Card */}
            <div className="card shadow-sm">
              <div className="card-header bg-white py-3">
                <h5 className="card-title mb-0">
                  <i className="bi bi-lightbulb me-2" style={{ color: "#ffc107" }}></i>
                  Review Tips
                </h5>
              </div>
              <div className="card-body">
                <ul className="small text-muted ps-3 mb-0">
                  <li className="mb-2">Be objective and constructive in your feedback</li>
                  <li className="mb-2">Support your recommendations with specific examples</li>
                  <li className="mb-2">Maintain confidentiality of the manuscript</li>
                  <li className="mb-2">Complete your review within the requested timeframe</li>
                  <li>Contact the editor if you have any questions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .badge {
          font-weight: 500;
          padding: 0.5em 0.8em;
        }
      `}</style>
    </MainLayout>
  );
}