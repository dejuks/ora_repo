import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import MainLayout from "../../../../components/layout/MainLayout";

const API = process.env.REACT_APP_API_URL;

function OraEbookEditorScreenedPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
      const screenedOnly = rows.filter(
        (m) => (m.status || "").toLowerCase() === "screened"
      );

      setList(screenedOnly);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Failed to load screened manuscripts");
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
      screened: list.length,
      english: list.filter((m) => (m.language || "").toLowerCase() === "english").length,
      thisYear: list.filter(
        (m) => String(m.publication_year || "") === String(new Date().getFullYear())
      ).length,
    };
  }, [list]);

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
                      <i className="fas fa-check-double mr-2"></i>
                      <span className="font-weight-bold">Book Editor Workspace</span>
                    </div>

                    <h1 className="mb-2 font-weight-bold">Screened Manuscripts</h1>
                    <p className="mb-0" style={{ color: "rgba(255,255,255,0.88)" }}>
                      View manuscripts that passed editorial screening and are ready
                      for reviewer assignment or next editorial action.
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
                        background: "rgba(25,135,84,0.12)",
                        color: "#198754",
                      }}
                    >
                      <i className="fas fa-check-circle fa-lg"></i>
                    </div>
                    <div>
                      <div className="text-muted small">Screened Queue</div>
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
                        background: "rgba(25,135,84,0.12)",
                        color: "#198754",
                      }}
                    >
                      <i className="fas fa-clipboard-check fa-lg"></i>
                    </div>
                    <div>
                      <div className="text-muted small">Screened</div>
                      <div className="h4 mb-0 font-weight-bold">{stats.screened}</div>
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
                        background: "rgba(13,110,253,0.12)",
                        color: "#0d6efd",
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
                    Screened Manuscripts Only
                  </h3>
                  <div className="text-muted small">
                    These manuscripts are ready for reviewer assignment or further editorial processing.
                  </div>
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
                    <div className="text-muted">Loading screened manuscripts...</div>
                  </div>
                ) : filteredList.length === 0 ? (
                  <div className="text-center py-5">
                    <div
                      className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                      style={{
                        width: 80,
                        height: 80,
                        background: "rgba(25,135,84,0.10)",
                        color: "#198754",
                      }}
                    >
                      <i className="fas fa-check-double fa-2x"></i>
                    </div>
                    <h4 className="font-weight-bold">No screened manuscripts found</h4>
                    <p className="text-muted mb-0">
                      Once manuscripts pass editorial screening, they will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover table-striped table-bordered align-middle mb-0">
                      <thead style={{ background: "#f8fafc" }}>
                        <tr>
                          <th className="border-0 px-4 py-3">Manuscript</th>
                          <th className="border-0 py-3">ISBN</th>
                          <th className="border-0 py-3">Language</th>
                          <th className="border-0 py-3">Year</th>
                          <th className="border-0 py-3">Status</th>
                          <th className="border-0 py-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredList.map((m) => (
                          <tr key={m.id || m.manuscript_id || m.submission_id}>
                            <td className="px-4 py-3">
                              <div className="d-flex align-items-start">
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center mr-3"
                                  style={{
                                    width: 44,
                                    height: 44,
                                    background: "linear-gradient(135deg, #198754, #20c997)",
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

                            <td className="py-3">{m.isbn || "-"}</td>
                            <td className="py-3">{m.language || "-"}</td>
                            <td className="py-3">{m.publication_year || "-"}</td>

                            <td className="py-3">
                              <span
                                className="px-3 py-2 rounded-pill font-weight-bold"
                                style={{
                                  background: "rgba(25,135,84,0.12)",
                                  color: "#198754",
                                  fontSize: "0.75rem",
                                  display: "inline-block",
                                }}
                              >
                                SCREENED
                              </span>
                            </td>

                            <td className="py-3 text-center">
                              <div className="btn-group flex-wrap">
                                <a
                                  href={`/ebook/manuscripts/show/${m.id || m.manuscript_id || m.submission_id}`}
                                  className="btn btn-outline-primary btn-sm"
                                  title="View Details"
                                >
                                  <i className="fas fa-eye"></i>
                                </a>

                                <a
                                  href={`/ebook/editor/assign-reviewers/${m.id || m.manuscript_id || m.submission_id}`}
                                  className="btn btn-outline-success btn-sm"
                                  title="Assign Reviewers"
                                >
                                  <i className="fas fa-user-plus"></i>
                                </a>

                                {/* <a
                                  href={`/ebook/editor/workflow/${m.id || m.manuscript_id || m.submission_id}`}
                                  className="btn btn-outline-dark btn-sm"
                                  title="Workflow"
                                >
                                  <i className="fas fa-project-diagram"></i>
                                </a> */}
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
                    Showing <strong>{filteredList.length}</strong> screened manuscript
                    {filteredList.length !== 1 ? "s" : ""}
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

export default OraEbookEditorScreenedPage;