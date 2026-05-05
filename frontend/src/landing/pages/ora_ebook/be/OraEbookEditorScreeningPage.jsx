import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import MainLayout from "../../../../components/layout/MainLayout";

const API = process.env.REACT_APP_API_URL;

function OraEbookEditorScreeningPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [screeningForm, setScreeningForm] = useState({
    relevance_score: "",
    scope_match: "high",
    quality_score: "",
    comments: "",
    recommended_action: "accept_for_peer_review",
  });

  const BASE = `${API}/ebook/manuscripts`;

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
      });

      const rows = Array.isArray(res.data) ? res.data : [];
      // Filter only submitted manuscripts for screening
      const submittedOnly = rows.filter(
        (m) => (m.status || "").toLowerCase() === "submitted"
      );

      setList(submittedOnly);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Failed to load submitted manuscripts");
    } finally {
      setLoading(false);
    }
  };

  const filteredList = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return list;

    return list.filter((m) => {
      const title = (m.title || "").toLowerCase();
      const isbn = (m.isbn || "").toLowerCase();
      const lang = (m.language || "").toLowerCase();
      const year = String(m.publication_year || "");
      return (
        title.includes(q) ||
        isbn.includes(q) ||
        lang.includes(q) ||
        year.includes(q)
      );
    });
  }, [list, search]);

  const stats = useMemo(() => {
    return {
      total: list.length,
      submitted: list.length,
      english: list.filter((m) => (m.language || "").toLowerCase() === "english").length,
      thisYear: list.filter(
        (m) => String(m.publication_year || "") === String(new Date().getFullYear())
      ).length,
    };
  }, [list]);

  const openScreeningPanel = (manuscript, action = "accept_for_peer_review") => {
    setSelected(manuscript);
    setScreeningForm({
      relevance_score: "",
      scope_match: "high",
      quality_score: "",
      comments: "",
      recommended_action: action,
    });
    setShowPanel(true);
  };

  const closePanel = () => {
    setShowPanel(false);
    setSelected(null);
    setScreeningForm({
      relevance_score: "",
      scope_match: "high",
      quality_score: "",
      comments: "",
      recommended_action: "accept_for_peer_review",
    });
  };

  const handleChange = (e) => {
    setScreeningForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmitScreening = async (e) => {
    e.preventDefault();

    const manuscriptId = selected?.id;

    if (!manuscriptId) {
      alert("Invalid manuscript id");
      return;
    }

    // Validate scores
    if (!screeningForm.relevance_score || !screeningForm.quality_score) {
      alert("Please provide both relevance and quality scores");
      return;
    }

    if (screeningForm.relevance_score < 1 || screeningForm.relevance_score > 10) {
      alert("Relevance score must be between 1 and 10");
      return;
    }

    if (screeningForm.quality_score < 1 || screeningForm.quality_score > 10) {
      alert("Quality score must be between 1 and 10");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      setSubmitting(true);

      // FIXED: Changed from /oraebookscreening to /screen
      const response = await axios.post(
        `${BASE}/${manuscriptId}/screen`,
        {
          relevance_score: parseInt(screeningForm.relevance_score),
          scope_match: screeningForm.scope_match,
          quality_score: parseInt(screeningForm.quality_score),
          comments: screeningForm.comments,
          recommended_action: screeningForm.recommended_action,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        alert("Screening submitted successfully");
        closePanel();
        loadData(token);
      } else {
        alert(response.data.error || "Failed to submit screening");
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Failed to submit screening");
    } finally {
      setSubmitting(false);
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
                      <i className="fas fa-user-check mr-2"></i>
                      <span className="font-weight-bold">Book Editor Workspace</span>
                    </div>

                    <h1 className="mb-2 font-weight-bold">Initial Editorial Screening</h1>
                    <p className="mb-0" style={{ color: "rgba(255,255,255,0.88)" }}>
                      Review submitted manuscripts for relevance, scope, and quality
                      before peer review assignment.
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
                      <i className="fas fa-paper-plane fa-lg"></i>
                    </div>
                    <div>
                      <div className="text-muted small">Submitted</div>
                      <div className="h4 mb-0 font-weight-bold">{stats.submitted}</div>
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
                      <i className="fas fa-language fa-lg"></i>
                    </div>
                    <div>
                      <div className="text-muted small">English</div>
                      <div className="h4 mb-0 font-weight-bold">{stats.english}</div>
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
                      <i className="fas fa-calendar-alt fa-lg"></i>
                    </div>
                    <div>
                      <div className="text-muted small">This Year</div>
                      <div className="h4 mb-0 font-weight-bold">{stats.thisYear}</div>
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
                className="card-header border-0 bg-white d-flex flex-column flex-md-row justify-content-between align-items-md-center"
                style={{ padding: "1.25rem 1.5rem" }}
              >
                <div>
                  <h3
                    className="card-title mb-1 font-weight-bold"
                    style={{ fontSize: "1.2rem" }}
                  >
                    Submitted Manuscripts
                  </h3>
                  
                </div>

                <div className="mt-3 mt-md-0" style={{ minWidth: "320px" }}>
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
                      placeholder="Search by title, ISBN, language, year..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ height: "46px" }}
                    />
                  </div>
                </div>
              </div>

              <div className="card-body p-0">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary mb-3" role="status"></div>
                    <div className="text-muted">Loading submitted manuscripts...</div>
                  </div>
                ) : filteredList.length === 0 ? (
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
                      <i className="fas fa-clipboard-check fa-2x"></i>
                    </div>
                    <h4 className="font-weight-bold">No submitted manuscripts found</h4>
                    <p className="text-muted mb-0">
                      Once authors submit manuscripts, they will appear here for editorial screening.
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover table-striped table-bordered align-middle mb-0">
                      <thead style={{ background: "#f8fafc" }}>
                        <tr>
                          <th className="border-0 px-4 py-3">Manuscript</th>
                          {/* <th className="border-0 py-3">ISBN</th> */}
                          <th className="border-0 py-3">Language</th>
                          <th className="border-0 py-3">Year</th>
                          <th className="border-0 py-3">Status</th>
                          <th className="border-0 py-3 text-center">Screening Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredList.map((m) => (
                          <tr key={m.id}>
                            <td className="px-4 py-3">
                              <div className="d-flex align-items-start">
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center mr-3"
                                  style={{
                                    width: 44,
                                    height: 44,
                                    background: "linear-gradient(135deg, #0d6efd, #7c3aed)",
                                    color: "#fff",
                                    flexShrink: 0,
                                  }}
                                >
                                  <i className="fas fa-book"></i>
                                </div>
                                <div>
                                  <div className="font-weight-bold" style={{ fontSize: "1rem" }}>
                                    {m.title}
                                  </div>
                                  <div
                                    className="text-muted small text-truncate"
                                    style={{ maxWidth: "320px" }}
                                  >
                                    {m.abstract || "No abstract provided"}
                                  </div>
                                </div>
                              </div>
                             </td>
                            {/* <td className="py-3">{m.isbn || "-"}</td> */}
                            <td className="py-3">{m.language || "-"}</td>
                            <td className="py-3">{m.publication_year || "-"}</td>
                            <td className="py-3">
                              <span
                                className="px-3 py-2 rounded-pill font-weight-bold"
                                style={{
                                  background: "rgba(13,110,253,0.12)",
                                  color: "#0d6efd",
                                  fontSize: "0.75rem",
                                  display: "inline-block",
                                }}
                              >
                                SUBMITTED
                              </span>
                            </td>
                            <td className="py-3 text-center">
                              <div className="btn-group flex-wrap">
                                <a
                                  href={`/ora/ebook/editor/screening/show/${m.id}`}
                                  className="btn btn-outline-primary btn-sm"
                                  title="View Details"
                                >
                                  <i className="fas fa-eye"></i>
                                </a>

                                <button
                                  className="btn btn-outline-success btn-sm"
                                  onClick={() =>
                                    openScreeningPanel(m, "accept_for_peer_review")
                                  }
                                  title="Accept for Peer Review"
                                >
                                  <i className="fas fa-check"></i>
                                </button>

                                <button
                                  className="btn btn-outline-warning btn-sm"
                                  onClick={() =>
                                    openScreeningPanel(m, "return_for_corrections")
                                  }
                                  title="Return for Corrections"
                                >
                                  <i className="fas fa-undo"></i>
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

              {!loading && filteredList.length > 0 && (
                <div className="card-footer bg-white border-0 d-flex justify-content-between align-items-center px-4 py-3">
                  <div className="text-muted small">
                    Showing <strong>{filteredList.length}</strong> submitted manuscript
                    {filteredList.length !== 1 ? "s" : ""}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Screening Panel Modal */}
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
            width: window.innerWidth < 768 ? "100%" : "560px",
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
                "linear-gradient(135deg, #0d6efd 0%, #4f46e5 55%, #7c3aed 100%)",
            }}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div
                  className="d-inline-flex align-items-center px-3 py-2 rounded-pill mb-3"
                  style={{ background: "rgba(255,255,255,0.16)" }}
                >
                  <i className="fas fa-tasks mr-2"></i>
                  <span className="font-weight-bold">Editorial Screening</span>
                </div>

                <h4 className="mb-1 font-weight-bold">
                  {screeningForm.recommended_action === "return_for_corrections"
                    ? "Return for Corrections"
                    : "Accept for Peer Review"}
                </h4>

                <div style={{ color: "rgba(255,255,255,0.86)" }}>
                  {selected?.title || "Selected manuscript"}
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
            <form onSubmit={handleSubmitScreening} className="p-4">
              <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-4">
                  <h5 className="font-weight-bold mb-3">Screening Assessment</h5>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group mb-3">
                        <label className="font-weight-bold text-muted small">
                          RELEVANCE SCORE (1-10)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          name="relevance_score"
                          value={screeningForm.relevance_score}
                          onChange={handleChange}
                          placeholder="1 - 10"
                          className="form-control border-0 shadow-sm rounded-pill"
                          style={{ height: "50px", background: "#f8fafc" }}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group mb-3">
                        <label className="font-weight-bold text-muted small">
                          QUALITY SCORE (1-10)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          name="quality_score"
                          value={screeningForm.quality_score}
                          onChange={handleChange}
                          placeholder="1 - 10"
                          className="form-control border-0 shadow-sm rounded-pill"
                          style={{ height: "50px", background: "#f8fafc" }}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="form-group mb-3">
                        <label className="font-weight-bold text-muted small">
                          SCOPE MATCH
                        </label>
                        <select
                          name="scope_match"
                          value={screeningForm.scope_match}
                          onChange={handleChange}
                          className="form-control border-0 shadow-sm rounded-pill"
                          style={{ height: "50px", background: "#f8fafc" }}
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="form-group mb-0">
                        <label className="font-weight-bold text-muted small">
                          EDITOR COMMENTS
                        </label>
                        <textarea
                          name="comments"
                          value={screeningForm.comments}
                          onChange={handleChange}
                          placeholder="Enter editorial screening comments..."
                          className="form-control border-0 shadow-sm rounded-4"
                          rows="6"
                          style={{ background: "#f8fafc", resize: "none" }}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-4">
                  <h5 className="font-weight-bold mb-3">Recommendation</h5>

                  <div className="row">
                    <div className="col-md-12">
                      <div className="form-group mb-0">
                        <label className="font-weight-bold text-muted small">
                          RECOMMENDED ACTION
                        </label>
                        <select
                          name="recommended_action"
                          value={screeningForm.recommended_action}
                          onChange={handleChange}
                          className="form-control border-0 shadow-sm rounded-pill"
                          style={{ height: "50px", background: "#f8fafc" }}
                        >
                          <option value="accept_for_peer_review">
                            Accept for Peer Review
                          </option>
                          <option value="return_for_corrections">
                            Return for Corrections
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center pb-4">
                <button
                  type="button"
                  onClick={closePanel}
                  className="btn btn-outline-secondary rounded-pill px-4"
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn rounded-pill px-4 text-white"
                  disabled={submitting}
                  style={{
                    background:
                      screeningForm.recommended_action === "return_for_corrections"
                        ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                        : "linear-gradient(135deg, #0d6efd 0%, #4f46e5 60%, #7c3aed 100%)",
                    border: "none",
                    minWidth: "210px",
                  }}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm mr-2"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i
                        className={`fas ${
                          screeningForm.recommended_action === "return_for_corrections"
                            ? "fa-undo"
                            : "fa-check"
                        } mr-2`}
                      ></i>
                      {screeningForm.recommended_action === "return_for_corrections"
                        ? "Return for Corrections"
                        : "Accept for Peer Review"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default OraEbookEditorScreeningPage;