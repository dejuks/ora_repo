import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import MainLayout from "../../../../components/layout/MainLayout";

const API = process.env.REACT_APP_API_URL;

function EbookEditorAssignReviewersPage() {
  const submissionId = window.location.pathname.split("/").pop();

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const [submission, setSubmission] = useState(null);
  const [reviewers, setReviewers] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [selectedReviewers, setSelectedReviewers] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [invitationNote, setInvitationNote] = useState("");

  // Use your actual backend endpoints
  const BASE = `${API}/oraebook`;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      window.location.href = "/login";
      return;
    }

    loadData();
  }, [submissionId]);

  const loadData = async () => {
    const token = localStorage.getItem("token");
    
    try {
      setLoading(true);
      setError("");

      // Use your existing endpoint: /editor/assigned-reviewers/:submissionId
      const response = await axios.get(
        `${BASE}/editor/assigned-reviewers/${submissionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { search: search || "" }
        }
      );

      if (response.data?.success) {
        const { submission, reviewers, assignments } = response.data.data;
        setSubmission(submission);
        setReviewers(Array.isArray(reviewers) ? reviewers : []);
        setAssignments(Array.isArray(assignments) ? assignments : []);
      } else {
        setError(response.data?.message || "Failed to load data");
      }
    } catch (err) {
      console.error("Load error:", err);
      setError(err?.response?.data?.message || "Failed to load assign reviewers page");
      setReviewers([]);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  // Reload when search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) loadData();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const assignedReviewerIds = useMemo(() => {
    return new Set(assignments.map((a) => a.reviewer_id));
  }, [assignments]);

  const availableReviewers = useMemo(() => {
    return reviewers.filter((r) => !assignedReviewerIds.has(r.uuid));
  }, [reviewers, assignedReviewerIds]);

  const stats = useMemo(() => {
    return {
      available: availableReviewers.length,
      assigned: assignments.length,
      selected: selectedReviewers.length,
      submitted: assignments.filter(
        (a) => (a.status || "").toLowerCase() === "submitted" || (a.status || "").toLowerCase() === "completed"
      ).length,
    };
  }, [availableReviewers, assignments, selectedReviewers]);

  const filteredAvailableReviewers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return availableReviewers;

    return availableReviewers.filter((r) => {
      const fullName = (r.full_name || "").toLowerCase();
      const email = (r.email || "").toLowerCase();
      const role = (r.role_name || "").toLowerCase();
      return fullName.includes(q) || email.includes(q) || role.includes(q);
    });
  }, [availableReviewers, search]);

  const toggleReviewer = (reviewerId) => {
    setSelectedReviewers((prev) => {
      if (prev.includes(reviewerId)) {
        return prev.filter((id) => id !== reviewerId);
      }
      return [...prev, reviewerId];
    });
  };

  const handleAssignReviewers = async () => {
    const token = localStorage.getItem("token");

    if (!selectedReviewers.length) {
      alert("Please select at least one reviewer");
      return;
    }

    try {
      setAssigning(true);

      // Use your endpoint: POST /editor/assign-me-reviewers/:submissionId
      const response = await axios.post(
        `${BASE}/editor/assign-me-reviewers/${submissionId}`,
        {
          reviewer_ids: selectedReviewers,
          due_date: dueDate || null,
          invitation_note: invitationNote || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        alert("Reviewer(s) assigned successfully");
        setSelectedReviewers([]);
        setDueDate("");
        setInvitationNote("");
        await loadData();
      } else {
        alert(response.data?.message || "Failed to assign reviewers");
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to assign reviewers");
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusChange = async (assignmentId, status) => {
    const token = localStorage.getItem("token");

    try {
      setActionLoadingId(assignmentId);

      // Use your endpoint: PATCH /editor/assign-reviewers/:submissionId/assignment/:assignmentId
      const response = await axios.patch(
        `${BASE}/editor/assign-reviewers/${submissionId}/assignment/${assignmentId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        alert("Assignment status updated");
        await loadData();
      } else {
        alert(response.data?.message || "Failed to update assignment");
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to update assignment");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleResendInvitation = async (assignmentId) => {
    const token = localStorage.getItem("token");

    try {
      setActionLoadingId(assignmentId);

      // Use your endpoint: POST /editor/assign-reviewers/:submissionId/assignment/:assignmentId/resend
      const response = await axios.post(
        `${BASE}/editor/assign-reviewers/${submissionId}/assignment/${assignmentId}/resend`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        alert("Invitation resent successfully");
        await loadData();
      } else {
        alert(response.data?.message || "Failed to resend invitation");
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to resend invitation");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleRemoveAssignment = async (assignmentId) => {
    const ok = window.confirm("Are you sure you want to remove this assignment?");
    if (!ok) return;

    const token = localStorage.getItem("token");

    try {
      setActionLoadingId(assignmentId);

      // Use your endpoint: DELETE /editor/assign-reviewers/:submissionId/assignment/:assignmentId
      const response = await axios.delete(
        `${BASE}/editor/assign-reviewers/${submissionId}/assignment/${assignmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        alert("Assignment removed successfully");
        await loadData();
      } else {
        alert(response.data?.message || "Failed to remove assignment");
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to remove assignment");
    } finally {
      setActionLoadingId("");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <div className="text-muted">Loading assign reviewers page...</div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ background: "#f4f7fb", minHeight: "100vh" }}>
        <div className="container-fluid py-4">
          {/* Error Alert */}
          {error && (
            <div className="alert alert-warning alert-dismissible fade show mb-4" role="alert">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              {error}
              <button type="button" className="close" onClick={() => setError("")}>&times;</button>
            </div>
          )}

          {/* Header */}
          <div className="rounded-4 shadow-sm overflow-hidden mb-4" style={{ background: "linear-gradient(135deg, #198754 0%, #0d6efd 55%, #4f46e5 100%)" }}>
            <div className="p-4 p-md-5 text-white">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div>
                  <div className="d-inline-flex align-items-center px-3 py-2 rounded-pill mb-3" style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)" }}>
                    <i className="fas fa-user-plus mr-2"></i>
                    <span className="font-weight-bold">Editor Workspace</span>
                  </div>
                  <h1 className="mb-2 font-weight-bold">Assign Reviewers</h1>
                  <p className="mb-0">Assign peer reviewers and manage review workflow for this submission.</p>
                </div>
                <div>
                  <a href="/ebook/dashboard/editor" className="btn btn-light btn-lg shadow-sm rounded-pill px-4">
                    <i className="fas fa-arrow-left mr-2"></i>Back to Dashboard
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="row mb-4">
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body d-flex align-items-center">
                  <div className="rounded-circle d-flex align-items-center justify-content-center mr-3" style={{ width: 56, height: 56, background: "rgba(13,110,253,0.12)", color: "#0d6efd" }}>
                    <i className="fas fa-users fa-lg"></i>
                  </div>
                  <div>
                    <div className="text-muted small">Available Reviewers</div>
                    <div className="h4 mb-0 font-weight-bold">{stats.available}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body d-flex align-items-center">
                  <div className="rounded-circle d-flex align-items-center justify-content-center mr-3" style={{ width: 56, height: 56, background: "rgba(25,135,84,0.12)", color: "#198754" }}>
                    <i className="fas fa-user-check fa-lg"></i>
                  </div>
                  <div>
                    <div className="text-muted small">Assigned</div>
                    <div className="h4 mb-0 font-weight-bold">{stats.assigned}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body d-flex align-items-center">
                  <div className="rounded-circle d-flex align-items-center justify-content-center mr-3" style={{ width: 56, height: 56, background: "rgba(255,193,7,0.16)", color: "#b58100" }}>
                    <i className="fas fa-check-square fa-lg"></i>
                  </div>
                  <div>
                    <div className="text-muted small">Selected</div>
                    <div className="h4 mb-0 font-weight-bold">{stats.selected}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body d-flex align-items-center">
                  <div className="rounded-circle d-flex align-items-center justify-content-center mr-3" style={{ width: 56, height: 56, background: "rgba(111,66,193,0.14)", color: "#6f42c1" }}>
                    <i className="fas fa-file-upload fa-lg"></i>
                  </div>
                  <div>
                    <div className="text-muted small">Submitted Reviews</div>
                    <div className="h4 mb-0 font-weight-bold">{stats.submitted}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submission Details */}
          {submission && (
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-header bg-white border-0 px-4 py-3">
                <h3 className="mb-0 font-weight-bold">Submission Details</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <small className="text-muted">Title</small>
                    <div className="font-weight-bold">{submission.title || "-"}</div>
                  </div>
                  <div className="col-md-3">
                    <small className="text-muted">Status</small>
                    <div><span className="badge bg-success">{submission.status || "-"}</span></div>
                  </div>
                  <div className="col-md-3">
                    <small className="text-muted">Author</small>
                    <div>{submission.author_name || "-"}</div>
                  </div>
                </div>
                {submission.abstract && (
                  <div className="row mt-3">
                    <div className="col-12">
                      <small className="text-muted">Abstract</small>
                      <div className="p-3 rounded-3 border bg-light">{submission.abstract}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="row">
            {/* Left Column - Available Reviewers */}
            <div className="col-lg-5 mb-4">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-header bg-white border-0 px-4 py-3">
                  <h4 className="mb-0">Available Reviewers</h4>
                </div>
                <div className="card-body">
                  <input 
                    type="text" 
                    className="form-control rounded-pill mb-3" 
                    placeholder="Search by name or email..." 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                  />
                  
                  <div className="border rounded-4 p-2" style={{ maxHeight: "400px", overflowY: "auto", background: "#f8fafc" }}>
                    {filteredAvailableReviewers.length === 0 ? (
                      <div className="text-center py-4 text-muted">No available reviewers found.</div>
                    ) : (
                      filteredAvailableReviewers.map((reviewer) => (
                        <label key={reviewer.uuid} className="d-flex align-items-start p-3 mb-2 bg-white rounded-4 border" style={{ cursor: "pointer" }}>
                          <input 
                            type="checkbox" 
                            className="mt-1 mr-3" 
                            checked={selectedReviewers.includes(reviewer.uuid)} 
                            onChange={() => toggleReviewer(reviewer.uuid)} 
                          />
                          <div>
                            <div className="font-weight-bold">{reviewer.full_name}</div>
                            <div className="text-muted small">{reviewer.email}</div>
                            <div className="text-primary small">{reviewer.role_name || "Reviewer"}</div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>

                  <div className="mt-4">
                    <label className="small text-muted">Due Date (Optional)</label>
                    <input type="date" className="form-control rounded-pill" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                  </div>
                  <div className="mt-3">
                    <label className="small text-muted">Invitation Note (Optional)</label>
                    <textarea 
                      className="form-control rounded-4" 
                      rows="3" 
                      placeholder="Add a personal note to reviewers..." 
                      value={invitationNote} 
                      onChange={(e) => setInvitationNote(e.target.value)} 
                    />
                  </div>
                  <button 
                    className="btn btn-success btn-lg w-100 rounded-pill mt-4" 
                    onClick={handleAssignReviewers} 
                    disabled={assigning}
                  >
                    <i className="fas fa-user-plus mr-2"></i>{assigning ? "Assigning..." : "Assign Selected Reviewers"}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Current Assignments */}
            <div className="col-lg-7 mb-4">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-header bg-white border-0 px-4 py-3">
                  <h4 className="mb-0">Current Assignments</h4>
                </div>
                <div className="card-body">
                  {assignments.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="fas fa-user-clock fa-3x text-muted mb-3"></i>
                      <p className="text-muted mb-0">No reviewers assigned yet.</p>
                    </div>
                  ) : (
                    assignments.map((assignment) => (
                      <div className="border rounded-4 p-3 mb-3 bg-light" key={assignment.assignment_id}>
                        <div className="d-flex flex-column flex-md-row justify-content-between">
                          <div>
                            <div className="font-weight-bold">{assignment.reviewer_name}</div>
                            <div className="text-muted small">{assignment.reviewer_email}</div>
                            <div className="mt-2 small">
                              <strong>Status:</strong> 
                              <span className={`badge ml-2 ${
                                assignment.status === 'submitted' ? 'bg-success' : 
                                assignment.status === 'accepted' ? 'bg-info' : 
                                assignment.status === 'declined' ? 'bg-danger' : 'bg-warning'
                              }`}>
                                {assignment.status || "assigned"}
                              </span>
                            </div>
                            {assignment.due_date && (
                              <div className="small mt-1">
                                <strong>Due Date:</strong> {new Date(assignment.due_date).toLocaleDateString()}
                              </div>
                            )}
                            {assignment.invitation_note && (
                              <div className="small mt-1 text-muted">
                                <strong>Note:</strong> {assignment.invitation_note}
                              </div>
                            )}
                          </div>
                          <div className="mt-3 mt-md-0" style={{ minWidth: "200px" }}>
                            <select 
                              className="form-control rounded-pill mb-2" 
                              value={assignment.status} 
                              onChange={(e) => handleStatusChange(assignment.assignment_id, e.target.value)} 
                              disabled={actionLoadingId === assignment.assignment_id}
                            >
                              <option value="assigned">assigned</option>
                              <option value="accepted">accepted</option>
                              <option value="declined">declined</option>
                              <option value="submitted">submitted</option>
                            </select>
                            <button 
                              className="btn btn-warning btn-block rounded-pill mb-2" 
                              onClick={() => handleResendInvitation(assignment.assignment_id)} 
                              disabled={actionLoadingId === assignment.assignment_id}
                            >
                              <i className="fas fa-paper-plane mr-2"></i>Resend
                            </button>
                            <button 
                              className="btn btn-danger btn-block rounded-pill" 
                              onClick={() => handleRemoveAssignment(assignment.assignment_id)} 
                              disabled={actionLoadingId === assignment.assignment_id}
                            >
                              <i className="fas fa-trash-alt mr-2"></i>Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default EbookEditorAssignReviewersPage;