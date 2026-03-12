// src/pages/ebooks/EditorScreeningAssessment.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout.jsx";
import {
  getEbookById,
  getScreeningFormData,
  submitScreeningAssessment,
} from "../../../api/ebooks";

// Rating Stars Component
const RatingStars = ({ value, onChange, disabled = false, label }) => {
  const [hover, setHover] = useState(null);

  return (
    <div className="mb-3">
      {label && <label className="form-label fw-semibold">{label}</label>}
      <div className="d-flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="btn btn-link p-0 text-decoration-none"
            onClick={() => !disabled && onChange(star)}
            onMouseEnter={() => !disabled && setHover(star)}
            onMouseLeave={() => !disabled && setHover(null)}
            disabled={disabled}
            style={{ fontSize: "1.5rem", color: "#ffc107" }}
          >
            <i
              className={`bi ${
                (hover || value) >= star
                  ? "bi-star-fill"
                  : "bi-star"
              }`}
            ></i>
          </button>
        ))}
        {value > 0 && (
          <span className="ms-2 text-muted">{value}/5</span>
        )}
      </div>
    </div>
  );
};

export default function EditorScreeningAssessment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [ebook, setEbook] = useState(null);
  const [reviewers, setReviewers] = useState([]);
  const [author, setAuthor] = useState(null);

  // Form state
  const [relevanceScore, setRelevanceScore] = useState(0);
  const [scopeMatch, setScopeMatch] = useState(null);
  const [qualityScore, setQualityScore] = useState(0);
  const [comments, setComments] = useState("");
  const [recommendedAction, setRecommendedAction] = useState("");
  const [selectedReviewerIds, setSelectedReviewerIds] = useState([]);
  const [reviewerSearch, setReviewerSearch] = useState("");

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

        // Load screening form data (reviewers)
        const formRes = await getScreeningFormData(id);
        if (!formRes?.success) {
          throw new Error(formRes?.message || "Failed to load form data");
        }
        setReviewers(formRes.data?.reviewers || []);
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

  // Filter reviewers
  const filteredReviewers = useMemo(() => {
    if (!reviewerSearch) return reviewers;
    const term = reviewerSearch.toLowerCase();
    return reviewers.filter(r => 
      (r.full_name || r.name || "").toLowerCase().includes(term) ||
      (r.email || "").toLowerCase().includes(term)
    );
  }, [reviewers, reviewerSearch]);

  // Toggle reviewer selection
  const toggleReviewer = (reviewerId) => {
    setSelectedReviewerIds(prev =>
      prev.includes(reviewerId)
        ? prev.filter(id => id !== reviewerId)
        : [...prev, reviewerId]
    );
  };

  // Select all filtered reviewers
  const selectAllReviewers = () => {
    setSelectedReviewerIds(filteredReviewers.map(r => r.uuid));
  };

  // Clear all reviewers
  const clearReviewers = () => {
    setSelectedReviewerIds([]);
  };

  // Validate form
  const validateForm = () => {
    if (!recommendedAction) {
      alert("Please select a recommended action");
      return false;
    }

    if (recommendedAction === "SEND_TO_REVIEW" && selectedReviewerIds.length === 0) {
      alert("Please select at least one reviewer when sending to review");
      return false;
    }

    if (!comments.trim()) {
      alert("Please provide screening comments");
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        relevanceScore: relevanceScore || null,
        scopeMatch: scopeMatch,
        qualityScore: qualityScore || null,
        comments: comments.trim(),
        recommendedAction,
        reviewerIds: selectedReviewerIds,
      };

      const res = await submitScreeningAssessment(id, payload);
      if (!res?.success) {
        throw new Error(res?.message || "Failed to submit assessment");
      }

      // Navigate back to screening queue
      navigate("/editor/screening", { 
        state: { 
          message: "Screening assessment submitted successfully",
          action: recommendedAction
        }
      });
    } catch (err) {
      alert(err.message || "Failed to submit assessment");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate("/editor/screening");
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const config = {
      SUBMITTED: { class: "secondary", icon: "bi-send", text: "Submitted" },
      SCREENING: { class: "info", icon: "bi-search", text: "Screening" },
    };
    const cfg = config[status] || { class: "secondary", icon: "bi-question", text: status };
    return (
      <span className={`badge bg-${cfg.class} px-3 py-2`}>
        <i className={`bi ${cfg.icon} me-1`}></i>
        {cfg.text}
      </span>
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-5">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Loading screening assessment...</p>
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
            {error || "Failed to load ebook details"}
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
                  <i className="bi bi-clipboard-check me-2" style={{ color: "#667eea" }}></i>
                  Screening Assessment
                </h3>
                <p className="text-muted mb-0">
                  Evaluate the manuscript and recommend next steps
                </p>
              </div>
              <div className="mt-2 mt-sm-0">
                {getStatusBadge(ebook.status)}
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
                    Manuscript Information
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
                      {ebook.keywords && (
                        <div className="mb-3">
                          <label className="form-label fw-semibold">Keywords</label>
                          <div>
                            {Array.isArray(ebook.keywords) ? (
                              ebook.keywords.map((kw, idx) => (
                                <span key={idx} className="badge bg-secondary me-2 px-3 py-2">
                                  {kw}
                                </span>
                              ))
                            ) : (
                              <span className="badge bg-secondary px-3 py-2">
                                {ebook.keywords}
                              </span>
                            )}
                          </div>
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
                          <small className="text-muted d-block">Last Updated</small>
                          <span>{new Date(ebook.updated_at).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <small className="text-muted d-block">ID</small>
                          <span className="small text-truncate">{ebook.ebook_id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Screening Criteria Card */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white py-3">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-star me-2" style={{ color: "#ffc107" }}></i>
                    Screening Criteria
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <RatingStars
                        label="Relevance Score"
                        value={relevanceScore}
                        onChange={setRelevanceScore}
                      />
                      <small className="text-muted d-block mb-3">
                        How relevant is this manuscript to the journal scope?
                      </small>
                    </div>
                    <div className="col-md-6">
                      <RatingStars
                        label="Quality Score"
                        value={qualityScore}
                        onChange={setQualityScore}
                      />
                      <small className="text-muted d-block mb-3">
                        Assessment of overall quality and presentation
                      </small>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Scope Match</label>
                    <div className="d-flex gap-4">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="scopeMatch"
                          id="scopeYes"
                          checked={scopeMatch === true}
                          onChange={() => setScopeMatch(true)}
                        />
                        <label className="form-check-label" htmlFor="scopeYes">
                          <i className="bi bi-check-circle-fill text-success me-1"></i>
                          Within Scope
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="scopeMatch"
                          id="scopeNo"
                          checked={scopeMatch === false}
                          onChange={() => setScopeMatch(false)}
                        />
                        <label className="form-check-label" htmlFor="scopeNo">
                          <i className="bi bi-x-circle-fill text-danger me-1"></i>
                          Out of Scope
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Screening Comments <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      rows={5}
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Provide your assessment, strengths, weaknesses, and any concerns..."
                      required
                    />
                    <small className="text-muted">
                      These comments will be visible to authors if revision is requested.
                    </small>
                  </div>
                </div>
              </div>

              {/* Recommended Action Card */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white py-3">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-arrow-right-circle me-2" style={{ color: "#667eea" }}></i>
                    Recommended Action <span className="text-danger">*</span>
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div
                        className={`card h-100 cursor-pointer ${
                          recommendedAction === "SEND_TO_REVIEW" ? "border-success bg-success bg-opacity-10" : ""
                        }`}
                        onClick={() => setRecommendedAction("SEND_TO_REVIEW")}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="card-body text-center">
                          <i className="bi bi-people fs-1 text-success mb-2"></i>
                          <h6 className="fw-bold">Send to Review</h6>
                          <p className="small text-muted mb-0">
                            Assign reviewers for peer review
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div
                        className={`card h-100 cursor-pointer ${
                          recommendedAction === "REQUEST_REVISION" ? "border-warning bg-warning bg-opacity-10" : ""
                        }`}
                        onClick={() => setRecommendedAction("REQUEST_REVISION")}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="card-body text-center">
                          <i className="bi bi-pencil fs-1 text-warning mb-2"></i>
                          <h6 className="fw-bold">Request Revision</h6>
                          <p className="small text-muted mb-0">
                            Author needs to revise before review
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div
                        className={`card h-100 cursor-pointer ${
                          recommendedAction === "REJECT" ? "border-danger bg-danger bg-opacity-10" : ""
                        }`}
                        onClick={() => setRecommendedAction("REJECT")}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="card-body text-center">
                          <i className="bi bi-x-circle fs-1 text-danger mb-2"></i>
                          <h6 className="fw-bold">Desk Reject</h6>
                          <p className="small text-muted mb-0">
                            Reject without peer review
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviewers Selection - Only show if Send to Review */}
              {recommendedAction === "SEND_TO_REVIEW" && (
                <div className="card shadow-sm mb-4">
                  <div className="card-header bg-white py-3">
                    <h5 className="card-title mb-0">
                      <i className="bi bi-person-check me-2 text-success"></i>
                      Select Reviewers <span className="text-danger">*</span>
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <div className="input-group">
                        <span className="input-group-text bg-white">
                          <i className="bi bi-search"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search reviewers by name or email..."
                          value={reviewerSearch}
                          onChange={(e) => setReviewerSearch(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="d-flex gap-2 mb-3">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={selectAllReviewers}
                      >
                        <i className="bi bi-check-all me-1"></i>
                        Select All ({filteredReviewers.length})
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={clearReviewers}
                        disabled={selectedReviewerIds.length === 0}
                      >
                        <i className="bi bi-x me-1"></i>
                        Clear
                      </button>
                      <span className="ms-auto badge bg-primary align-self-center">
                        {selectedReviewerIds.length} selected
                      </span>
                    </div>

                    {reviewers.length === 0 ? (
                      <div className="alert alert-warning">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        No reviewers found. Please ensure reviewer accounts exist in the system.
                      </div>
                    ) : filteredReviewers.length === 0 ? (
                      <div className="alert alert-info">
                        <i className="bi bi-info-circle me-2"></i>
                        No reviewers match your search criteria.
                      </div>
                    ) : (
                      <div className="list-group" style={{ maxHeight: "300px", overflowY: "auto" }}>
                        {filteredReviewers.map((reviewer) => (
                          <label
                            key={reviewer.uuid}
                            className="list-group-item list-group-item-action d-flex align-items-center gap-3"
                          >
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={selectedReviewerIds.includes(reviewer.uuid)}
                              onChange={() => toggleReviewer(reviewer.uuid)}
                            />
                            <div className="flex-grow-1">
                              <div className="fw-semibold">
                                {reviewer.full_name || reviewer.name || "Reviewer"}
                              </div>
                              <small className="text-muted d-block">{reviewer.email}</small>
                              {reviewer.expertise && (
                                <small className="text-muted">
                                  <i className="bi bi-tag me-1"></i>
                                  {reviewer.expertise}
                                </small>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    )}

                    <div className="alert alert-info mt-3 small">
                      <i className="bi bi-info-circle me-2"></i>
                      Selected reviewers will receive email invitations to review this manuscript.
                    </div>
                  </div>
                </div>
              )}

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
                      Submit Assessment
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
                  Screening Guidelines
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <h6 className="fw-semibold">Relevance Score (1-5)</h6>
                  <ul className="small text-muted ps-3">
                    <li>5 - Highly relevant, perfect fit</li>
                    <li>4 - Relevant, minor adjustments needed</li>
                    <li>3 - Moderately relevant</li>
                    <li>2 - Marginally relevant</li>
                    <li>1 - Not relevant</li>
                  </ul>
                </div>

                <div className="mb-3">
                  <h6 className="fw-semibold">Quality Score (1-5)</h6>
                  <ul className="small text-muted ps-3">
                    <li>5 - Exceptional quality, ready for review</li>
                    <li>4 - Good quality, minor improvements</li>
                    <li>3 - Adequate quality</li>
                    <li>2 - Poor quality, needs revision</li>
                    <li>1 - Unacceptable quality</li>
                  </ul>
                </div>

                <div className="mb-3">
                  <h6 className="fw-semibold">Scope Match</h6>
                  <p className="small text-muted">
                    Does this manuscript fall within the journal's scope and aims?
                  </p>
                </div>

                <div className="alert alert-warning small mb-0">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Your assessment will be recorded and may be shared with authors if revision is requested.
                </div>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="card shadow-sm">
              <div className="card-header bg-white py-3">
                <h5 className="card-title mb-0">
                  <i className="bi bi-bar-chart me-2"></i>
                  Quick Stats
                </h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Manuscripts in screening:</span>
                  <span className="fw-bold">-</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Average screening time:</span>
                  <span className="fw-bold">-</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Your pending screenings:</span>
                  <span className="fw-bold">-</span>
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