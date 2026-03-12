// src/pages/ebooks/AssignedEbooks.jsx
import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import MainLayout from "../../../components/layout/MainLayout.jsx";
import { 
  fetchAllEbooks, 
  getStatusColor, 
  formatStatus,
  ebookDetail,
  getReviewSummary 
} from "../../../api/ebooks.js";
import { useNavigate } from "react-router-dom";

// Detail Modal Component
const DetailModal = ({ open, ebookId, onClose }) => {
  const [manuscript, setManuscript] = useState(null);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (open && ebookId) {
      loadDetailData();
    }
  }, [open, ebookId]);

  const loadDetailData = async () => {
    setLoading(true);
    setError("");
    try {
      // Load manuscript details
      const detailRes = await ebookDetail(ebookId);
      if (!detailRes.success) {
        setError(detailRes.message || "Failed to load manuscript details");
        return;
      }
      setManuscript(detailRes.data);

      // Load review summary
      const reviewRes = await getReviewSummary(ebookId);
      if (reviewRes.success) {
        setReviewSummary(reviewRes.data);
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReviewStatusBadge = (status) => {
    const badges = {
      'PENDING': 'bg-warning',
      'ACCEPTED': 'bg-info',
      'DECLINED': 'bg-danger',
      'COMPLETED': 'bg-success'
    };
    return badges[status] || 'bg-secondary';
  };

  if (!open) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(4px)",
          zIndex: 2000,
          animation: "fadeIn 0.2s ease",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 2010,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          animation: "slideUp 0.3s ease",
        }}
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: 900,
            maxHeight: "85vh",
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Modal Header */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid rgba(0,0,0,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "linear-gradient(to right, #f8f9fa, #ffffff)",
            }}
          >
            <h5 className="modal-title mb-0 fw-bold">
              <i className="bi bi-file-text me-2" style={{ color: "#667eea" }}></i>
              Manuscript Details
            </h5>
            <button 
              type="button" 
              className="btn btn-sm btn-outline-secondary rounded-circle" 
              onClick={onClose}
              style={{ width: 32, height: 32, padding: 0 }}
            >
              <i className="bi bi-x"></i>
            </button>
          </div>

          {/* Modal Body */}
          <div style={{ padding: 20, overflowY: "auto", flex: 1 }}>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted">Loading manuscript details...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            ) : manuscript ? (
              <>
                {/* Title and Status */}
                <div className="mb-4">
                  <h4 className="mb-2">{manuscript.ebook?.title}</h4>
                  <div className="d-flex flex-wrap gap-2">
                    <span className={`badge bg-${getStatusColor(manuscript.ebook?.status)} px-3 py-2`}>
                      {formatStatus(manuscript.ebook?.status)}
                    </span>
                    <span className="badge bg-secondary px-3 py-2">
                      <i className="bi bi-person me-1"></i>
                      {manuscript.ebook?.author_name || 'Unknown'}
                    </span>
                    <span className="badge bg-info px-3 py-2">
                      <i className="bi bi-calendar me-1"></i>
                      Submitted: {formatDate(manuscript.ebook?.submitted_at)}
                    </span>
                  </div>
                </div>

                {/* Tabs */}
                <ul className="nav nav-tabs mb-4">
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'details' ? 'active' : ''}`}
                      onClick={() => setActiveTab('details')}
                    >
                      <i className="bi bi-info-circle me-2"></i>
                      Details
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'files' ? 'active' : ''}`}
                      onClick={() => setActiveTab('files')}
                    >
                      <i className="bi bi-files me-2"></i>
                      Files ({manuscript.files?.length || 0})
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`}
                      onClick={() => setActiveTab('reviews')}
                    >
                      <i className="bi bi-chat-dots me-2"></i>
                      Reviews
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
                      onClick={() => setActiveTab('history')}
                    >
                      <i className="bi bi-clock-history me-2"></i>
                      History
                    </button>
                  </li>
                </ul>

                {/* Tab Content */}
                <div className="tab-content">
                  {/* Details Tab */}
                  {activeTab === 'details' && (
                    <div>
                      <div className="row mb-4">
                        <div className="col-md-6">
                          <div className="bg-light p-3 rounded">
                            <h6 className="fw-semibold mb-2">Author Information</h6>
                            <p className="mb-1"><strong>Name:</strong> {manuscript.ebook?.author_name || 'Unknown'}</p>
                            <p className="mb-1"><strong>Email:</strong> {manuscript.ebook?.author_email}</p>
                            <p className="mb-0"><strong>ID:</strong> {manuscript.ebook?.author_id}</p>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="bg-light p-3 rounded">
                            <h6 className="fw-semibold mb-2">Submission Details</h6>
                            <p className="mb-1"><strong>Submitted:</strong> {formatDate(manuscript.ebook?.submitted_at)}</p>
                            <p className="mb-1"><strong>Updated:</strong> {formatDate(manuscript.ebook?.updated_at)}</p>
                            <p className="mb-0"><strong>Version:</strong> {manuscript.versions?.length || 1}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h6 className="fw-semibold mb-2">Abstract</h6>
                        <div className="bg-light p-3 rounded">
                          <p className="mb-0">{manuscript.ebook?.abstract || "No abstract provided"}</p>
                        </div>
                      </div>

                      <div>
                        <h6 className="fw-semibold mb-2">Keywords</h6>
                        <div className="bg-light p-3 rounded">
                          {Array.isArray(manuscript.ebook?.keywords) && manuscript.ebook.keywords.length > 0 ? (
                            <div className="d-flex flex-wrap gap-2">
                              {manuscript.ebook.keywords.map((kw, i) => (
                                <span key={i} className="badge bg-primary p-2">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted mb-0">No keywords provided</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Files Tab */}
                  {activeTab === 'files' && (
                    <div>
                      {manuscript.files && manuscript.files.length > 0 ? (
                        <div className="list-group">
                          {manuscript.files.map((file) => (
                            <div key={file.file_id} className="list-group-item d-flex align-items-center">
                              <i className={`bi ${
                                file.file_type === 'ORIGINAL' ? 'bi-file-earmark-pdf' :
                                file.file_type === 'REVISED' ? 'bi-file-earmark-diff' :
                                file.file_type === 'FINAL_PDF' ? 'bi-file-earmark-check' : 'bi-file-earmark'
                              } fs-4 me-3 text-primary`}></i>
                              <div className="flex-grow-1">
                                <div className="fw-semibold">{file.original_name}</div>
                                <small className="text-muted d-block">
                                  <span className="badge bg-light text-dark me-2">{file.file_type}</span>
                                  Version {file.version_no} · Uploaded {formatDate(file.uploaded_at)}
                                </small>
                              </div>
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => window.open(`/api/files/${file.stored_name}`, '_blank')}
                              >
                                <i className="bi bi-download me-1"></i>
                                Download
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-5 text-muted">
                          <i className="bi bi-file-earmark-x fs-1 d-block mb-3"></i>
                          <p className="mb-0">No files uploaded</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reviews Tab */}
                  {activeTab === 'reviews' && (
                    <div>
                      {reviewSummary?.assignments && reviewSummary.assignments.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead className="table-light">
                              <tr>
                                <th>Reviewer</th>
                                <th>Status</th>
                                <th>Recommendation</th>
                                <th>Assigned</th>
                                <th>Completed</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {reviewSummary.assignments.map((a) => (
                                <tr key={a.assignment_id}>
                                  <td>
                                    <div className="fw-semibold">{a.reviewer_name}</div>
                                    <small className="text-muted">{a.reviewer_email}</small>
                                  </td>
                                  <td>
                                    <span className={`badge ${getReviewStatusBadge(a.status)}`}>
                                      {a.status}
                                    </span>
                                  </td>
                                  <td>
                                    {a.recommendation ? (
                                      <span className={`badge bg-${
                                        a.recommendation === 'ACCEPT' ? 'success' :
                                        a.recommendation === 'MINOR_REVISION' ? 'info' :
                                        a.recommendation === 'MAJOR_REVISION' ? 'warning' : 'danger'
                                      }`}>
                                        {a.recommendation.replace(/_/g, ' ')}
                                      </span>
                                    ) : '-'}
                                  </td>
                                  <td>{formatDate(a.assigned_at)}</td>
                                  <td>{a.completed_at ? formatDate(a.completed_at) : '-'}</td>
                                  <td>
                                    <button 
                                      className="btn btn-sm btn-outline-primary"
                                      onClick={() => alert('View review details')}
                                    >
                                      <i className="bi bi-eye"></i>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-5 text-muted">
                          <i className="bi bi-chat-dots fs-1 d-block mb-3"></i>
                          <p className="mb-0">No reviews assigned yet</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* History Tab */}
                  {activeTab === 'history' && (
                    <div>
                      {manuscript.history && manuscript.history.length > 0 ? (
                        <div className="timeline">
                          {manuscript.history.map((item, index) => (
                            <div key={item.history_id} className="timeline-item">
                              <div className="timeline-badge">
                                <i className={`bi ${
                                  item.action === 'SUBMIT' ? 'bi-send' :
                                  item.action === 'START_SCREENING' ? 'bi-play-circle' :
                                  item.action === 'REQUEST_REVISION' ? 'bi-pencil-square' :
                                  item.action === 'SEND_TO_REVIEW' ? 'bi-send-check' :
                                  item.action === 'DESK_REJECT' ? 'bi-x-circle' : 'bi-clock-history'
                                }`}></i>
                              </div>
                              <div className="timeline-content">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <span className="fw-semibold text-primary">
                                    {item.action.replace(/_/g, ' ')}
                                  </span>
                                  <span className="badge bg-secondary">{item.actor_name}</span>
                                </div>
                                {item.note && (
                                  <div className="alert alert-light py-2 mb-2 small">
                                    <i className="bi bi-quote me-1"></i>
                                    {item.note}
                                  </div>
                                )}
                                <small className="text-muted">
                                  <i className="bi bi-clock me-1"></i>
                                  {formatDate(item.created_at)}
                                </small>
                              </div>
                              {index < manuscript.history.length - 1 && (
                                <div className="timeline-connector"></div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-5 text-muted">
                          <i className="bi bi-clock-history fs-1 d-block mb-3"></i>
                          <p className="mb-0">No history available</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>

          {/* Modal Footer */}
          <div
            style={{
              padding: "16px 20px",
              borderTop: "1px solid rgba(0,0,0,0.08)",
              display: "flex",
              justifyContent: "flex-end",
              background: "#f8f9fa",
            }}
          >
            <button type="button" className="btn btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .timeline {
          position: relative;
        }
        .timeline-item {
          position: relative;
          padding-left: 3rem;
          margin-bottom: 1.5rem;
        }
        .timeline-badge {
          position: absolute;
          left: 0;
          top: 0;
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          z-index: 1;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .timeline-content {
          background-color: #f8f9fa;
          padding: 1rem;
          border-radius: 0.5rem;
          border: 1px solid #dee2e6;
        }
        .timeline-connector {
          position: absolute;
          left: 1rem;
          top: 2rem;
          bottom: -1.5rem;
          width: 2px;
          background: linear-gradient(to bottom, #667eea, #764ba2);
          opacity: 0.3;
        }
        .nav-tabs .nav-link {
          border: none;
          color: #6c757d;
          padding: 0.75rem 1.5rem;
          transition: all 0.3s ease;
        }
        .nav-tabs .nav-link:hover {
          border: none;
          color: #007bff;
        }
        .nav-tabs .nav-link.active {
          border: none;
          color: #007bff;
          font-weight: 600;
          border-bottom: 2px solid #007bff;
        }
      `}</style>
    </>,
    document.body
  );
};

