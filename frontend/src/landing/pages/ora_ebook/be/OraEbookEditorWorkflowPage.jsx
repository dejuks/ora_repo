import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import MainLayout from "../../../../components/layout/MainLayout";

const API = process.env.REACT_APP_API_URL;

function OraEbookEditorWorkflowPage() {
  const { submissionId } = useParams();

  const [submission, setSubmission] = useState(null);
  const [reviewers, setReviewers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [showPanel, setShowPanel] = useState(false);
  const [panelMode, setPanelMode] = useState("assign"); // assign | update
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const [form, setForm] = useState({
    reviewer_ids: [],
    due_date: "",
    invitation_note: "",
    status: "assigned",
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      window.location.href = "/login";
      return;
    }

    loadData(token);
  }, [submissionId]);

  const loadData = async (token, searchText = "") => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API}/submissions/${submissionId}/reviewers`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { search: searchText },
        }
      );

      if (res.data.success) {
        setSubmission(res.data.data?.submission || null);
        setReviewers(Array.isArray(res.data.data?.reviewers) ? res.data.data.reviewers : []);
        setAssignments(
          Array.isArray(res.data.data?.assignments) ? res.data.data.assignments : []
        );
      } else {
        alert(res.data.message || "Failed to load workflow page data");
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to load workflow page data");
    } finally {
      setLoading(false);
    }
  };

  const filteredReviewers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return reviewers;

    return reviewers.filter((r) => {
      const name = (r.full_name || "").toLowerCase();
      const email = (r.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [reviewers, search]);

  const assignedReviewerIds = useMemo(() => {
    return new Set(assignments.map((a) => String(a.reviewer_id)));
  }, [assignments]);

  const stats = useMemo(() => {
    return {
      totalReviewers: reviewers.length,
      assigned: assignments.length,
      accepted: assignments.filter(
        (a) => (a.status || "").toLowerCase() === "accepted"
      ).length,
      completed: assignments.filter(
        (a) => (a.status || "").toLowerCase() === "completed"
      ).length,
    };
  }, [reviewers, assignments]);

  const openAssignPanel = () => {
    setPanelMode("assign");
    setSelectedAssignment(null);
    setForm({
      reviewer_ids: [],
      due_date: "",
      invitation_note: "",
      status: "assigned",
    });
    setShowPanel(true);
  };

  const openUpdatePanel = (assignment) => {
    setPanelMode("update");
    setSelectedAssignment(assignment);
    setForm({
      reviewer_ids: [],
      due_date: assignment?.due_date ? assignment.due_date.slice(0, 10) : "",
      invitation_note: assignment?.invitation_note || "",
      status: assignment?.status || "assigned",
    });
    setShowPanel(true);
  };

  const closePanel = () => {
    setShowPanel(false);
    setSelectedAssignment(null);
    setForm({
      reviewer_ids: [],
      due_date: "",
      invitation_note: "",
      status: "assigned",
    });
  };

  const toggleReviewer = (reviewerId) => {
    setForm((prev) => ({
      ...prev,
      reviewer_ids: prev.reviewer_ids.includes(reviewerId)
        ? prev.reviewer_ids.filter((id) => id !== reviewerId)
        : [...prev.reviewer_ids, reviewerId],
    }));
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();

    if (!Array.isArray(form.reviewer_ids) || form.reviewer_ids.length === 0) {
      alert("Please select at least one reviewer");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      setSaving(true);

      const response = await axios.post(
        `${API}/submissions/${submissionId}/reviewers`,
        {
          reviewer_ids: form.reviewer_ids,
          due_date: form.due_date || null,
          invitation_note: form.invitation_note || null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        alert("Reviewer(s) assigned successfully");
        closePanel();
        loadData(token, search);
      } else {
        alert(response.data.message || "Failed to assign reviewers");
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to assign reviewers");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAssignment?.assignment_id) {
      alert("Invalid assignment selected");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      setSaving(true);

      const response = await axios.patch(
        `${API}/submissions/${submissionId}/reviewers/${selectedAssignment.assignment_id}`,
        {
          status: form.status,
          due_date: form.due_date || null,
          invitation_note: form.invitation_note || null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        alert("Assignment updated successfully");
        closePanel();
        loadData(token, search);
      } else {
        alert(response.data.message || "Failed to update assignment");
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to update assignment");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this assignment?"
    );
    if (!confirmed) return;

    const token = localStorage.getItem("token");

    try {
      setSaving(true);

      const response = await axios.delete(
        `${API}/submissions/${submissionId}/reviewers/${assignmentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        alert("Assignment removed successfully");
        loadData(token, search);
      } else {
        alert(response.data.message || "Failed to remove assignment");
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to remove assignment");
    } finally {
      setSaving(false);
    }
  };

  const handleResendInvitation = async (assignmentId) => {
    const token = localStorage.getItem("token");

    try {
      setSaving(true);

      const response = await axios.post(
        `${API}/submissions/${submissionId}/reviewers/${assignmentId}/resend`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        alert("Invitation resent successfully");
        loadData(token, search);
      } else {
        alert(response.data.message || "Failed to resend invitation");
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to resend invitation");
    } finally {
      setSaving(false);
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
                  "linear-gradient(135deg, #0d6efd 0%, #4f46e5 55%, #7c3aed 100%)",
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
                      <i className="fas fa-project-diagram mr-2"></i>
                      <span className="font-weight-bold">Book Editor Workflow</span>
                    </div>

                    <h1 className="mb-2 font-weight-bold">
                      Reviewer Assignment Workflow
                    </h1>
                    <p className="mb-0" style={{ color: "rgba(255,255,255,0.88)" }}>
                      Assign reviewers, manage invitations, update statuses,
                      and track review progress.
                    </p>
                  </div>

                  <div className="text-md-right">
                    <Link
                      to="/ebook/dashboard/editor"
                      className="btn btn-light btn-lg shadow-sm rounded-pill px-4"
                    >
                      <i className="fas fa-arrow-left mr-2"></i>
                      Back to Dashboard
                    </Link>
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
                      <div className="h4 mb-0 font-weight-bold">
                        {stats.totalReviewers}
                      </div>
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
                        background: "rgba(124,58,237,0.12)",
                        color: "#7c3aed",
                      }}
                    >
                      <i className="fas fa-user-plus fa-lg"></i>
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
                        background: "rgba(25,135,84,0.12)",
                        color: "#198754",
                      }}
                    >
                      <i className="fas fa-check-circle fa-lg"></i>
                    </div>
                    <div>
                      <div className="text-muted small">Accepted</div>
                      <div className="h4 mb-0 font-weight-bold">{stats.accepted}</div>
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
                      <i className="fas fa-clipboard-check fa-lg"></i>
                    </div>
                    <div>
                      <div className="text-muted small">Completed</div>
                      <div className="h4 mb-0 font-weight-bold">{stats.completed}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {submission && (
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden mt-2">
                <div
                  className="card-header border-0 text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #4f46e5 100%)",
                    padding: "1.15rem 1.5rem",
                  }}
                >
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                    <div>
                      <h3 className="mb-1 font-weight-bold">
                        {submission.title || "Manuscript"}
                      </h3>
                      <div style={{ color: "rgba(255,255,255,0.85)" }}>
                        Submission ID: {submission.submission_id}
                      </div>
                    </div>

                    <div className="mt-3 mt-md-0">
                      <span
                        className="px-3 py-2 rounded-pill font-weight-bold"
                        style={{
                          background: "rgba(255,255,255,0.18)",
                          color: "#fff",
                          fontSize: "0.8rem",
                          display: "inline-block",
                        }}
                      >
                        {(submission.status || "submitted").toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3 mb-3">
                      <div className="text-muted small">Author</div>
                      <div className="font-weight-bold">
                        {submission.author_name || "-"}
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="text-muted small">Author Email</div>
                      <div className="font-weight-bold">
                        {submission.author_email || "-"}
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="text-muted small">Language</div>
                      <div className="font-weight-bold">
                        {submission.language || "-"}
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="text-muted small">Publication Year</div>
                      <div className="font-weight-bold">
                        {submission.publication_year || "-"}
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="text-muted small">Abstract</div>
                      <div className="mt-1">
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
                  <div
                    className="card-header border-0 bg-white d-flex justify-content-between align-items-center"
                    style={{ padding: "1.25rem 1.5rem" }}
                  >
                    <div>
                      <h3 className="card-title mb-1 font-weight-bold">
                        Available Reviewers
                      </h3>
                      <div className="text-muted small">
                        Select suitable reviewers for this manuscript
                      </div>
                    </div>

                    <button
                      className="btn btn-primary rounded-pill px-4"
                      onClick={openAssignPanel}
                    >
                      <i className="fas fa-user-plus mr-2"></i>
                      Assign
                    </button>
                  </div>

                  <div className="px-4 pb-3">
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
                        placeholder="Search reviewer by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ height: "46px" }}
                      />
                    </div>
                  </div>

                  <div className="card-body pt-0">
                    {loading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary mb-3" role="status"></div>
                        <div className="text-muted">Loading reviewers...</div>
                      </div>
                    ) : filteredReviewers.length === 0 ? (
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
                          <i className="fas fa-users fa-2x"></i>
                        </div>
                        <h5 className="font-weight-bold">No reviewers found</h5>
                        <p className="text-muted mb-0">
                          Try another search term or add reviewer accounts.
                        </p>
                      </div>
                    ) : (
                      <div style={{ maxHeight: 560, overflowY: "auto" }}>
                        {filteredReviewers.map((reviewer) => {
                          const alreadyAssigned = assignedReviewerIds.has(
                            String(reviewer.uuid)
                          );

                          return (
                            <div
                              key={reviewer.uuid}
                              className="border rounded-4 p-3 mb-3 shadow-sm"
                              style={{
                                background: alreadyAssigned ? "#f8fafc" : "#fff",
                                borderColor: "#edf2f7",
                              }}
                            >
                              <div className="d-flex justify-content-between align-items-start">
                                <div className="d-flex">
                                  <div
                                    className="rounded-circle d-flex align-items-center justify-content-center mr-3"
                                    style={{
                                      width: 48,
                                      height: 48,
                                      background:
                                        "linear-gradient(135deg, rgba(13,110,253,0.12), rgba(124,58,237,0.16))",
                                      color: "#4f46e5",
                                      flexShrink: 0,
                                    }}
                                  >
                                    <i className="fas fa-user"></i>
                                  </div>

                                  <div>
                                    <div className="font-weight-bold">
                                      {reviewer.full_name}
                                    </div>
                                    <div className="text-muted small">
                                      {reviewer.email}
                                    </div>
                                    <div className="text-muted small">
                                      {reviewer.role_name || "Reviewer"}
                                    </div>
                                  </div>
                                </div>

                                {alreadyAssigned && (
                                  <span
                                    className="px-3 py-2 rounded-pill font-weight-bold"
                                    style={{
                                      background: "rgba(255,193,7,0.16)",
                                      color: "#b58100",
                                      fontSize: "0.75rem",
                                    }}
                                  >
                                    Assigned
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-lg-7 mb-4">
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                  <div
                    className="card-header border-0 bg-white"
                    style={{ padding: "1.25rem 1.5rem" }}
                  >
                    <h3 className="card-title mb-1 font-weight-bold">
                      Assigned Reviewers
                    </h3>
                    <div className="text-muted small">
                      Manage assigned reviewers, statuses, due dates, and invitation notes
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
                            background: "rgba(124,58,237,0.10)",
                            color: "#7c3aed",
                          }}
                        >
                          <i className="fas fa-user-clock fa-2x"></i>
                        </div>
                        <h5 className="font-weight-bold">
                          No reviewer assignments yet
                        </h5>
                        <p className="text-muted mb-0">
                          Start by assigning one or more reviewers to this manuscript.
                        </p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                          <thead style={{ background: "#f8fafc" }}>
                            <tr>
                              <th className="border-0 py-3">Reviewer</th>
                              <th className="border-0 py-3">Status</th>
                              <th className="border-0 py-3">Due Date</th>
                              <th className="border-0 py-3">Assigned By</th>
                              <th className="border-0 py-3 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {assignments.map((assignment) => (
                              <tr key={assignment.assignment_id}>
                                <td className="py-3">
                                  <div className="font-weight-bold">
                                    {assignment.reviewer_name || "-"}
                                  </div>
                                  <div className="text-muted small">
                                    {assignment.reviewer_email || "-"}
                                  </div>
                                </td>
                                <td className="py-3">
                                  <span
                                    className="px-3 py-2 rounded-pill font-weight-bold"
                                    style={{
                                      background:
                                        (assignment.status || "").toLowerCase() ===
                                        "completed"
                                          ? "rgba(25,135,84,0.12)"
                                          : (assignment.status || "").toLowerCase() ===
                                            "accepted"
                                          ? "rgba(13,110,253,0.12)"
                                          : (assignment.status || "").toLowerCase() ===
                                            "declined"
                                          ? "rgba(220,53,69,0.12)"
                                          : "rgba(255,193,7,0.16)",
                                      color:
                                        (assignment.status || "").toLowerCase() ===
                                        "completed"
                                          ? "#198754"
                                          : (assignment.status || "").toLowerCase() ===
                                            "accepted"
                                          ? "#0d6efd"
                                          : (assignment.status || "").toLowerCase() ===
                                            "declined"
                                          ? "#dc3545"
                                          : "#b58100",
                                      fontSize: "0.75rem",
                                      display: "inline-block",
                                      textTransform: "uppercase",
                                    }}
                                  >
                                    {assignment.status || "assigned"}
                                  </span>
                                </td>
                                <td className="py-3">
                                  {assignment.due_date
                                    ? assignment.due_date.slice(0, 10)
                                    : "-"}
                                </td>
                                <td className="py-3">
                                  {assignment.assigned_by_name || "-"}
                                </td>
                                <td className="py-3 text-center">
                                  <div className="btn-group flex-wrap">
                                    <button
                                      className="btn btn-outline-primary btn-sm"
                                      onClick={() => openUpdatePanel(assignment)}
                                      title="Update Assignment"
                                    >
                                      <i className="fas fa-edit"></i>
                                    </button>

                                    <button
                                      className="btn btn-outline-warning btn-sm"
                                      onClick={() =>
                                        handleResendInvitation(assignment.assignment_id)
                                      }
                                      title="Resend Invitation"
                                      disabled={saving}
                                    >
                                      <i className="fas fa-paper-plane"></i>
                                    </button>

                                    <button
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() =>
                                        handleRemoveAssignment(assignment.assignment_id)
                                      }
                                      title="Remove Assignment"
                                      disabled={saving}
                                    >
                                      <i className="fas fa-trash"></i>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {showPanel && (
          <div
            onClick={closePanel}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15,23,42,0.45)",
              backdropFilter: "blur(3px)",
              zIndex: 1999,
            }}
          />
        )}

        <div
          className="position-fixed top-0 end-0 bg-white d-flex flex-column"
          style={{
            width: window.innerWidth < 768 ? "100%" : "620px",
            height: "100vh",
            zIndex: 2000,
            transform: showPanel ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.28s ease-in-out",
            boxShadow: "-10px 0 40px rgba(15,23,42,0.18)",
            borderTopLeftRadius: "1.5rem",
            borderBottomLeftRadius: "1.5rem",
            overflow: "hidden",
          }}
        >
          <div
            className="text-white px-4 py-4"
            style={{
              background:
                panelMode === "update"
                  ? "linear-gradient(135deg, #0ea5e9 0%, #2563eb 55%, #4f46e5 100%)"
                  : "linear-gradient(135deg, #0d6efd 0%, #4f46e5 55%, #7c3aed 100%)",
            }}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div
                  className="d-inline-flex align-items-center px-3 py-2 rounded-pill mb-3"
                  style={{ background: "rgba(255,255,255,0.16)" }}
                >
                  <i
                    className={`fas ${
                      panelMode === "update" ? "fa-edit" : "fa-user-plus"
                    } mr-2`}
                  ></i>
                  <span className="font-weight-bold">
                    {panelMode === "update"
                      ? "Update Reviewer Assignment"
                      : "Assign Reviewers"}
                  </span>
                </div>

                <h4 className="mb-1 font-weight-bold">
                  {panelMode === "update"
                    ? selectedAssignment?.reviewer_name || "Assignment Details"
                    : "Select Reviewers and Send Invitation"}
                </h4>

                <div style={{ color: "rgba(255,255,255,0.86)" }}>
                  {submission?.title || "Selected manuscript"}
                </div>
              </div>

              <button
                onClick={closePanel}
                className="btn btn-light rounded-circle shadow-sm"
                style={{
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                }}
                title="Close"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          <div
            className="flex-grow-1"
            style={{
              overflowY: "auto",
              background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
            }}
          >
            {panelMode === "assign" ? (
              <form onSubmit={handleAssignSubmit} className="p-4">
                <div className="card border-0 shadow-sm rounded-4 mb-4">
                  <div className="card-body p-4">
                    <h5 className="font-weight-bold mb-3">Select Reviewers</h5>

                    <div style={{ maxHeight: 280, overflowY: "auto" }}>
                      {filteredReviewers.length === 0 ? (
                        <div className="text-muted">No reviewers available</div>
                      ) : (
                        filteredReviewers.map((reviewer) => {
                          const alreadyAssigned = assignedReviewerIds.has(
                            String(reviewer.uuid)
                          );

                          return (
                            <label
                              key={reviewer.uuid}
                              className="d-flex align-items-start border rounded-4 p-3 mb-3"
                              style={{
                                cursor: alreadyAssigned ? "not-allowed" : "pointer",
                                background: alreadyAssigned ? "#f8fafc" : "#fff",
                                opacity: alreadyAssigned ? 0.7 : 1,
                                borderColor: "#edf2f7",
                              }}
                            >
                              <input
                                type="checkbox"
                                className="mt-1 mr-3"
                                checked={form.reviewer_ids.includes(reviewer.uuid)}
                                onChange={() => toggleReviewer(reviewer.uuid)}
                                disabled={alreadyAssigned}
                              />
                              <div>
                                <div className="font-weight-bold">
                                  {reviewer.full_name}
                                </div>
                                <div className="text-muted small">
                                  {reviewer.email}
                                </div>
                                <div className="text-muted small">
                                  {reviewer.role_name || "Reviewer"}
                                </div>
                                {alreadyAssigned && (
                                  <div className="small mt-1" style={{ color: "#b58100" }}>
                                    Already assigned
                                  </div>
                                )}
                              </div>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                <div className="card border-0 shadow-sm rounded-4 mb-4">
                  <div className="card-body p-4">
                    <h5 className="font-weight-bold mb-3">Invitation Details</h5>

                    <div className="form-group mb-3">
                      <label className="font-weight-bold text-muted small">
                        DUE DATE
                      </label>
                      <input
                        type="date"
                        name="due_date"
                        value={form.due_date}
                        onChange={handleChange}
                        className="form-control border-0 shadow-sm rounded-pill"
                        style={{ height: "50px", background: "#f8fafc" }}
                      />
                    </div>

                    <div className="form-group mb-0">
                      <label className="font-weight-bold text-muted small">
                        INVITATION NOTE
                      </label>
                      <textarea
                        name="invitation_note"
                        value={form.invitation_note}
                        onChange={handleChange}
                        placeholder="Enter invitation note for selected reviewers..."
                        className="form-control border-0 shadow-sm rounded-4"
                        rows="6"
                        style={{ background: "#f8fafc", resize: "none" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center pb-4">
                  <button
                    type="button"
                    onClick={closePanel}
                    className="btn btn-outline-secondary rounded-pill px-4"
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn rounded-pill px-4 text-white"
                    disabled={saving}
                    style={{
                      background:
                        "linear-gradient(135deg, #0d6efd 0%, #4f46e5 60%, #7c3aed 100%)",
                      border: "none",
                      minWidth: "220px",
                    }}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm mr-2"></span>
                        Assigning...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus mr-2"></i>
                        Assign Reviewer(s)
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleUpdateSubmit} className="p-4">
                <div className="card border-0 shadow-sm rounded-4 mb-4">
                  <div className="card-body p-4">
                    <h5 className="font-weight-bold mb-3">Assignment Details</h5>

                    <div className="mb-3">
                      <div className="text-muted small">Reviewer</div>
                      <div className="font-weight-bold">
                        {selectedAssignment?.reviewer_name || "-"}
                      </div>
                      <div className="text-muted small">
                        {selectedAssignment?.reviewer_email || "-"}
                      </div>
                    </div>

                    <div className="form-group mb-3">
                      <label className="font-weight-bold text-muted small">
                        STATUS
                      </label>
                      <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="form-control border-0 shadow-sm rounded-pill"
                        style={{ height: "50px", background: "#f8fafc" }}
                      >
                        <option value="assigned">Assigned</option>
                        <option value="accepted">Accepted</option>
                        <option value="declined">Declined</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    <div className="form-group mb-3">
                      <label className="font-weight-bold text-muted small">
                        DUE DATE
                      </label>
                      <input
                        type="date"
                        name="due_date"
                        value={form.due_date}
                        onChange={handleChange}
                        className="form-control border-0 shadow-sm rounded-pill"
                        style={{ height: "50px", background: "#f8fafc" }}
                      />
                    </div>

                    <div className="form-group mb-0">
                      <label className="font-weight-bold text-muted small">
                        INVITATION NOTE
                      </label>
                      <textarea
                        name="invitation_note"
                        value={form.invitation_note}
                        onChange={handleChange}
                        placeholder="Update invitation note..."
                        className="form-control border-0 shadow-sm rounded-4"
                        rows="6"
                        style={{ background: "#f8fafc", resize: "none" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center pb-4">
                  <button
                    type="button"
                    onClick={closePanel}
                    className="btn btn-outline-secondary rounded-pill px-4"
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn rounded-pill px-4 text-white"
                    disabled={saving}
                    style={{
                      background:
                        "linear-gradient(135deg, #0ea5e9 0%, #2563eb 60%, #4f46e5 100%)",
                      border: "none",
                      minWidth: "220px",
                    }}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm mr-2"></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save mr-2"></i>
                        Update Assignment
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default OraEbookEditorWorkflowPage;