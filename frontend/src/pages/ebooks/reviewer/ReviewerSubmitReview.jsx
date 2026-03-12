// src/pages/ebooks/ReviewerSubmitReview.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout.jsx";
import { submitReview } from "../../../api/ebooks";

export default function ReviewerSubmitReview() {
  const { assignmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [review, setReview] = useState(location.state?.review || null);
  const [ebook, setEbook] = useState(location.state?.ebook || null);
  const [author, setAuthor] = useState(location.state?.author || null);

  // Form state
  const [recommendation, setRecommendation] = useState("");
  const [comments, setComments] = useState("");
  const [confidentialComments, setConfidentialComments] = useState("");

  // Validate form
  const validateForm = () => {
    if (!recommendation) {
      alert("Please select a recommendation");
      return false;
    }
    if (!comments.trim()) {
      alert("Please provide review comments");
      return false;
    }
    return true;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        recommendation,
        comments: comments.trim(),
        confidential_comments: confidentialComments.trim() || null,
      };

      const res = await submitReview(assignmentId, payload);
      if (!res?.success) {
        throw new Error(res?.message || "Failed to submit review");
      }

      // Navigate back to my reviews
      navigate("/reviewer/my-reviews", {
        state: {
          message: "Review submitted successfully",
          assignmentId
        }
      });
    } catch (err) {
      alert(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate(`/reviewer/${assignmentId}`);
  };

  if (!review && !ebook) {
    return (
      <MainLayout>
        <div className="container py-5">
          <div className="alert alert-warning">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Review information not available. Please go back to your reviews.
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/reviewer/my-reviews")}>
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
                  onClick={handleCancel}
                >
                  <i className="bi bi-arrow-left me-1"></i>
                  Back to Review
                </button>
                <h3 className="mb-1 fw-bold">
                  <i className="bi bi-pencil-square me-2" style={{ color: "#667eea" }}></i>
                  Submit Your Review
                </h3>
                <p className="text-muted mb-0">
                  {review?.title || ebook?.title || "Manuscript Review"}
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
                  <h5>{review?.title || ebook?.title || "Manuscript Title"}</h5>
                  <p className="text-muted">
                    <i className="bi bi-person me-2"></i>
                    Author: {author?.full_name || review?.author_name || "Unknown"}
                  </p>
                  {ebook?.abstract && (
                    <div className="mt-3">
                      <label className="form-label fw-semibold">Abstract</label>
                      <div className="bg-light p-3 rounded">
                        {ebook.abstract}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendation Card */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white py-3">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-star me-2" style={{ color: "#ffc107" }}></i>
                    Recommendation <span className="text-danger">*</span>
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-3">
                      <div
                        className={`card h-100 cursor-pointer ${
                          recommendation === "ACCEPT" ? "border-success bg-success bg-opacity-10" : ""
                        }`}
                        onClick={() => setRecommendation("ACCEPT")}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="card-body text-center p-3">
                          <i className="bi bi-check-circle fs-2 text-success mb-2"></i>
                          <h6 className="fw-bold mb-0">Accept</h6>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div
                        className={`card h-100 cursor-pointer ${
                          recommendation === "MINOR_REVISION" ? "border-info bg-info bg-opacity-10" : ""
                        }`}
                        onClick={() => setRecommendation("MINOR_REVISION")}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="card-body text-center p-3">
                          <i className="bi bi-pencil fs-2 text-info mb-2"></i>
                          <h6 className="fw-bold mb-0">Minor</h6>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div
                        className={`card h-100 cursor-pointer ${
                          recommendation === "MAJOR_REVISION" ? "border-warning bg-warning bg-opacity-10" : ""
                        }`}
                        onClick={() => setRecommendation("MAJOR_REVISION")}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="card-body text-center p-3">
                          <i className="bi bi-exclamation-triangle fs-2 text-warning mb-2"></i>
                          <h6 className="fw-bold mb-0">Major</h6>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div
                        className={`card h-100 cursor-pointer ${
                          recommendation === "REJECT" ? "border-danger bg-danger bg-opacity-10" : ""
                        }`}
                        onClick={() => setRecommendation("REJECT")}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="card-body text-center p-3">
                          <i className="bi bi-x-circle fs-2 text-danger mb-2"></i>
                          <h6 className="fw-bold mb-0">Reject</h6>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments Card */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white py-3">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-chat-text me-2"></i>
                    Review Comments
                  </h5>
                </div>
                <div className="card-body">
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      Comments for Author and Editor <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      rows={8}
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Provide your detailed review comments here. Include strengths, weaknesses, and specific suggestions for improvement..."
                      required
                    />
                    <small className="text-muted">
                      These comments will be visible to both the author and editor.
                    </small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-danger">
                      <i className="bi bi-lock me-1"></i>
                      Confidential Comments (Editor Only)
                    </label>
                    <textarea
                      className="form-control"
                      rows={5}
                      value={confidentialComments}
                      onChange={(e) => setConfidentialComments(e.target.value)}
                      placeholder="Optional: Private comments for the editor only..."
                    />
                    <small className="text-muted">
                      These comments will only be visible to the editor.
                    </small>
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
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Submit Review
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
                  Review Guidelines
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <h6 className="fw-semibold">When writing your review:</h6>
                  <ul className="small text-muted ps-3">
                    <li className="mb-2">Be specific and constructive</li>
                    <li className="mb-2">Focus on the work, not the author</li>
                    <li className="mb-2">Provide evidence for your claims</li>
                    <li className="mb-2">Suggest improvements where applicable</li>
                    <li>Maintain a professional tone</li>
                  </ul>
                </div>

                <div className="mb-3">
                  <h6 className="fw-semibold">What to evaluate:</h6>
                  <ul className="small text-muted ps-3">
                    <li className="mb-2">Originality and significance</li>
                    <li className="mb-2">Methodology and technical quality</li>
                    <li className="mb-2">Clarity and organization</li>
                    <li className="mb-2">Validity of conclusions</li>
                    <li>References and citations</li>
                  </ul>
                </div>

                <div className="alert alert-warning small mb-0">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Once submitted, your review cannot be edited.
                </div>
              </div>
            </div>

            {/* Quick Reference Card */}
            <div className="card shadow-sm">
              <div className="card-header bg-white py-3">
                <h5 className="card-title mb-0">
                  <i className="bi bi-check2-circle me-2"></i>
                  Recommendation Guide
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-2">
                  <span className="badge bg-success me-2">Accept</span>
                  <small className="text-muted">Accept without changes</small>
                </div>
                <div className="mb-2">
                  <span className="badge bg-info me-2">Minor</span>
                  <small className="text-muted">Minor corrections needed</small>
                </div>
                <div className="mb-2">
                  <span className="badge bg-warning me-2">Major</span>
                  <small className="text-muted">Substantial changes required</small>
                </div>
                <div className="mb-2">
                  <span className="badge bg-danger me-2">Reject</span>
                  <small className="text-muted">Not suitable for publication</small>
                </div>
              </div>
            </div>
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