// Main Component
export default function AssignedEbooks() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedManuscript, setSelectedManuscript] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    
    setError("");
    try {
      const r = await fetchAllEbooks("UNDER_REVIEW");
      if (!r.success) throw new Error(r.message || "Failed to load assigned ebooks");
      setRows(r.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleViewDetails = (ebook) => {
    setSelectedManuscript(ebook);
    setShowDetailModal(true);
  };

  const handleViewSummary = (ebookId) => {
    nav(`/editor/review-summary/${ebookId}`);
  };

  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter(r => 
      r.title?.toLowerCase().includes(term) ||
      r.author_name?.toLowerCase().includes(term) ||
      r.author_email?.toLowerCase().includes(term)
    );
  }, [rows, searchTerm]);

  const stats = useMemo(() => ({
    total: rows.length,
    withReviews: rows.filter(r => r.review_count > 0).length,
    completed: rows.filter(r => r.review_completed).length
  }), [rows]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading assigned manuscripts...</p>
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
                <h3 className="mb-1 fw-bold">
                  <i className="bi bi-book me-2" style={{ color: "#667eea" }}></i>
                  Assigned Ebooks (Under Review)
                </h3>
                <p className="text-muted mb-0">
                  Manuscripts assigned to reviewers and waiting for review completion
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
                    placeholder="Search manuscripts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <button 
                  type="button" 
                  className="btn btn-outline-primary" 
                  onClick={() => load(true)} 
                  disabled={refreshing}
                  title="Refresh"
                >
                  <i className={`bi bi-arrow-repeat ${refreshing ? 'spinner' : ''}`}></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card bg-primary text-white shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-white-50 mb-1">Total Assigned</h6>
                    <h3 className="mb-0">{stats.total}</h3>
                  </div>
                  <i className="bi bi-files fs-1 opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-info text-white shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-white-50 mb-1">With Reviews</h6>
                    <h3 className="mb-0">{stats.withReviews}</h3>
                  </div>
                  <i className="bi bi-chat-dots fs-1 opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-success text-white shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-white-50 mb-1">Reviews Completed</h6>
                    <h3 className="mb-0">{stats.completed}</h3>
                  </div>
                  <i className="bi bi-check-circle fs-1 opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
            <div className="d-flex align-items-center">
              <i className="bi bi-exclamation-triangle-fill me-2 fs-4"></i>
              <div className="flex-grow-1">{error}</div>
              <button type="button" className="btn-close" onClick={() => setError("")}></button>
            </div>
          </div>
        )}

        {/* Main Table Card */}
        <div className="card shadow-sm">
          <div className="card-header bg-white py-3">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <i className="bi bi-list-ul me-2"></i>
                Manuscripts {filteredRows.length > 0 && `(${filteredRows.length})`}
              </h5>
              {searchTerm && (
                <button 
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setSearchTerm("")}
                >
                  <i className="bi bi-x me-1"></i>
                  Clear Search
                </button>
              )}
            </div>
          </div>

          <div className="card-body p-0">
            {rows.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-inbox fs-1 text-muted d-block mb-3"></i>
                <h5 className="text-muted">No assigned manuscripts</h5>
                <p className="text-muted mb-0">
                  No manuscripts are currently in the review stage.
                </p>
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-search fs-1 text-muted d-block mb-3"></i>
                <h5 className="text-muted">No matching manuscripts</h5>
                <p className="text-muted mb-3">
                  No manuscripts match your search criteria.
                </p>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th>Review Progress</th>
                      <th style={{ width: 280 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((r) => (
                      <tr key={r.ebook_id}>
                        <td>
                          <div className="fw-semibold">{r.title}</div>
                          <small className="text-muted d-block">
                            <i className="bi bi-hash me-1"></i>
                            ID: {r.ebook_id?.substring(0, 8)}...
                          </small>
                        </td>
                        <td>
                          <div className="fw-semibold">{r.author_name || 'Unknown'}</div>
                          <small className="text-muted d-block">{r.author_email}</small>
                        </td>
                        <td>
                          <span className={`badge bg-${getStatusColor(r.status)} px-3 py-2`}>
                            {formatStatus(r.status)}
                          </span>
                        </td>
                        <td>
                          <div>{r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : '-'}</div>
                          <small className="text-muted">
                            {r.submitted_at ? new Date(r.submitted_at).toLocaleTimeString() : ''}
                          </small>
                        </td>
                        <td>
                          {r.review_count > 0 ? (
                            <div>
                              <div className="d-flex align-items-center gap-2">
                                <div className="progress flex-grow-1" style={{ height: '6px' }}>
                                  <div 
                                    className="progress-bar bg-success" 
                                    style={{ width: `${(r.review_completed / r.review_count) * 100}%` }}
                                  ></div>
                                </div>
                                <small className="text-muted">
                                  {r.review_completed || 0}/{r.review_count}
                                </small>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted small">No reviews assigned</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleViewDetails(r)}
                              title="View manuscript details"
                            >
                              <i className="bi bi-eye me-1"></i>
                              Details
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              onClick={() => handleViewSummary(r.ebook_id)}
                              title="View review summary"
                            >
                              <i className="bi bi-bar-chart me-1"></i>
                              Reviews
                            </button>

                            {r.review_count > 0 && r.review_completed === r.review_count && (
                              <button
                                type="button"
                                className="btn btn-sm btn-success"
                                onClick={() => nav(`/editor/make-decision/${r.ebook_id}`)}
                                title="Make decision"
                              >
                                <i className="bi bi-check-circle me-1"></i>
                                Decide
                              </button>
                            )}
                          </div>
                          <small className="text-muted d-block mt-1">
                            {r.review_count} reviewer{r.review_count !== 1 ? 's' : ''} assigned
                          </small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Table Footer */}
          {filteredRows.length > 0 && (
            <div className="card-footer bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  <i className="bi bi-files me-1"></i>
                  Showing {filteredRows.length} of {rows.length} manuscripts
                </small>
                <small className="text-muted">
                  <i className="bi bi-clock me-1"></i>
                  Last updated: {new Date().toLocaleString()}
                </small>
              </div>
            </div>
          )}
        </div>

        {/* Quick Tips */}
        {rows.length > 0 && (
          <div className="card mt-4 bg-light border-0">
            <div className="card-body">
              <div className="d-flex">
                <i className="bi bi-info-circle-fill text-primary me-3 fs-4"></i>
                <div>
                  <h6 className="mb-2">Quick Tips</h6>
                  <ul className="list-unstyled mb-0 small text-muted">
                    <li className="mb-1">
                      <i className="bi bi-eye me-2"></i>
                      Click "Details" to view full manuscript information in a popup
                    </li>
                    <li className="mb-1">
                      <i className="bi bi-bar-chart me-2"></i>
                      "Reviews" shows detailed review summaries and recommendations
                    </li>
                    <li className="mb-1">
                      <i className="bi bi-check-circle me-2"></i>
                      "Decide" appears when all reviews are completed
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <DetailModal
        open={showDetailModal}
        ebookId={selectedManuscript?.ebook_id}
        onClose={() => setShowDetailModal(false)}
      />

      <style jsx>{`
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .progress {
          border-radius: 1rem;
        }
      `}</style>
    </MainLayout>
  );
}