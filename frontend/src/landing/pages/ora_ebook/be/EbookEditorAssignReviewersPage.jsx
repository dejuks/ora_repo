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

  const [submission, setSubmission] = useState(null);
  const [reviewers, setReviewers] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [selectedReviewers, setSelectedReviewers] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [invitationNote, setInvitationNote] = useState("");

  const BASE_GET = `${API}/oraebook/editor/assigned-reviewers`;
  // app.use("/api/oraebook", editorReviewerRoutes);
  // router.post(
  //   "/editor/assign-me-reviewers/:submissionId",
  //   authenticate,
  //   assignReviewersHandler
  // );
  
  const BASE_POST = `${API}/oraebook/editor/assign-me-reviewers`;
  const BASE_ACTION = `${API}/oraebook/editor/assign-reviewers`;

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      window.location.href = "/login";
      return;
    }

    loadData(token, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissionId]);

  const loadData = async (token, query = "") => {
    try {
      setLoading(true);

      const res = await axios.get(`${BASE_GET}/${submissionId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: query || "" },
      });

      const payload = res?.data?.data || {};

      setSubmission(payload.submission || null);
      setReviewers(Array.isArray(payload.reviewers) ? payload.reviewers : []);
      setAssignments(Array.isArray(payload.assignments) ? payload.assignments : []);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to load assign reviewers page");
    } finally {
      setLoading(false);
    }
  };

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
        (a) => (a.status || "").toLowerCase() === "submitted"
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

      await axios.post(
        `${BASE_POST}/${submissionId}`,
        {
          reviewer_ids: selectedReviewers,
          due_date: dueDate || null,
          invitation_note: invitationNote || null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Reviewer(s) assigned successfully");

      setSelectedReviewers([]);
      setDueDate("");
      setInvitationNote("");

      loadData(token, search);
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

      await axios.patch(
        `${BASE_ACTION}/${submissionId}/assignment/${assignmentId}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Assignment status updated");
      loadData(token, search);
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

      await axios.post(
        `${BASE_ACTION}/${submissionId}/assignment/${assignmentId}/resend`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Invitation resent successfully");
      loadData(token, search);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to resend invitation");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleRemoveAssignment = async (assignmentId) => {
    const token = localStorage.getItem("token");

    const ok = window.confirm("Are you sure you want to remove this assignment?");
    if (!ok) return;

    try {
      setActionLoadingId(assignmentId);

      await axios.delete(
        `${BASE_ACTION}/${submissionId}/assignment/${assignmentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Assignment removed successfully");
      loadData(token, search);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to remove assignment");
    } finally {
      setActionLoadingId("");
    }
  };

  return (
    <MainLayout>
      <div style={{ background: "#f4f7fb", minHeight: "100vh" }}>
        <section className="content-header pb-0">
          <div className="container-fluid">
            <div
              className="rounded-4 shadow-sm overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, #198754 0%, #0d6efd 55%, #4f46e5 100%)",
              }}
            >
              <div className="p-4 p-md-5 text-white">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                  <div>
                    <div
                      className="d-inline-flex align-items-center px-3 py-2 rounded-pill mb-3"
                      style={{
                        background: "rgba(255,255,255,0.18)",
                        backdropFilter: "blur(6px)",
                      }}
                    >
                      <i className="fas fa-user-plus mr-2"></i>
                      <span className="font-weight-bold">Book Editor Workspace</span>
                    </div>

                    <h1 className="mb-2 font-weight-bold">Assign Reviewers</h1>
                    <p className="mb-0" style={{ color: "rgba(255,255,255,0.88)" }}>
                      Assign peer reviewers, manage invitations, and control reviewer
                      workflow for this submission.
                    </p>
                  </div>

                  <div className="text-md-right">
                    <a
                      href="/ebook/dashboard/editor"
                      className="btn btn-light btn-lg shadow-sm rounded-pill px-4"
                    >
                      <i className="fas fa-arrow-left mr-2"></i>
                      Back to Dashboard
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="row mt-4">
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body d-flex align-items-center">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle mr-3"
                      style={{
                        width: 56,
                        height: 56,
                        background: "rgba(13,110,253,0.12)",
                        color: "#0d6efd",
                      }}
                    >
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
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body d-flex align-items-center">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle mr-3"
                      style={{
                        width: 56,
                        height: 56,
                        background: "rgba(25,135,84,0.12)",
                        color: "#198754",
                      }}
                    >
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
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body d-flex align-items-center">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle mr-3"
                      style={{
                        width: 56,
                        height: 56,
                        background: "rgba(255,193,7,0.16)",
                        color: "#b58100",
                      }}
                    >
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
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body d-flex align-items-center">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle mr-3"
                      style={{
                        width: 56,
                        height: 56,
                        background: "rgba(111,66,193,0.14)",
                        color: "#6f42c1",
                      }}
                    >
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

            {submission && (
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden mt-2">
                <div className="card-header bg-white border-0 px-4 py-3">
                  <h3 className="mb-1 font-weight-bold" style={{ fontSize: "1.2rem" }}>
                    Submission Details
                  </h3>
                  <div className="text-muted small">
                    Information about the manuscript under reviewer assignment.
                  </div>
                </div>

                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <div className="text-muted small">Title</div>
                      <div className="font-weight-bold">{submission.title || "-"}</div>
                    </div>
                    <div className="col-md-4 mb-3">
                      <div className="text-muted small">Subtitle</div>
                      <div className="font-weight-bold">{submission.subtitle || "-"}</div>
                    </div>
                    <div className="col-md-4 mb-3">
                      <div className="text-muted small">Status</div>
                      <div className="font-weight-bold text-success">
                        {submission.status || "-"}
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="text-muted small">Category</div>
                      <div className="font-weight-bold">{submission.category || "-"}</div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="text-muted small">Language</div>
                      <div className="font-weight-bold">{submission.language || "-"}</div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="text-muted small">Publication Year</div>
                      <div className="font-weight-bold">
                        {submission.publication_year || "-"}
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="text-muted small">Version</div>
                      <div className="font-weight-bold">
                        {submission.current_version_no || "-"}
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="text-muted small">Author Name</div>
                      <div className="font-weight-bold">{submission.author_name || "-"}</div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="text-muted small">Author Email</div>
                      <div className="font-weight-bold">{submission.author_email || "-"}</div>
                    </div>
                    <div className="col-12">
                      <div className="text-muted small">Abstract</div>
                      <div
                        className="p-3 rounded-3 border"
                        style={{ background: "#f8fafc", lineHeight: 1.7 }}
                      >
                        {submission.abstract || "No abstract provided"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="content pt-2">
          <div className="container-fluid">
            <div className="row">
              <div className="col-lg-5 mb-4">
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                  <div className="card-header bg-white border-0 px-4 py-3">
                    <h3 className="mb-1 font-weight-bold" style={{ fontSize: "1.2rem" }}>
                      Available Reviewers
                    </h3>
                    <div className="text-muted small">
                      Select one or many reviewers for this submission.
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="mb-3">
                      <div
                        className="input-group shadow-sm"
                        style={{
                          borderRadius: "999px",
                          overflow: "hidden",
                          border: "1px solid #e9edf5",
                        }}
                      >
                        <div className="input-group-prepend">
                          <span className="input-group-text border-0 bg-white">
                            <i className="fas fa-search text-muted"></i>
                          </span>
                        </div>
                        <input
                          type="text"
                          className="form-control border-0"
                          placeholder="Search by name or email..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          style={{ height: "46px" }}
                        />
                      </div>
                    </div>

                    <div
                      className="border rounded-4 p-2"
                      style={{
                        maxHeight: "360px",
                        overflowY: "auto",
                        background: "#f8fafc",
                      }}
                    >
                      {filteredAvailableReviewers.length === 0 ? (
                        <div className="text-center py-4 text-muted">
                          No available reviewers found.
                        </div>
                      ) : (
                        filteredAvailableReviewers.map((reviewer) => (
                          <label
                            key={reviewer.uuid}
                            className="d-flex align-items-start p-3 mb-2 bg-white rounded-4 border"
                            style={{ cursor: "pointer" }}
                          >
                            <input
                              type="checkbox"
                              className="mt-1 mr-3"
                              checked={selectedReviewers.includes(reviewer.uuid)}
                              onChange={() => toggleReviewer(reviewer.uuid)}
                            />
                            <div>
                              <div className="font-weight-bold">{reviewer.full_name}</div>
                              <div className="text-muted small">{reviewer.email}</div>
                              <div className="text-primary small">
                                {reviewer.role_name || "Reviewer"}
                              </div>
                            </div>
                          </label>
                        ))
                      )}
                    </div>

                    <div className="mt-4">
                      <label className="font-weight-bold small text-muted">
                        Due Date
                      </label>
                      <input
                        type="date"
                        className="form-control rounded-pill"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                      />
                    </div>

                    <div className="mt-3">
                      <label className="font-weight-bold small text-muted">
                        Invitation Note
                      </label>
                      <textarea
                        className="form-control rounded-4"
                        rows="4"
                        placeholder="Write invitation note..."
                        value={invitationNote}
                        onChange={(e) => setInvitationNote(e.target.value)}
                      />
                    </div>

                    <button
                      className="btn btn-success btn-lg btn-block rounded-pill mt-4"
                      onClick={handleAssignReviewers}
                      disabled={assigning}
                    >
                      <i className="fas fa-user-plus mr-2"></i>
                      {assigning ? "Assigning..." : "Assign Selected Reviewers"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-lg-7 mb-4">
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                  <div className="card-header bg-white border-0 px-4 py-3">
                    <h3 className="mb-1 font-weight-bold" style={{ fontSize: "1.2rem" }}>
                      Current Assignments
                    </h3>
                    <div className="text-muted small">
                      Manage assignment status, resend invitation, or remove reviewer.
                    </div>
                  </div>

                  <div className="card-body">
                    {loading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary mb-3" role="status"></div>
                        <div className="text-muted">Loading assignments...</div>
                      </div>
                    ) : assignments.length === 0 ? (
                      <div className="text-center py-5">
                        <div
                          className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                          style={{
                            width: 80,
                            height: 80,
                            background: "rgba(13,110,253,0.10)",
                            color: "#0d6efd",
                          }}
                        >
                          <i className="fas fa-user-clock fa-2x"></i>
                        </div>
                        <h4 className="font-weight-bold">No assignments yet</h4>
                        <p className="text-muted mb-0">
                          Assigned reviewers will appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="row">
                        {assignments.map((assignment) => (
                          <div className="col-12 mb-3" key={assignment.assignment_id}>
                            <div className="border rounded-4 p-3 h-100 bg-light">
                              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3">
                                <div>
                                  <div className="font-weight-bold" style={{ fontSize: "1rem" }}>
                                    {assignment.reviewer_name || "-"}
                                  </div>
                                  <div className="text-muted small">
                                    {assignment.reviewer_email || "-"}
                                  </div>

                                  <div className="mt-3 small">
                                    <div className="mb-1">
                                      <strong>Status:</strong>{" "}
                                      <span className="text-success">
                                        {assignment.status || "-"}
                                      </span>
                                    </div>
                                    <div className="mb-1">
                                      <strong>Due Date:</strong>{" "}
                                      {assignment.due_date
                                        ? new Date(assignment.due_date).toLocaleDateString()
                                        : "-"}
                                    </div>
                                    <div className="mb-1">
                                      <strong>Assigned By:</strong>{" "}
                                      {assignment.assigned_by_name || "-"}
                                    </div>
                                    <div className="mb-1">
                                      <strong>Invitation Note:</strong>{" "}
                                      {assignment.invitation_note || "-"}
                                    </div>
                                    <div className="mb-1">
                                      <strong>Response Note:</strong>{" "}
                                      {assignment.response_note || "-"}
                                    </div>
                                  </div>
                                </div>

                                <div style={{ minWidth: "220px" }}>
                                  <select
                                    className="form-control rounded-pill mb-2"
                                    value={assignment.status || "assigned"}
                                    onChange={(e) =>
                                      handleStatusChange(
                                        assignment.assignment_id,
                                        e.target.value
                                      )
                                    }
                                    disabled={actionLoadingId === assignment.assignment_id}
                                  >
                                    <option value="assigned">assigned</option>
                                    <option value="accepted">accepted</option>
                                    <option value="declined">declined</option>
                                    <option value="submitted">submitted</option>
                                  </select>

                                  <button
                                    className="btn btn-warning btn-block rounded-pill mb-2"
                                    onClick={() =>
                                      handleResendInvitation(assignment.assignment_id)
                                    }
                                    disabled={actionLoadingId === assignment.assignment_id}
                                  >
                                    <i className="fas fa-paper-plane mr-2"></i>
                                    {actionLoadingId === assignment.assignment_id
                                      ? "Please wait..."
                                      : "Resend"}
                                  </button>

                                  <button
                                    className="btn btn-danger btn-block rounded-pill"
                                    onClick={() =>
                                      handleRemoveAssignment(assignment.assignment_id)
                                    }
                                    disabled={actionLoadingId === assignment.assignment_id}
                                  >
                                    <i className="fas fa-trash-alt mr-2"></i>
                                    {actionLoadingId === assignment.assignment_id
                                      ? "Please wait..."
                                      : "Remove"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {!loading && assignments.length > 0 && (
                    <div className="card-footer bg-white border-0 d-flex justify-content-between align-items-center px-4 py-3">
                      <div className="text-muted small">
                        Showing <strong>{assignments.length}</strong> assignment
                        {assignments.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

export default EbookEditorAssignReviewersPage;