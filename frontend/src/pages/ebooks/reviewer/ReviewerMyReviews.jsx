// src/pages/ebooks/ReviewerMyReviews.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout.jsx";
import { getMyReviews } from "../../../api/ebooks";

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

// Mobile Card Component
const ReviewCard = ({ review, onView, onRespond }) => {
  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h6 className="card-title mb-0">{review.title}</h6>
          <StatusBadge status={review.status} />
        </div>
        <div className="mb-2">
          <small className="text-muted d-block">
            <i className="bi bi-person me-1"></i>
            Author: {review.author_name || "Unknown"}
          </small>
          <small className="text-muted d-block">
            <i className="bi bi-calendar me-1"></i>
            Assigned: {new Date(review.assigned_at).toLocaleDateString()}
          </small>
        </div>
        <div className="d-flex gap-2 flex-wrap mt-3">
          <button className="btn btn-sm btn-outline-primary" onClick={() => onView(review)}>
            <i className="bi bi-eye me-1"></i> View Details
          </button>
          {review.status === "PENDING" && (
            <>
              <button className="btn btn-sm btn-success" onClick={() => onRespond(review.assignment_id, "accept")}>
                <i className="bi bi-check-circle me-1"></i> Accept
              </button>
              <button className="btn btn-sm btn-danger" onClick={() => onRespond(review.assignment_id, "decline")}>
                <i className="bi bi-x-circle me-1"></i> Decline
              </button>
            </>
          )}
          {review.status === "ACCEPTED" && (
            <button className="btn btn-sm btn-primary" onClick={() => onView(review)}>
              <i className="bi bi-pencil me-1"></i> Submit Review
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ReviewerMyReviews() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle responsive
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load data
  const loadReviews = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getMyReviews();
      if (!res?.success) {
        setError(res?.message || "Failed to load reviews");
      } else {
        setReviews(res.data || []);
      }
    } catch (error) {
      setError(error.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  // Filter reviews
  const filteredReviews = useMemo(() => {
    let filtered = reviews;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.title?.toLowerCase().includes(term) ||
        r.author_name?.toLowerCase().includes(term)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    return filtered;
  }, [reviews, searchTerm, statusFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: reviews.length,
    pending: reviews.filter(r => r.status === "PENDING").length,
    accepted: reviews.filter(r => r.status === "ACCEPTED").length,
    completed: reviews.filter(r => r.status === "COMPLETED").length,
    declined: reviews.filter(r => r.status === "DECLINED").length,
  }), [reviews]);

  // Handle view
  const handleView = (review) => {
    navigate(`/reviewer/${review.assignment_id}`, { 
      state: { review } 
    });
  };

  // Handle respond
  const handleRespond = async (assignmentId, action) => {
    // This will be implemented in the detail page or via API directly
    navigate(`/reviewer/${assignmentId}/respond`, { 
      state: { action } 
    });
  };

  // Refresh
  const handleRefresh = () => {
    loadReviews();
  };

  return (
    <MainLayout>
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex flex-wrap justify-content-between align-items-center">
              <div>
                <h3 className="mb-1 fw-bold">
                  <i className="bi bi-journal-bookmark-fill me-2" style={{ color: "#667eea" }}></i>
                  My Review Assignments
                </h3>
                <p className="text-muted mb-0">
                  Manage your peer review tasks and submissions
                </p>
              </div>
              
              <div className="d-flex gap-2 mt-2 mt-sm-0">
                <div className="input-group" style={{ width: 300 }}>
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search by title or author..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  className="form-select w-auto"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="DECLINED">Declined</option>
                  <option value="COMPLETED">Completed</option>
                </select>

                <button 
                  className="btn btn-outline-primary" 
                  onClick={handleRefresh} 
                  disabled={loading}
                  title="Refresh"
                >
                  <i className={`bi bi-arrow-repeat ${loading ? 'spinner' : ''}`}></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-md-2 col-6">
            <div className="card bg-primary text-white shadow-sm">
              <div className="card-body">
                <h6 className="text-white-50 mb-1">Total</h6>
                <h3 className="mb-0">{stats.total}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-2 col-6">
            <div className="card bg-warning text-white shadow-sm">
              <div className="card-body">
                <h6 className="text-white-50 mb-1">Pending</h6>
                <h3 className="mb-0">{stats.pending}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-2 col-6">
            <div className="card bg-success text-white shadow-sm">
              <div className="card-body">
                <h6 className="text-white-50 mb-1">Accepted</h6>
                <h3 className="mb-0">{stats.accepted}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-2 col-6">
            <div className="card bg-info text-white shadow-sm">
              <div className="card-body">
                <h6 className="text-white-50 mb-1">Completed</h6>
                <h3 className="mb-0">{stats.completed}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-2 col-6">
            <div className="card bg-secondary text-white shadow-sm">
              <div className="card-body">
                <h6 className="text-white-50 mb-1">Declined</h6>
                <h3 className="mb-0">{stats.declined}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="row mb-3">
            <div className="col-12">
              <div className="alert alert-danger">
                <div className="d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div className="flex-grow-1">
                    <strong>Error:</strong> {error}
                  </div>
                  <button className="btn btn-sm btn-outline-danger ms-3" onClick={handleRefresh}>
                    <i className="bi bi-arrow-repeat me-1"></i>
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-white py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-list-ul me-2"></i>
                    Review Assignments {filteredReviews.length > 0 && `(${filteredReviews.length})`}
                  </h5>
                  <div>
                    <span className="badge bg-light text-dark me-2">
                      <i className="bi bi-clock me-1"></i>
                      Due soon: {stats.pending}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card-body p-0">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary mb-3" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted">Loading your reviews...</p>
                  </div>
                ) : filteredReviews.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-inbox fs-1 text-muted d-block mb-3"></i>
                    <h5 className="text-muted">No review assignments found</h5>
                    <p className="text-muted small">
                      {searchTerm || statusFilter
                        ? "No reviews match your filters."
                        : "You don't have any review assignments yet."}
                    </p>
                    {(searchTerm || statusFilter) && (
                      <div>
                        <button className="btn btn-outline-primary btn-sm" onClick={() => setSearchTerm("")}>
                          Clear search
                        </button>
                        {statusFilter && (
                          <button className="btn btn-outline-primary btn-sm ms-2" onClick={() => setStatusFilter("")}>
                            Clear filter
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ) : isMobile ? (
                  // Mobile View
                  <div className="p-3">
                    {filteredReviews.map((review) => (
                      <ReviewCard
                        key={review.assignment_id}
                        review={review}
                        onView={handleView}
                        onRespond={handleRespond}
                      />
                    ))}
                  </div>
                ) : (
                  // Desktop View
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Manuscript</th>
                          <th>Author</th>
                          <th>Status</th>
                          <th>Assigned</th>
                          <th>Response</th>
                          <th>Completed</th>
                          <th>Recommendation</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReviews.map((r) => (
                          <tr key={r.assignment_id}>
                            <td>
                              <div className="fw-semibold">{r.title}</div>
                              <small className="text-muted">ID: {r.ebook_id?.substring(0, 8)}...</small>
                            </td>
                            <td>
                              <div>{r.author_name || "Unknown"}</div>
                              <small className="text-muted">{r.author_email}</small>
                            </td>
                            <td>
                              <StatusBadge status={r.status} />
                            </td>
                            <td>
                              <div>{new Date(r.assigned_at).toLocaleDateString()}</div>
                              <small className="text-muted">{new Date(r.assigned_at).toLocaleTimeString()}</small>
                            </td>
                            <td>
                              {r.accepted_at ? (
                                <div>
                                  <div>{new Date(r.accepted_at).toLocaleDateString()}</div>
                                  <small className="text-muted">{new Date(r.accepted_at).toLocaleTimeString()}</small>
                                </div>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>
                            <td>
                              {r.completed_at ? (
                                <div>
                                  <div>{new Date(r.completed_at).toLocaleDateString()}</div>
                                  <small className="text-muted">{new Date(r.completed_at).toLocaleTimeString()}</small>
                                </div>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>
                            <td>
                              {r.recommendation ? (
                                <RecommendationBadge recommendation={r.recommendation} />
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleView(r)}
                                  title="View details"
                                >
                                  <i className="bi bi-eye"></i>
                                </button>

                                {r.status === "PENDING" && (
                                  <>
                                    <button
                                      className="btn btn-sm btn-success"
                                      onClick={() => handleRespond(r.assignment_id, "accept")}
                                      title="Accept"
                                    >
                                      <i className="bi bi-check-circle"></i>
                                    </button>
                                    <button
                                      className="btn btn-sm btn-danger"
                                      onClick={() => handleRespond(r.assignment_id, "decline")}
                                      title="Decline"
                                    >
                                      <i className="bi bi-x-circle"></i>
                                    </button>
                                  </>
                                )}

                                {r.status === "ACCEPTED" && (
                                  <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => handleView(r)}
                                    title="Submit review"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                )}

                                {r.status === "COMPLETED" && (
                                  <button
                                    className="btn btn-sm btn-info"
                                    onClick={() => handleView(r)}
                                    title="View review"
                                  >
                                    <i className="bi bi-file-text"></i>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {!loading && filteredReviews.length > 0 && (
                <div className="card-footer bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      Showing {filteredReviews.length} of {reviews.length} assignments
                    </small>
                    <div>
                      <span className="badge bg-warning me-2">{stats.pending} pending</span>
                      <span className="badge bg-success me-2">{stats.accepted} accepted</span>
                      <span className="badge bg-info">{stats.completed} completed</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card bg-light border-0">
              <div className="card-body">
                <div className="d-flex flex-wrap gap-3">
                  <button className="btn btn-outline-warning" onClick={() => setStatusFilter("PENDING")}>
                    <i className="bi bi-hourglass-split me-2"></i>
                    View Pending
                  </button>
                  <button className="btn btn-outline-success" onClick={() => setStatusFilter("ACCEPTED")}>
                    <i className="bi bi-check-circle me-2"></i>
                    View Accepted
                  </button>
                  <button className="btn btn-outline-info" onClick={() => setStatusFilter("COMPLETED")}>
                    <i className="bi bi-check2-all me-2"></i>
                    View Completed
                  </button>
                  <button className="btn btn-outline-secondary" onClick={() => setStatusFilter("")}>
                    <i className="bi bi-files me-2"></i>
                    View All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
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