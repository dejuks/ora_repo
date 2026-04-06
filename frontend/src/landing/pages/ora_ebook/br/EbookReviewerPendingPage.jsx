import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import MainLayout from "../../../../components/layout/MainLayout";

const API = process.env.REACT_APP_API_URL;

function EbookReviewerPendingPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [responseNote, setResponseNote] = useState({});

  const BASE = `${API}/oraebook/reviewer/pending`;

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      window.location.href = "/login";
      return;
    }

    loadData(token);
  }, []);

  const loadData = async (token) => {
    try {
      setLoading(true);

      const res = await axios.get(BASE, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search: search || "",
          status: status || "",
        },
      });

      setRows(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to load pending assignments");
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = useMemo(() => {
    return rows;
  }, [rows]);

  const stats = useMemo(() => {
    return {
      total: rows.length,
      assigned: rows.filter((r) => (r.status || "").toLowerCase() === "assigned").length,
      accepted: rows.filter((r) => (r.status || "").toLowerCase() === "accepted").length,
      dueSoon: rows.filter((r) => {
        if (!r.due_date) return false;
        const today = new Date();
        const due = new Date(r.due_date);
        const diff = (due - today) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 7;
      }).length,
    };
  }, [rows]);

  const handleSearch = () => {
    const token = localStorage.getItem("token");
    loadData(token);
  };

  const handleRespond = async (assignmentId, action) => {
    const token = localStorage.getItem("token");

    try {
      setActionLoadingId(assignmentId);

      await axios.post(
        `${BASE}/${assignmentId}/respond`,
        {
          action,
          response_note: responseNote[assignmentId] || "",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(`Assignment ${action} successfully`);
      loadData(token);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to respond to assignment");
    } finally {
      setActionLoadingId("");
    }
  };

  const setNote = (assignmentId, value) => {
    setResponseNote((prev) => ({
      ...prev,
      [assignmentId]: value,
    }));
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
                      <i className="fas fa-user-clock mr-2"></i>
                      <span className="font-weight-bold">Reviewer Workspace</span>
                    </div>

                    <h1 className="mb-2 font-weight-bold">Pending Review Assignments</h1>
                    <p className="mb-0" style={{ color: "rgba(255,255,255,0.88)" }}>
                      View your pending review requests, accept or decline invitations,
                      and continue to manuscript review.
                    </p>
                  </div>

                  <div className="text-md-right">
                    <a
                      href="/ebook/dashboard/reviewer"
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
                      <i className="fas fa-inbox fa-lg"></i>
                    </div>
                    <div>
                      <div className="text-muted small">Total Pending</div>
                      <div className="h4 mb-0 font-weight-bold">{stats.total}</div>
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
                      <i className="fas fa-envelope-open-text fa-lg"></i>
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
                        background: "rgba(220,53,69,0.12)",
                        color: "#dc3545",
                      }}
                    >
                      <i className="fas fa-clock fa-lg"></i>
                    </div>
                    <div>
                      <div className="text-muted small">Due in 7 Days</div>
                      <div className="h4 mb-0 font-weight-bold">{stats.dueSoon}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="content pt-2">
          <div className="container-fluid">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div
                className="card-header border-0 bg-white"
                style={{ padding: "1.25rem 1.5rem" }}
              >
                <div className="row">
                  <div className="col-md-6 mb-2">
                    <h3
                      className="card-title mb-1 font-weight-bold"
                      style={{ fontSize: "1.2rem" }}
                    >
                      My Pending Assignments
                    </h3>
                    <div className="text-muted small">
                      Review invitations waiting for your action or review work.
                    </div>
                  </div>

                  <div className="col-md-4 mb-2">
                    <input
                      type="text"
                      className="form-control rounded-pill"
                      placeholder="Search title, author, category..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  <div className="col-md-2 mb-2">
                    <select
                      className="form-control rounded-pill"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="">All</option>
                      <option value="assigned">Assigned</option>
                      <option value="accepted">Accepted</option>
                    </select>
                  </div>

                  <div className="col-12 mt-2">
                    <button
                      className="btn btn-primary rounded-pill px-4"
                      onClick={handleSearch}
                    >
                      <i className="fas fa-search mr-2"></i>
                      Search
                    </button>
                  </div>
                </div>
              </div>

              <div className="card-body">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary mb-3" role="status"></div>
                    <div className="text-muted">Loading pending assignments...</div>
                  </div>
                ) : filteredRows.length === 0 ? (
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
                      <i className="fas fa-folder-open fa-2x"></i>
                    </div>
                    <h4 className="font-weight-bold">No pending assignments found</h4>
                    <p className="text-muted mb-0">
                      Your pending manuscript review invitations will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="row">
                    {filteredRows.map((item) => (
                      <div className="col-12 mb-4" key={item.assignment_id}>
                        <div className="card border-0 shadow-sm rounded-4 h-100">
                          <div className="card-body">
                            <div className="d-flex flex-column flex-lg-row justify-content-between gap-4">
                              <div style={{ flex: 1 }}>
                                <div className="d-flex align-items-center mb-3">
                                  <div
                                    className="rounded-circle d-flex align-items-center justify-content-center mr-3"
                                    style={{
                                      width: 48,
                                      height: 48,
                                      background:
                                        item.status === "accepted"
                                          ? "rgba(25,135,84,0.12)"
                                          : "rgba(255,193,7,0.16)",
                                      color:
                                        item.status === "accepted" ? "#198754" : "#b58100",
                                    }}
                                  >
                                    <i className="fas fa-book-open"></i>
                                  </div>

                                  <div>
                                    <div className="font-weight-bold" style={{ fontSize: "1.05rem" }}>
                                      {item.title || "-"}
                                    </div>
                                    <div className="text-muted small">
                                      {item.subtitle || "No subtitle"}
                                    </div>
                                  </div>
                                </div>

                                <div className="row small mb-3">
                                  <div className="col-md-4 mb-2">
                                    <strong>Status:</strong>{" "}
                                    <span
                                      className={`badge ${
                                        item.status === "accepted"
                                          ? "badge-success"
                                          : "badge-warning"
                                      }`}
                                    >
                                      {item.status}
                                    </span>
                                  </div>

                                  <div className="col-md-4 mb-2">
                                    <strong>Author:</strong> {item.author_name || "-"}
                                  </div>

                                  <div className="col-md-4 mb-2">
                                    <strong>Language:</strong> {item.language || "-"}
                                  </div>

                                  <div className="col-md-4 mb-2">
                                    <strong>Category:</strong> {item.category || "-"}
                                  </div>

                                  <div className="col-md-4 mb-2">
                                    <strong>Year:</strong> {item.publication_year || "-"}
                                  </div>

                                  <div className="col-md-4 mb-2">
                                    <strong>Due Date:</strong>{" "}
                                    {item.due_date
                                      ? new Date(item.due_date).toLocaleDateString()
                                      : "-"}
                                  </div>
                                </div>

                                <div className="mb-3">
                                  <strong className="small text-muted d-block mb-1">
                                    Invitation Note
                                  </strong>
                                  <div
                                    className="border rounded-3 p-3"
                                    style={{ background: "#f8fafc" }}
                                  >
                                    {item.invitation_note || "No invitation note provided"}
                                  </div>
                                </div>

                                <div className="mb-3">
                                  <strong className="small text-muted d-block mb-1">
                                    Manuscript Abstract
                                  </strong>
                                  <div
                                    className="border rounded-3 p-3"
                                    style={{ background: "#f8fafc" }}
                                  >
                                    {item.abstract || "No abstract provided"}
                                  </div>
                                </div>
                              </div>

                              <div style={{ width: "100%", maxWidth: "340px" }}>
                                <div className="mb-3">
                                  <label className="small font-weight-bold text-muted">
                                    Response Note
                                  </label>
                                  <textarea
                                    className="form-control rounded-4"
                                    rows="5"
                                    placeholder="Write your note..."
                                    value={responseNote[item.assignment_id] || ""}
                                    onChange={(e) =>
                                      setNote(item.assignment_id, e.target.value)
                                    }
                                  />
                                </div>

                                <div className="d-flex flex-column gap-2">
                                  {item.status === "assigned" && (
                                    <>
                                      <button
                                        className="btn btn-success btn-block rounded-pill mb-2"
                                        disabled={actionLoadingId === item.assignment_id}
                                        onClick={() =>
                                          handleRespond(item.assignment_id, "accepted")
                                        }
                                      >
                                        <i className="fas fa-check mr-2"></i>
                                        {actionLoadingId === item.assignment_id
                                          ? "Please wait..."
                                          : "Accept Assignment"}
                                      </button>

                                      <button
                                        className="btn btn-danger btn-block rounded-pill mb-2"
                                        disabled={actionLoadingId === item.assignment_id}
                                        onClick={() =>
                                          handleRespond(item.assignment_id, "declined")
                                        }
                                      >
                                        <i className="fas fa-times mr-2"></i>
                                        {actionLoadingId === item.assignment_id
                                          ? "Please wait..."
                                          : "Decline Assignment"}
                                      </button>
                                    </>
                                  )}

                                  <a
                                    href={`/ebook/manuscripts/show/${item.manuscript_id || item.submission_id}`}
                                    className="btn btn-outline-primary btn-block rounded-pill mb-2"
                                  >
                                    <i className="fas fa-eye mr-2"></i>
                                    View Manuscript
                                  </a>

                                  {item.status === "accepted" && (
                                    <a
                                      href={`/ebook/reviewer/submit-review/${item.assignment_id}`}
                                      className="btn btn-primary btn-block rounded-pill"
                                    >
                                      <i className="fas fa-file-signature mr-2"></i>
                                      Submit Review
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {!loading && filteredRows.length > 0 && (
                <div className="card-footer bg-white border-0 d-flex justify-content-between align-items-center px-4 py-3">
                  <div className="text-muted small">
                    Showing <strong>{filteredRows.length}</strong> pending assignment
                    {filteredRows.length !== 1 ? "s" : ""}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

export default EbookReviewerPendingPage;