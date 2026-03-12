// src/pages/ebooks/EditorScreeningQueue.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout.jsx";
import {
  fetchScreeningQueue,
  editorStartScreening,
  editorDeskReject,
  editorSendToReview,
  getScreeningFormData,
  editorRequestRevision,
} from "../../api/ebooks";

// Enhanced Portal Modal Component
function PortalModal({ open, title, onClose, children, footer, size = "md", loading = false }) {
  if (!open) return null;

  const sizeMap = {
    sm: 400,
    md: 520,
    lg: 720,
    xl: 960
  };
  const maxWidth = sizeMap[size] || 520;

  return createPortal(
    <>
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
            maxWidth,
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid rgba(0,0,0,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              background: "linear-gradient(to right, #f8f9fa, #ffffff)",
            }}
          >
            <h5 className="modal-title mb-0 fw-bold">
              <i className="bi bi-pencil-square me-2" style={{ color: "#667eea" }}></i>
              {title}
            </h5>
            <button 
              type="button" 
              className="btn btn-sm btn-outline-secondary rounded-circle" 
              onClick={onClose}
              style={{ width: 32, height: 32, padding: 0 }}
              disabled={loading}
            >
              <i className="bi bi-x"></i>
            </button>
          </div>

          <div style={{ padding: 24, maxHeight: "70vh", overflow: "auto" }}>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mb-0">Loading content...</p>
              </div>
            ) : children}
          </div>

          <div
            style={{
              padding: "16px 20px",
              borderTop: "1px solid rgba(0,0,0,0.08)",
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
              background: "#f8f9fa",
            }}
          >
            {footer}
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
      `}</style>
    </>,
    document.body
  );
}

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusConfig = (s) => {
    const config = {
      SUBMITTED: { class: "secondary", icon: "bi-send", text: "Submitted" },
      SCREENING: { class: "info", icon: "bi-search", text: "Screening" },
      UNDER_REVIEW: { class: "warning", icon: "bi-people", text: "Under Review" },
      REVISION_REQUESTED: { class: "warning", icon: "bi-pencil", text: "Revision Required" },
      ACCEPTED: { class: "success", icon: "bi-check-circle", text: "Accepted" },
      REJECTED: { class: "danger", icon: "bi-x-circle", text: "Rejected" },
    };
    return config[s] || { class: "secondary", icon: "bi-question", text: s };
  };

  const config = getStatusConfig(status);
  
  return (
    <span className={`badge bg-${config.class} px-3 py-2`}>
      <i className={`bi ${config.icon} me-1`}></i>
      {config.text}
    </span>
  );
};

// Manuscript Card Component for Mobile View
const ManuscriptCard = ({ manuscript, onView, onStartScreening, onReject, onAssign }) => {
  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h6 className="card-title mb-0">{manuscript.title}</h6>
          <StatusBadge status={manuscript.status} />
        </div>
        <div className="mb-2">
          <small className="text-muted d-block">
            <i className="bi bi-person me-1"></i>
            {manuscript.author_name || "Unknown"} · {manuscript.author_email}
          </small>
          <small className="text-muted d-block">
            <i className="bi bi-calendar me-1"></i>
            Submitted: {new Date(manuscript.submitted_at).toLocaleDateString()}
          </small>
        </div>
        <div className="d-flex gap-2 flex-wrap mt-3">
          <button className="btn btn-sm btn-outline-primary" onClick={() => onView(manuscript.ebook_id)}>
            <i className="bi bi-eye me-1"></i> View
          </button>
          {manuscript.status === "SUBMITTED" && (
            <button className="btn btn-sm btn-primary" onClick={() => onStartScreening(manuscript.ebook_id)}>
              <i className="bi bi-play-circle me-1"></i> Start Screening
            </button>
          )}
          {manuscript.status === "SCREENING" && (
            <>
              <button className="btn btn-sm btn-danger" onClick={() => onReject(manuscript)}>
                <i className="bi bi-x-circle me-1"></i> Reject
              </button>
              <button className="btn btn-sm btn-success" onClick={() => onAssign(manuscript)}>
                <i className="bi bi-person-check me-1"></i> Assign
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default function EditorScreeningQueue() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState(""); // "", SUBMITTED, SCREENING
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedManuscripts, setSelectedManuscripts] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Modal states
  const [showReject, setShowReject] = useState(false);
  const [rejectManuscript, setRejectManuscript] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  const [showAssign, setShowAssign] = useState(false);
  const [assignManuscript, setAssignManuscript] = useState(null);
  const [reviewersLoading, setReviewersLoading] = useState(false);
  const [availableReviewers, setAvailableReviewers] = useState([]);
  const [selectedReviewerIds, setSelectedReviewerIds] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [reviewerSearch, setReviewerSearch] = useState("");

  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showBulkAssign, setShowBulkAssign] = useState(false);

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchScreeningQueue(status);
      if (!res?.success) {
        setError(res?.message || "Failed to load screening queue");
      } else {
        setRows(res.data || []);
      }
    } catch (error) {
      setError(error.message || "Failed to load screening queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status]);

  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter(r => 
      r.title?.toLowerCase().includes(term) ||
      r.author_name?.toLowerCase().includes(term) ||
      r.author_email?.toLowerCase().includes(term)
    );
  }, [rows, searchTerm]);

  const counts = useMemo(() => ({
    submitted: rows.filter(r => r.status === "SUBMITTED").length,
    screening: rows.filter(r => r.status === "SCREENING").length,
    total: rows.length
  }), [rows]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return {
        full: date.toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        short: date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric"
        })
      };
    } catch {
      return { full: dateString || "Invalid date", short: dateString || "Invalid date" };
    }
  };

  const handleViewDetails = (ebookId) => {
    navigate(`/ebook/${ebookId}`);
  };

  const handleStartScreening = async (ebookId) => {
    try {
      const r = await editorStartScreening(ebookId);
      if (!r?.success) {
        alert(r?.message || "Failed to start screening");
      } else {
        await load();
      }
    } catch (e) {
      alert(e.message || "Failed to start screening");
    }
  };

  const openRejectModal = (manuscript) => {
    setRejectManuscript(manuscript);
    setRejectReason("");
    setShowReject(true);
  };

  const submitReject = async () => {
    if (!rejectManuscript) return;
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    setRejectLoading(true);
    try {
      const r = await editorDeskReject(rejectManuscript.ebook_id, { note: rejectReason.trim() });
      if (!r?.success) {
        alert(r?.message || "Failed to reject manuscript");
      } else {
        setShowReject(false);
        await load();
      }
    } catch (e) {
      alert(e.message || "Failed to reject manuscript");
    } finally {
      setRejectLoading(false);
    }
  };

  const openAssignModal = async (manuscript) => {
    setAssignManuscript(manuscript);
    setSelectedReviewerIds([]);
    setAvailableReviewers([]);
    setReviewerSearch("");
    setShowAssign(true);

    setReviewersLoading(true);
    try {
      const res = await getScreeningFormData(manuscript.ebook_id);
      if (!res?.success) {
        alert(res?.message || "Failed to load reviewers");
        setAvailableReviewers([]);
      } else {
        const reviewers = res?.data?.reviewers || res?.reviewers || [];
        setAvailableReviewers(reviewers);
      }
    } catch (e) {
      alert(e.message || "Failed to load reviewers");
    } finally {
      setReviewersLoading(false);
    }
  };

  const filteredReviewers = useMemo(() => {
    if (!reviewerSearch) return availableReviewers;
    const term = reviewerSearch.toLowerCase();
    return availableReviewers.filter(r => 
      (r.full_name || r.name || "").toLowerCase().includes(term) ||
      (r.email || "").toLowerCase().includes(term)
    );
  }, [availableReviewers, reviewerSearch]);

  const toggleReviewer = (id) => {
    setSelectedReviewerIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAllReviewers = () => {
    setSelectedReviewerIds(filteredReviewers.map(r => r.uuid));
  };

  const clearReviewers = () => {
    setSelectedReviewerIds([]);
  };

  const submitAssign = async () => {
    if (!assignManuscript) return;
    if (selectedReviewerIds.length === 0) {
      alert("Please select at least one reviewer");
      return;
    }

    setAssignLoading(true);
    try {
      const r = await editorSendToReview(assignManuscript.ebook_id, { 
        reviewerIds: selectedReviewerIds,
        note: `Assigned ${selectedReviewerIds.length} reviewer(s)`
      });
      if (!r?.success) {
        alert(r?.message || "Failed to send to review");
      } else {
        setShowAssign(false);
        await load();
      }
    } catch (e) {
      alert(e.message || "Failed to send to review");
    } finally {
      setAssignLoading(false);
    }
  };

  const toggleSelectManuscript = (ebookId) => {
    setSelectedManuscripts(prev =>
      prev.includes(ebookId) ? prev.filter(id => id !== ebookId) : [...prev, ebookId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedManuscripts.length === filteredRows.length) {
      setSelectedManuscripts([]);
    } else {
      setSelectedManuscripts(filteredRows.map(r => r.ebook_id));
    }
  };

  const handleBulkAssign = () => {
    if (selectedManuscripts.length === 0) {
      alert("Please select at least one manuscript");
      return;
    }
    setShowBulkAssign(true);
  };

  return (
    <MainLayout>
      <div className="container-fluid py-4">
        {/* Header Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex flex-wrap justify-content-between align-items-center">
              <div>
                <h3 className="mb-1 fw-bold">
                  <i className="bi bi-clipboard-check me-2" style={{ color: "#667eea" }}></i>
                  Screening Queue
                </h3>
                <p className="text-muted mb-0">
                  Manage manuscripts in the screening workflow
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
                  {searchTerm && (
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => setSearchTerm("")}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  )}
                </div>

                <select
                  className="form-select w-auto"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={loading}
                >
                  <option value="">All Status</option>
                  <option value="SUBMITTED">Submitted Only</option>
                  <option value="SCREENING">Screening Only</option>
                </select>

                <button 
                  className="btn btn-outline-primary" 
                  onClick={load} 
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
          <div className="col-md-4">
            <div className="card bg-primary text-white shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-white-50 mb-1">Total Queue</h6>
                    <h3 className="mb-0">{counts.total}</h3>
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
                    <h6 className="text-white-50 mb-1">Submitted</h6>
                    <h3 className="mb-0">{counts.submitted}</h3>
                  </div>
                  <i className="bi bi-send fs-1 opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-warning text-white shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-white-50 mb-1">In Screening</h6>
                    <h3 className="mb-0">{counts.screening}</h3>
                  </div>
                  <i className="bi bi-search fs-1 opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedManuscripts.length > 0 && (
          <div className="row mb-3">
            <div className="col-12">
              <div className="card bg-light border-primary">
                <div className="card-body py-2">
                  <div className="d-flex align-items-center gap-3">
                    <span className="fw-semibold">
                      <i className="bi bi-check-circle-fill text-primary me-1"></i>
                      {selectedManuscripts.length} selected
                    </span>
                    <button 
                      className="btn btn-sm btn-success"
                      onClick={handleBulkAssign}
                    >
                      <i className="bi bi-person-check me-1"></i>
                      Assign Reviewers
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => setShowBulkActions(true)}
                    >
                      <i className="bi bi-x-circle me-1"></i>
                      Bulk Reject
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-secondary ms-auto"
                      onClick={() => setSelectedManuscripts([])}
                    >
                      <i className="bi bi-x"></i>
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="row mb-3">
            <div className="col-12">
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <div className="d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle-fill me-2 fs-4"></i>
                  <div className="flex-grow-1">
                    <strong>Error:</strong> {error}
                  </div>
                  <button type="button" className="btn btn-sm btn-outline-danger ms-3" onClick={load}>
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
                    Manuscripts {filteredRows.length > 0 && `(${filteredRows.length})`}
                  </h5>
                  {!isMobile && filteredRows.length > 0 && (
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="selectAll"
                        checked={selectedManuscripts.length === filteredRows.length && filteredRows.length > 0}
                        onChange={toggleSelectAll}
                      />
                      <label className="form-check-label" htmlFor="selectAll">
                        Select All
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="card-body p-0">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted">Loading screening queue...</p>
                  </div>
                ) : filteredRows.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-inbox fs-1 text-muted d-block mb-3"></i>
                    <h5 className="text-muted">No manuscripts found</h5>
                    <p className="text-muted small">
                      {searchTerm 
                        ? "No manuscripts match your search criteria." 
                        : status 
                          ? `No manuscripts with status "${status}" found.` 
                          : "All submitted manuscripts will appear here once they are ready for screening."}
                    </p>
                    {searchTerm && (
                      <button className="btn btn-outline-primary btn-sm mt-2" onClick={() => setSearchTerm("")}>
                        Clear search
                      </button>
                    )}
                    {status && (
                      <button className="btn btn-outline-primary btn-sm mt-2 ms-2" onClick={() => setStatus("")}>
                        Clear filter
                      </button>
                    )}
                  </div>
                ) : isMobile ? (
                  // Mobile View
                  <div className="p-3">
                    {filteredRows.map((r) => (
                      <ManuscriptCard
                        key={r.ebook_id}
                        manuscript={r}
                        onView={handleViewDetails}
                        onStartScreening={handleStartScreening}
                        onReject={openRejectModal}
                        onAssign={openAssignModal}
                      />
                    ))}
                  </div>
                ) : (
                  // Desktop View
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th width="40">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={selectedManuscripts.length === filteredRows.length && filteredRows.length > 0}
                              onChange={toggleSelectAll}
                            />
                          </th>
                          <th>Title & Author</th>
                          <th>Status</th>
                          <th>Submitted</th>
                          <th>Last Updated</th>
                          <th width="350">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRows.map((r) => {
                          const submitted = formatDate(r.submitted_at);
                          const updated = formatDate(r.updated_at);
                          return (
                            <tr key={r.ebook_id}>
                              <td>
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={selectedManuscripts.includes(r.ebook_id)}
                                  onChange={() => toggleSelectManuscript(r.ebook_id)}
                                />
                              </td>
                              <td>
                                <div className="fw-semibold">{r.title}</div>
                                <small className="text-muted d-block">
                                  <i className="bi bi-person me-1"></i>
                                  {r.author_name || "Unknown"} · {r.author_email}
                                </small>
                                <small className="text-muted">
                                  <i className="bi bi-hash me-1"></i>
                                  ID: {r.ebook_id?.substring(0, 8)}...
                                </small>
                              </td>
                              <td>
                                <StatusBadge status={r.status} />
                              </td>
                              <td>
                                <div>{submitted.short}</div>
                                <small className="text-muted">{new Date(r.submitted_at).toLocaleTimeString()}</small>
                              </td>
                              <td>
                                <div>{updated.short}</div>
                                <small className="text-muted">{new Date(r.updated_at).toLocaleTimeString()}</small>
                              </td>
                              <td>
                                <div className="d-flex gap-2 flex-wrap">
                                  <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => handleViewDetails(r.ebook_id)}
                                    title="View details"
                                  >
                                    <i className="bi bi-eye me-1"></i>
                                    View
                                  </button>

                                  {r.status === "SUBMITTED" && (
                                    <button
                                      type="button"
                                      className="btn btn-primary btn-sm"
                                      onClick={() => handleStartScreening(r.ebook_id)}
                                      title="Start screening process"
                                    >
                                      <i className="bi bi-play-circle me-1"></i>
                                      Start Screening
                                    </button>
                                  )}

                                  {r.status === "SCREENING" && (
                                    <>
                                      <button
                                        type="button"
                                        className="btn btn-danger btn-sm"
                                        onClick={() => openRejectModal(r)}
                                        title="Reject manuscript"
                                      >
                                        <i className="bi bi-x-circle me-1"></i>
                                        Reject
                                      </button>

                                      <button
                                        type="button"
                                        className="btn btn-success btn-sm"
                                        onClick={() => openAssignModal(r)}
                                        title="Assign reviewers"
                                      >
                                        <i className="bi bi-person-check me-1"></i>
                                        Assign
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {!loading && filteredRows.length > 0 && (
                <div className="card-footer bg-light">
                  <div className="d-flex flex-wrap justify-content-between align-items-center">
                    <small className="text-muted">
                      <i className="bi bi-files me-1"></i>
                      Showing {filteredRows.length} of {rows.length} manuscripts
                    </small>
                    <div>
                      <span className="badge bg-secondary me-2">
                        <i className="bi bi-send me-1"></i>
                        Submitted: {counts.submitted}
                      </span>
                      <span className="badge bg-info">
                        <i className="bi bi-search me-1"></i>
                        Screening: {counts.screening}
                      </span>
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
                  <button className="btn btn-outline-primary" onClick={() => setStatus("SUBMITTED")}>
                    <i className="bi bi-send me-2"></i>
                    View Submitted
                  </button>
                  <button className="btn btn-outline-info" onClick={() => setStatus("SCREENING")}>
                    <i className="bi bi-search me-2"></i>
                    View In Screening
                  </button>
                  <button className="btn btn-outline-secondary" onClick={() => setStatus("")}>
                    <i className="bi bi-files me-2"></i>
                    View All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      <PortalModal
        open={showReject}
        title="Desk Reject Manuscript"
        size="md"
        onClose={() => setShowReject(false)}
        loading={rejectLoading}
        footer={
          <>
            <button 
              type="button" 
              className="btn btn-outline-secondary" 
              onClick={() => setShowReject(false)} 
              disabled={rejectLoading}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-danger" 
              onClick={submitReject} 
              disabled={rejectLoading}
            >
              {rejectLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Rejecting...
                </>
              ) : (
                <>
                  <i className="bi bi-x-circle me-2"></i>
                  Confirm Reject
                </>
              )}
            </button>
          </>
        }
      >
        {rejectManuscript && (
          <>
            <div className="mb-3">
              <div className="bg-light p-3 rounded">
                <h6 className="mb-1">{rejectManuscript.title}</h6>
                <small className="text-muted">
                  by {rejectManuscript.author_name} · {rejectManuscript.author_email}
                </small>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                Rejection Reason <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-control"
                rows={5}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please provide a detailed reason for rejection..."
                disabled={rejectLoading}
              />
              <small className="text-muted">
                This reason will be visible to the author and recorded in the workflow history.
              </small>
            </div>

            <div className="alert alert-warning small">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              This action cannot be undone. The manuscript will be marked as rejected and the author will be notified.
            </div>
          </>
        )}
      </PortalModal>

      {/* Assign Reviewers Modal */}
      <PortalModal
        open={showAssign}
        title="Assign Reviewers"
        size="lg"
        onClose={() => setShowAssign(false)}
        loading={reviewersLoading || assignLoading}
        footer={
          <>
            <button 
              type="button" 
              className="btn btn-outline-secondary" 
              onClick={() => setShowAssign(false)} 
              disabled={assignLoading || reviewersLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={submitAssign}
              disabled={assignLoading || reviewersLoading || selectedReviewerIds.length === 0}
            >
              {assignLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Assigning...
                </>
              ) : (
                <>
                  <i className="bi bi-person-check me-2"></i>
                  Assign to Review ({selectedReviewerIds.length})
                </>
              )}
            </button>
          </>
        }
      >
        {assignManuscript && (
          <>
            <div className="mb-3">
              <div className="bg-light p-3 rounded">
                <h6 className="mb-1">{assignManuscript.title}</h6>
                <small className="text-muted">
                  by {assignManuscript.author_name} · {assignManuscript.author_email}
                </small>
              </div>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label fw-semibold mb-0">
                  Select Reviewers <span className="text-danger">*</span>
                </label>
                <span className="badge bg-primary">{selectedReviewerIds.length} selected</span>
              </div>

              <div className="input-group mb-3">
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

              <div className="d-flex gap-2 mb-3">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={selectAllReviewers}
                  disabled={reviewersLoading || filteredReviewers.length === 0}
                >
                  <i className="bi bi-check-all me-1"></i>
                  Select All
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
              </div>

              {reviewersLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary mb-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-muted small mb-0">Loading reviewers...</p>
                </div>
              ) : filteredReviewers.length === 0 ? (
                <div className="alert alert-warning">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {availableReviewers.length === 0 
                    ? "No reviewers found. Please ensure reviewer accounts exist in the system."
                    : "No reviewers match your search criteria."}
                </div>
              ) : (
                <div className="list-group" style={{ maxHeight: "300px", overflowY: "auto" }}>
                  {filteredReviewers.map((reviewer) => (
                    <label key={reviewer.uuid} className="list-group-item list-group-item-action d-flex align-items-center gap-3">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedReviewerIds.includes(reviewer.uuid)}
                        onChange={() => toggleReviewer(reviewer.uuid)}
                      />
                      <div className="flex-grow-1">
                        <div className="fw-semibold">{reviewer.full_name || reviewer.name || "Reviewer"}</div>
                        <small className="text-muted d-block">{reviewer.email}</small>
                        {reviewer.expertise && (
                          <small className="text-muted">
                            <i className="bi bi-tag me-1"></i>
                            {reviewer.expertise}
                          </small>
                        )}
                      </div>
                      {reviewer.assignment_count && (
                        <span className="badge bg-info">{reviewer.assignment_count} active</span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="alert alert-info small">
              <i className="bi bi-info-circle me-2"></i>
              Selected reviewers will receive email notifications with access to the manuscript.
            </div>
          </>
        )}
      </PortalModal>

      {/* Bulk Actions Modal */}
      <PortalModal
        open={showBulkAssign}
        title="Bulk Assign Reviewers"
        size="lg"
        onClose={() => setShowBulkAssign(false)}
        footer={
          <>
            <button type="button" className="btn btn-outline-secondary" onClick={() => setShowBulkAssign(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-success" onClick={() => setShowBulkAssign(false)}>
              Assign to Selected ({selectedManuscripts.length})
            </button>
          </>
        }
      >
        <div className="mb-3">
          <p className="mb-2">
            <strong>{selectedManuscripts.length}</strong> manuscripts selected for bulk assignment:
          </p>
          <div className="bg-light p-3 rounded" style={{ maxHeight: "200px", overflowY: "auto" }}>
            {rows
              .filter(r => selectedManuscripts.includes(r.ebook_id))
              .map(r => (
                <div key={r.ebook_id} className="mb-1">
                  <i className="bi bi-file-text me-2"></i>
                  {r.title}
                </div>
              ))}
          </div>
        </div>
        
        <div className="mb-3">
          <label className="form-label fw-semibold">Select Common Reviewers</label>
          <div className="alert alert-warning">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Bulk assignment will assign the same reviewers to all selected manuscripts.
          </div>
        </div>
      </PortalModal>

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
        .btn-group-sm > .btn, .btn-sm {
          padding: 0.4rem 0.8rem;
          font-size: 0.875rem;
        }
      `}</style>
    </MainLayout>
  );
}