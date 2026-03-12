// src/ebook/pages/AuthorDrafts.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listMyEbooks, deleteEbook } from "../../api/ebooks.js";
import MainLayout from "../../components/layout/MainLayout.jsx";

export default function AuthorDrafts() {
  const nav = useNavigate();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sortBy, setSortBy] = useState("updated_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");

  const loadDrafts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listMyEbooks();
      if (!res.success) {
        setError(res.message || "Failed to load drafts");
      } else {
        const draftManuscripts = (res.data || []).filter((ebook) => ebook.status === "DRAFT");
        setDrafts(draftManuscripts);
      }
    } catch (e) {
      console.error("Error loading drafts:", e);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrafts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this draft? This action cannot be undone.")) return;

    try {
      const res = await deleteEbook(id);
      if (!res.success) {
        alert(res.message || "Failed to delete draft");
      } else {
        setDrafts((prev) => prev.filter((d) => d.ebook_id !== id));
      }
    } catch (e) {
      console.error("Delete error:", e);
      alert("Failed to delete draft");
    }
  };

  const handleContinue = (id) => {
    nav(`/ebook/${id}/edit`);
  };

  const handleSubmitNow = (id) => {
    if (window.confirm("Ready to submit this draft for review?")) {
      nav(`/ebook/${id}/edit`, { state: { submitOnLoad: true } });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCompletionScore = (draft) => {
    let score = 0;
    if (draft.title) score += 30;
    if (draft.abstract) score += 30;
    if (draft.keywords) score += 20;
    if (draft.has_file) score += 20;
    return score;
  };

  const completionBadge = (score) => {
    if (score >= 80) return { badge: "badge-success", bar: "bg-success", text: "Ready" };
    if (score >= 50) return { badge: "badge-warning", bar: "bg-warning", text: "In progress" };
    return { badge: "badge-danger", bar: "bg-danger", text: "Started" };
  };

  const filteredAndSortedDrafts = useMemo(() => {
    const term = (searchTerm || "").toLowerCase().trim();

    const filtered = drafts.filter((draft) => {
      const t = (draft.title || "").toLowerCase();
      const a = (draft.abstract || "").toLowerCase();
      return !term || t.includes(term) || a.includes(term);
    });

    const modifier = sortOrder === "asc" ? 1 : -1;

    filtered.sort((a, b) => {
      const aVal = a?.[sortBy];
      const bVal = b?.[sortBy];

      if (sortBy === "updated_at" || sortBy === "created_at") {
        return (new Date(aVal) - new Date(bVal)) * modifier;
      }
      return (aVal > bVal ? 1 : -1) * modifier;
    });

    return filtered;
  }, [drafts, searchTerm, sortBy, sortOrder]);

  const stats = useMemo(() => {
    const ready = drafts.filter((d) => getCompletionScore(d) >= 80).length;
    const progress = drafts.filter((d) => {
      const s = getCompletionScore(d);
      return s >= 50 && s < 80;
    }).length;
    const started = drafts.filter((d) => getCompletionScore(d) < 50).length;
    return { ready, progress, started };
  }, [drafts]);

  if (loading) {
    return (
      <MainLayout>
        <div className="content-header">
          <section className="content">
            <div className="container-fluid">
              <div className="card">
                <div className="card-body text-center py-5">
                  <div className="spinner-border text-primary" role="status" />
                  <div className="text-muted mt-3">Loading your drafts...</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="content-header">
        {/* Header */}
        <section className="content-header">
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center flex-wrap">
              <div>
                <div className="text-muted mb-2">
                  <button className="btn btn-link p-0" onClick={() => nav("/ebook/my-submissions")}>
                    My Submissions
                  </button>
                  <span className="mx-2">/</span>
                  <span>Drafts</span>
                </div>

                <h1 className="m-0">
                  <i className="fas fa-edit mr-2" />
                  My Drafts
                </h1>
                <div className="text-muted mt-1">
                  {drafts.length} {drafts.length === 1 ? "draft" : "drafts"} in progress
                </div>
              </div>

              <div className="mt-2 mt-sm-0">
                <button className="btn btn-success mr-2" onClick={() => nav("/ebook/submit")}>
                  <i className="fas fa-plus mr-2" />
                  New Draft
                </button>
                <button className="btn btn-outline-primary" onClick={loadDrafts} title="Refresh">
                  <i className="fas fa-sync-alt" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="content">
          <div className="container-fluid">
            {/* Error */}
            {error && (
              <div className="alert alert-danger alert-dismissible">
                <button type="button" className="close" onClick={() => setError("")}>
                  ×
                </button>
                <i className="fas fa-exclamation-triangle mr-2" />
                {error}
              </div>
            )}

            {/* Summary Info Boxes */}
            {drafts.length > 0 && (
              <div className="row">
                <div className="col-md-4 col-sm-6 col-12">
                  <div className="info-box">
                    <span className="info-box-icon bg-success">
                      <i className="fas fa-check" />
                    </span>
                    <div className="info-box-content">
                      <span className="info-box-text">Ready to Submit</span>
                      <span className="info-box-number">{stats.ready}</span>
                      <span className="text-muted small">Complete drafts</span>
                    </div>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6 col-12">
                  <div className="info-box">
                    <span className="info-box-icon bg-warning">
                      <i className="fas fa-hourglass-half" />
                    </span>
                    <div className="info-box-content">
                      <span className="info-box-text">In Progress</span>
                      <span className="info-box-number">{stats.progress}</span>
                      <span className="text-muted small">Need more work</span>
                    </div>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6 col-12">
                  <div className="info-box">
                    <span className="info-box-icon bg-danger">
                      <i className="fas fa-flag" />
                    </span>
                    <div className="info-box-content">
                      <span className="info-box-text">Just Started</span>
                      <span className="info-box-number">{stats.started}</span>
                      <span className="text-muted small">Minimal info</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Search + Sort */}
            {drafts.length > 0 && (
              <div className="card">
                <div className="card-body">
                  <div className="row" style={{ rowGap: 12 }}>
                    <div className="col-md-6">
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="fas fa-search" />
                          </span>
                        </div>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search drafts by title or abstract..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm ? (
                          <div className="input-group-append">
                            <button className="btn btn-outline-secondary" onClick={() => setSearchTerm("")}>
                              <i className="fas fa-times" />
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="col-md-3">
                      <select className="form-control" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="updated_at">Sort by: Last Updated</option>
                        <option value="created_at">Sort by: Created</option>
                        <option value="title">Sort by: Title</option>
                      </select>
                    </div>

                    <div className="col-md-3">
                      <select className="form-control" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                        <option value="desc">Order: Desc</option>
                        <option value="asc">Order: Asc</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty */}
            {filteredAndSortedDrafts.length === 0 ? (
              <div className="card">
                <div className="card-body text-center py-5">
                  <i className="far fa-file-alt fa-3x text-muted mb-3" />
                  <h5 className="text-muted mb-2">
                    {searchTerm ? "No drafts match your search" : "No drafts found"}
                  </h5>
                  <div className="text-muted mb-4">
                    {searchTerm ? "Try adjusting your search terms." : "Start a new submission to create your first draft."}
                  </div>
                  {!searchTerm && (
                    <button className="btn btn-primary" onClick={() => nav("/ebook/submit")}>
                      <i className="fas fa-plus-circle mr-2" />
                      Create New Draft
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="row">
                {filteredAndSortedDrafts.map((draft) => {
                  const score = getCompletionScore(draft);
                  const ui = completionBadge(score);

                  return (
                    <div key={draft.ebook_id} className="col-md-6 col-xl-4">
                      <div className="card card-outline card-secondary h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                          <span className={`badge ${ui.badge} text-uppercase`}>
                            {score}% • {ui.text}
                          </span>

                          {/* AdminLTE dropdown actions */}
                          <div className="btn-group">
                            <button
                              type="button"
                              className="btn btn-tool dropdown-toggle"
                              data-toggle="dropdown"
                              aria-haspopup="true"
                              aria-expanded="false"
                              title="Actions"
                            >
                              <i className="fas fa-ellipsis-v" />
                            </button>
                            <div className="dropdown-menu dropdown-menu-right">
                              <button className="dropdown-item" onClick={() => handleContinue(draft.ebook_id)}>
                                <i className="fas fa-edit mr-2" /> Continue
                              </button>

                              {score >= 80 && (
                                <button className="dropdown-item" onClick={() => handleSubmitNow(draft.ebook_id)}>
                                  <i className="fas fa-paper-plane mr-2" /> Submit Now
                                </button>
                              )}

                              <div className="dropdown-divider" />

                              <button className="dropdown-item text-danger" onClick={() => handleDelete(draft.ebook_id)}>
                                <i className="fas fa-trash mr-2" /> Delete
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="card-body">
                          <div className="text-muted small mb-2">
                            <i className="far fa-clock mr-1" />
                            Updated: {formatDate(draft.updated_at)}
                          </div>

                          <h5 className="mb-3">
                            <i className="far fa-file-alt mr-2 text-muted" />
                            {draft.title || "Untitled Draft"}
                          </h5>

                          {/* Progress */}
                          <div className="progress mb-3" style={{ height: 8 }}>
                            <div className={`progress-bar ${ui.bar}`} style={{ width: `${score}%` }} />
                          </div>

                          {/* Checklist */}
                          <div className="small">
                            <div className="mb-2">
                              <i className={`fas ${draft.title ? "fa-check-circle text-success" : "fa-circle text-muted"} mr-2`} />
                              Title {draft.title ? "added" : "missing"}
                            </div>
                            <div className="mb-2">
                              <i className={`fas ${draft.abstract ? "fa-check-circle text-success" : "fa-circle text-muted"} mr-2`} />
                              Abstract {draft.abstract ? `${draft.abstract.length} chars` : "missing"}
                            </div>
                            <div className="mb-2">
                              <i className={`fas ${draft.keywords ? "fa-check-circle text-success" : "fa-circle text-muted"} mr-2`} />
                              Keywords {draft.keywords ? "added" : "missing"}
                            </div>
                            <div>
                              <i className={`fas ${draft.has_file ? "fa-check-circle text-success" : "fa-circle text-muted"} mr-2`} />
                              Manuscript file {draft.has_file ? "uploaded" : "missing"}
                            </div>
                          </div>
                        </div>

                        <div className="card-footer d-flex" style={{ gap: 8 }}>
                          <button className="btn btn-primary flex-fill" onClick={() => handleContinue(draft.ebook_id)}>
                            <i className="fas fa-edit mr-2" />
                            Continue
                          </button>

                          {score >= 80 ? (
                            <button className="btn btn-success" onClick={() => handleSubmitNow(draft.ebook_id)} title="Submit for review">
                              <i className="fas fa-paper-plane" />
                            </button>
                          ) : (
                            <button className="btn btn-success" disabled title="Complete more fields to submit">
                              <i className="fas fa-paper-plane" />
                            </button>
                          )}

                          <button className="btn btn-outline-danger" onClick={() => handleDelete(draft.ebook_id)} title="Delete draft">
                            <i className="fas fa-trash" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Note */}
            {drafts.length > 0 && (
              <div className="callout callout-info mt-3">
                <h5 className="mb-1">
                  <i className="fas fa-info-circle mr-2" />
                  Tips
                </h5>
                <div className="small mb-0">
                  Add <b>title</b>, <b>abstract</b>, <b>keywords</b>, and upload the <b>manuscript file</b> to reach 80% and enable “Submit Now”.
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}