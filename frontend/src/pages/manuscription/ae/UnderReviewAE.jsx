import React, { useEffect, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import Swal from "sweetalert2";
import axios from "axios";
import {
  fetchReviewersAPI,
  assignReviewersAPI,
} from "../../../api/associateEditor.api";

const API_BASE_URL = process.env.REACT_APP_API_URL;

export default function UnderReviewAE() {
  const [manuscripts, setManuscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Reviewers list for assignment
  const [reviewers, setReviewers] = useState([]);
  
  // Assignment modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedManuscript, setSelectedManuscript] = useState(null);
  const [selectedReviewers, setSelectedReviewers] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Reassign modal state
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [reassignManuscript, setReassignManuscript] = useState(null);
  const [newReviewer, setNewReviewer] = useState("");
  const [reassignReason, setReassignReason] = useState("");
  const [reassigning, setReassigning] = useState(false);

  // View reviews modal
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [viewingManuscript, setViewingManuscript] = useState(null);
  const [manuscriptReviews, setManuscriptReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    loadUnderReviewManuscripts();
    loadReviewers();
  }, []);

  const getManuscriptId = (m) => m.uuid || m.manuscript_uuid || m.id || null;

  const loadUnderReviewManuscripts = async () => {
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(
        `${API_BASE_URL}/manuscripts/under-review`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setManuscripts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load manuscripts");
      setManuscripts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadReviewers = async () => {
    try {
      const data = await fetchReviewersAPI();
      setReviewers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading reviewers:", err);
      Swal.fire('Error', 'Failed to load reviewers', 'error');
    }
  };

  // Open assign reviewer modal (multiple reviewers)
  const openAssignModal = (manuscript) => {
    setSelectedManuscript(manuscript);
    setSelectedReviewers([]);
    setDueDate("");
    setAssignModalOpen(true);
  };

  // Assign multiple reviewers using the API
  const assignReviewers = async () => {
    if (selectedReviewers.length === 0) {
      Swal.fire('Warning', 'Please select at least one reviewer', 'warning');
      return;
    }

    if (!dueDate) {
      Swal.fire('Warning', 'Please set a due date', 'warning');
      return;
    }

    const id = getManuscriptId(selectedManuscript);
    if (!id) {
      Swal.fire('Error', 'Invalid manuscript ID', 'error');
      return;
    }

    setAssigning(true);

    try {
      await assignReviewersAPI(id, selectedReviewers, dueDate);
      
      Swal.fire('Success', `${selectedReviewers.length} reviewer(s) assigned successfully`, 'success');
      setAssignModalOpen(false);
      loadUnderReviewManuscripts();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.response?.data?.message || 'Failed to assign reviewers', 'error');
    } finally {
      setAssigning(false);
    }
  };

  // Open reassign modal
  const openReassignModal = (manuscript) => {
    setReassignManuscript(manuscript);
    setNewReviewer("");
    setReassignReason("");
    setReassignModalOpen(true);
  };

  // Reassign reviewer
  const reassignReviewer = async () => {
    if (!newReviewer) {
      Swal.fire('Warning', 'Please select a new reviewer', 'warning');
      return;
    }

    if (!reassignReason.trim()) {
      Swal.fire('Warning', 'Please provide a reason for reassignment', 'warning');
      return;
    }

    const id = getManuscriptId(reassignManuscript);
    if (!id) {
      Swal.fire('Error', 'Invalid manuscript ID', 'error');
      return;
    }

    setReassigning(true);
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        `${API_BASE_URL}/manuscripts/${id}/reassign-reviewer`,
        {
          new_reviewer_id: newReviewer,
          reason: reassignReason
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire('Success', 'Reviewer reassigned successfully', 'success');
      setReassignModalOpen(false);
      loadUnderReviewManuscripts();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.response?.data?.message || 'Failed to reassign reviewer', 'error');
    } finally {
      setReassigning(false);
    }
  };

  // View manuscript reviews
  const viewReviews = async (manuscript) => {
    const id = getManuscriptId(manuscript);
    if (!id) {
      Swal.fire('Error', 'Invalid manuscript ID', 'error');
      return;
    }

    setViewingManuscript(manuscript);
    setReviewsModalOpen(true);
    setLoadingReviews(true);

    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        `${API_BASE_URL}/manuscripts/${id}/reviews`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setManuscriptReviews(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to load reviews', 'error');
    } finally {
      setLoadingReviews(false);
    }
  };

  /* ============================
     FILE OPEN HANDLER
  ============================ */
  const handleFileOpen = async (file) => {
    try {
      const token = localStorage.getItem('token');
      
      Swal.fire({
        title: 'Opening file...',
        text: 'Please wait',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const possibleEndpoints = [
        `${API_BASE_URL}/files/download/${file.file_path?.split('/').pop()}`,
        `${API_BASE_URL}/files/${file.id}`,
        `${API_BASE_URL}/files/view/${file.id}`,
        `${API_BASE_URL}/download/${file.id}`,
        `${API_BASE_URL}/file/${file.id}`
      ];

      let response = null;

      for (const endpoint of possibleEndpoints) {
        try {
          response = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob'
          });
          break;
        } catch (err) {
          console.log(`Endpoint ${endpoint} failed:`, err.response?.status);
        }
      }

      if (!response) {
        throw new Error('No working endpoint found for file download');
      }

      Swal.close();

      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/octet-stream' 
      });
      
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);

    } catch (err) {
      console.error('Error opening file:', err);
      Swal.close();
      
      Swal.fire({
        icon: 'error',
        title: 'Failed to open file',
        text: err.message || 'Please check if the file endpoint is correct'
      });
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'assigned': 'badge-info',
      'review_in_progress': 'badge-warning',
      'review_completed': 'badge-success',
      'overdue': 'badge-danger'
    };
    return badges[status] || 'badge-secondary';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <MainLayout>
      <div className="container-fluid">
        <div className="card card-primary card-outline">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h3 className="card-title">
              <i className="fas fa-eye me-2"></i>
              Manuscripts Under Review
            </h3>
            <button 
              className="btn btn-primary btn-sm"
              onClick={loadUnderReviewManuscripts}
              disabled={loading}
            >
              <i className="fas fa-sync-alt me-1"></i>
              Refresh
            </button>
          </div>

          <div className="card-body">
            {error && (
              <div className="alert alert-danger">{error}</div>
            )}

            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            ) : manuscripts.length === 0 ? (
              <div className="alert alert-info">No manuscripts under review</div>
            ) : (
              <table className="table table-bordered table-striped table-hover">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Assigned Reviewers</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th>Files</th>
                    <th width="300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {manuscripts.map((m) => {
                    const manuscriptId = getManuscriptId(m);
                    return (
                      <tr key={manuscriptId}>
                        <td>
                          <strong>{m.title || 'Untitled'}</strong>
                          <br />
                          <small className="text-muted">ID: {manuscriptId}</small>
                        </td>
                        <td>
                          {m.assigned_reviewers && m.assigned_reviewers.length > 0 ? (
                            <div>
                              {m.assigned_reviewers.map((reviewer, idx) => (
                                <div key={idx} className="mb-1">
                                  <span className="badge bg-primary p-2">
                                    {reviewer.name}
                                  </span>
                                  <br />
                                  <small className="text-muted">{reviewer.email}</small>
                                </div>
                              ))}
                            </div>
                          ) : m.assigned_reviewer ? (
                            <div>
                              <span className="badge bg-primary p-2 mb-1">
                                {m.assigned_reviewer.name}
                              </span>
                              <br />
                              <small className="text-muted">{m.assigned_reviewer.email}</small>
                            </div>
                          ) : (
                            <span className="badge bg-warning p-2">Not Assigned</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadge(m.review_status)} p-2`}>
                            {m.review_status?.replace(/_/g, ' ') || 'Pending'}
                          </span>
                        </td>
                        <td>
                          {m.due_date ? (
                            <div>
                              <span>{formatDate(m.due_date)}</span>
                              {new Date(m.due_date) < new Date() && m.review_status !== 'review_completed' && (
                                <div>
                                  <span className="badge bg-danger mt-1">Overdue</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted">Not set</span>
                          )}
                        </td>
                        <td>
                          {m.files && m.files.length > 0 ? (
                            <div className="btn-group">
                              {m.files.slice(0, 2).map((f, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleFileOpen(f)}
                                  className="btn btn-sm btn-outline-info me-1"
                                  title="View file"
                                >
                                  <i className="fas fa-file"></i>
                                </button>
                              ))}
                              {m.files.length > 2 && (
                                <span className="badge bg-info">+{m.files.length - 2}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted">No files</span>
                          )}
                        </td>
                        <td>
                          {(!m.assigned_reviewer && (!m.assigned_reviewers || m.assigned_reviewers.length === 0)) ? (
                            <button
                              className="btn btn-primary btn-sm me-1"
                              onClick={() => openAssignModal(m)}
                            >
                              <i className="fas fa-user-plus me-1"></i>
                              Assign
                            </button>
                          ) : (
                            <>
                              <button
                                className="btn btn-warning btn-sm me-1"
                                onClick={() => openReassignModal(m)}
                              >
                                <i className="fas fa-exchange-alt me-1"></i>
                                Reassign
                              </button>
                              <button
                                className="btn btn-info btn-sm me-1"
                                onClick={() => viewReviews(m)}
                              >
                                <i className="fas fa-star me-1"></i>
                                Reviews
                              </button>
                            </>
                          )}
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => window.open(`/manuscripts/${manuscriptId}`, '_blank')}
                          >
                            <i className="fas fa-eye me-1"></i>
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ASSIGN REVIEWERS MODAL - Multiple Selection */}
      {assignModalOpen && selectedManuscript && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-user-plus me-2"></i>
                  Assign Reviewers
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setAssignModalOpen(false)}
                />
              </div>

              <div className="modal-body">
                <div className="mb-3 p-3 bg-light rounded">
                  <strong>Manuscript:</strong> {selectedManuscript.title}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Due Date <span className="text-danger">*</span></label>
                  <input
                    type="date"
                    className="form-control"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Select Reviewers <span className="text-danger">*</span>
                    <span className="text-muted ms-2">({selectedReviewers.length} selected)</span>
                  </label>
                  <div className="border rounded p-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {reviewers.length === 0 ? (
                      <div className="text-muted text-center py-3">No reviewers found</div>
                    ) : (
                      reviewers.map((r) => (
                        <div className="form-check mb-2" key={r.uuid || r.id}>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`reviewer-${r.uuid || r.id}`}
                            checked={selectedReviewers.includes(r.uuid || r.id)}
                            onChange={(e) =>
                              setSelectedReviewers((prev) =>
                                e.target.checked
                                  ? [...prev, r.uuid || r.id]
                                  : prev.filter((id) => id !== (r.uuid || r.id))
                              )
                            }
                          />
                          <label className="form-check-label" htmlFor={`reviewer-${r.uuid || r.id}`}>
                            <strong>{r.full_name || r.name}</strong> 
                            <span className="text-muted"> ({r.email})</span>
                            {r.expertise && <span className="badge bg-info ms-2">{r.expertise}</span>}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setAssignModalOpen(false)}
                  disabled={assigning}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={assignReviewers}
                  disabled={selectedReviewers.length === 0 || !dueDate || assigning}
                >
                  {assigning ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1"></span>
                      Assigning...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check me-1"></i>
                      Assign ({selectedReviewers.length}) Reviewer(s)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REASSIGN REVIEWER MODAL - Single Selection */}
      {reassignModalOpen && reassignManuscript && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-warning">
                <h5 className="modal-title">
                  <i className="fas fa-exchange-alt me-2"></i>
                  Reassign Reviewer
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setReassignModalOpen(false)}
                />
              </div>

              <div className="modal-body">
                <div className="mb-3 p-3 bg-light rounded">
                  <strong>Manuscript:</strong> {reassignManuscript.title}
                </div>
                
                {reassignManuscript.assigned_reviewer && (
                  <div className="alert alert-info">
                    <strong>Current Reviewer:</strong> {reassignManuscript.assigned_reviewer.name} - {reassignManuscript.assigned_reviewer.email}
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label fw-bold">Select New Reviewer <span className="text-danger">*</span></label>
                  <select
                    className="form-control"
                    value={newReviewer}
                    onChange={(e) => setNewReviewer(e.target.value)}
                    required
                  >
                    <option value="">-- Choose a new reviewer --</option>
                    {reviewers
                      .filter(r => {
                        const currentId = reassignManuscript.assigned_reviewer?.id;
                        return r.id !== currentId;
                      })
                      .map(r => (
                        <option key={r.id} value={r.id}>
                          {r.full_name || r.name} - {r.email} {r.expertise ? `(${r.expertise})` : ''}
                        </option>
                      ))
                    }
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Reason for Reassignment <span className="text-danger">*</span></label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={reassignReason}
                    onChange={(e) => setReassignReason(e.target.value)}
                    placeholder="Explain why you're reassigning this manuscript..."
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setReassignModalOpen(false)}
                  disabled={reassigning}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-warning"
                  onClick={reassignReviewer}
                  disabled={!newReviewer || !reassignReason.trim() || reassigning}
                >
                  {reassigning ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1"></span>
                      Reassigning...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-exchange-alt me-1"></i>
                      Confirm Reassign
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW REVIEWS MODAL */}
      {reviewsModalOpen && viewingManuscript && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title">
                  <i className="fas fa-star me-2"></i>
                  Reviews for: {viewingManuscript.title}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setReviewsModalOpen(false)}
                />
              </div>

              <div className="modal-body">
                {loadingReviews ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-info" role="status">
                      <span className="sr-only">Loading...</span>
                    </div>
                  </div>
                ) : manuscriptReviews.length === 0 ? (
                  <p className="text-center text-muted py-4">No reviews submitted yet</p>
                ) : (
                  manuscriptReviews.map((review, index) => (
                    <div key={review.id} className="card mb-3">
                      <div className="card-header bg-light d-flex justify-content-between align-items-center">
                        <strong>Review #{index + 1}</strong>
                        <span className="text-muted">
                          Submitted: {formatDate(review.created_at)}
                        </span>
                      </div>
                      <div className="card-body">
                        <div className="row mb-2">
                          <div className="col-md-4">
                            <strong>Reviewer:</strong> {review.reviewer_name}
                          </div>
                          <div className="col-md-4">
                            <strong>Recommendation:</strong>{' '}
                            <span className={`badge bg-${review.recommendation === 'accept' ? 'success' : review.recommendation === 'reject' ? 'danger' : 'warning'}`}>
                              {review.recommendation}
                            </span>
                          </div>
                          <div className="col-md-4">
                            <strong>Rating:</strong> {review.rating}/5
                          </div>
                        </div>
                        
                        <div className="mb-2">
                          <strong>Comments to Editor:</strong>
                          <p className="mb-0 mt-1 p-2 bg-light rounded">{review.comments_to_editor}</p>
                        </div>
                        
                        <div className="mb-2">
                          <strong>Comments to Author:</strong>
                          <p className="mb-0 mt-1 p-2 bg-light rounded">{review.comments_to_author}</p>
                        </div>
                        
                        {review.files && review.files.length > 0 && (
                          <div className="mt-2">
                            <strong>Attachments:</strong>
                            <div className="mt-1">
                              {review.files.map((f, idx) => (
                                <button
                                  key={idx}
                                  className="btn btn-sm btn-outline-secondary me-1"
                                  onClick={() => handleFileOpen(f)}
                                >
                                  <i className="fas fa-file me-1"></i>
                                  File {idx + 1}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setReviewsModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}