// pages/ebook/EbookAuthorStageListPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout.jsx";
import ebookApi from "../../api/ebook.api";
import StatusBadge from "./components/StatusBadge.jsx";

const STAGE_CONFIG = {
  all: {
    heading: "My Submissions",
    subtitle:
      "Manage all your ebook submissions, track progress, and continue work from one place.",
    empty: "You have no submissions yet.",
    query: {},
    icon: "fa-folder-open",
    color: "primary",
  },
  drafts: {
    heading: "My Drafts",
    subtitle: "Continue unfinished submissions and complete missing details.",
    empty: "You have no draft submissions.",
    query: { status: "draft" },
    icon: "fa-pen",
    color: "secondary",
  },
  revisions: {
    heading: "Revision Requests",
    subtitle: "Review editor feedback and submit updated versions.",
    empty: "No submissions are waiting for revision.",
    query: { stage: "revisions" },
    icon: "fa-code-branch",
    color: "warning",
  },
  payments: {
    heading: "Payments & Waivers",
    subtitle: "Track payment requests, waivers, and processing status.",
    empty: "No submissions need payment.",
    query: { stage: "payments" },
    icon: "fa-credit-card",
    color: "danger",
  },
  proofs: {
    heading: "Proof Approvals",
    subtitle: "Review and approve final proofs before publication.",
    empty: "No submissions need proof approval.",
    query: { stage: "proofs" },
    icon: "fa-check-circle",
    color: "success",
  },
  rejected: {
    heading: "Rejected by Editor",
    subtitle: "Submissions closed by editorial decision.",
    empty: "No submissions have been rejected by the editor.",
    query: { status: "rejected" },
    icon: "fa-times-circle",
    color: "dark",
  },
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function formatDate(value) {
  if (!value) return "—";
  try {
    const date = new Date(value);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  } catch {
    return value;
  }
}

function getPrimaryAction(stage, row) {
  if (stage === "drafts") {
    return {
      label: "Continue Draft",
      className: "btn btn-primary",
      to: `/ebook/submissions/${row.submission_id}`,
      icon: "fa-pen",
    };
  }
  if (stage === "revisions") {
    return {
      label: "Open Revision",
      className: "btn btn-warning",
      to: `/ebook/submissions/${row.submission_id}/review-comments`,
      icon: "fa-code-branch",
    };
  }
  if (stage === "payments") {
    return {
      label: "Open Payment",
      className: "btn btn-danger",
      to: `/ebook/submissions/${row.submission_id}/payment`,
      icon: "fa-credit-card",
    };
  }
  if (stage === "proofs") {
    return {
      label: "Open Proof",
      className: "btn btn-success",
      to: `/ebook/submissions/${row.submission_id}/proof-approval`,
      icon: "fa-check-circle",
    };
  }
  return {
    label: "Open Detail",
    className: "btn btn-outline-primary",
    to: `/ebook/submissions/${row.submission_id}`,
    icon: "fa-arrow-right",
  };
}

function buildStats(rows = []) {
  return {
    total: rows.length,
    drafts: rows.filter((r) => String(r.status || "").toLowerCase() === "draft").length,
    revisions: rows.filter((r) => String(r.stage || "").toLowerCase() === "revisions").length,
    payments: rows.filter((r) => r.payment_status || Number(r.amount_due || 0) > 0).length,
    proofs: rows.filter((r) => !!r.proof_sent_to_author && !r.author_proof_approved).length,
  };
}

function InfoCard({ label, children, icon = "fa-circle" }) {
  return (
    <div
      className="h-100 p-3"
      style={{
        background: "#f8fafc",
        border: "1px solid #edf2f7",
        borderRadius: 14,
      }}
    >
      <div className="d-flex align-items-center mb-2">
        <div
          className="d-inline-flex align-items-center justify-content-center mr-2"
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            color: "#4a5568",
          }}
        >
          <i className={`fas ${icon}`}></i>
        </div>
        <small className="text-muted mb-0">{label}</small>
      </div>
      <div>{children}</div>
    </div>
  );
}

const SummaryCard = ({ title, value, icon, tone = "primary" }) => {
  const tones = {
    primary: { bg: "#ebf8ff", text: "#2b6cb0", border: "#bee3f8" },
    success: { bg: "#f0fff4", text: "#2f855a", border: "#c6f6d5" },
    warning: { bg: "#fffaf0", text: "#c05621", border: "#fbd38d" },
    danger: { bg: "#fff5f5", text: "#c53030", border: "#feb2b2" },
    secondary: { bg: "#f7fafc", text: "#4a5568", border: "#e2e8f0" },
  };

  const theme = tones[tone] || tones.primary;

  return (
    <div
      className="p-3 h-100"
      style={{
        borderRadius: 16,
        background: theme.bg,
        border: `1px solid ${theme.border}`,
      }}
    >
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <div className="small text-muted mb-1">{title}</div>
          <div className="h4 mb-0 font-weight-bold" style={{ color: theme.text }}>
            {value}
          </div>
        </div>
        <div
          className="d-flex align-items-center justify-content-center"
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "#fff",
            color: theme.text,
            border: `1px solid ${theme.border}`,
          }}
        >
          <i className={`fas ${icon}`}></i>
        </div>
      </div>
    </div>
  );
};

const SubmissionModal = ({ isOpen, onClose, submission, stage }) => {
  if (!isOpen || !submission) return null;

  const primaryAction = getPrimaryAction(stage, submission);

  return (
    <>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        style={{ display: "block" }}
      >
        <div
          className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
          role="document"
        >
          <div
            className="modal-content border-0"
            style={{
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 30px 80px rgba(15, 23, 42, 0.18)",
            }}
          >
            <div
              className="modal-header border-0 text-white"
              style={{
                background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                padding: "1.25rem 1.5rem",
              }}
            >
              <div>
                <h5 className="modal-title h4 font-weight-bold mb-1">
                  <i className="fas fa-file-alt mr-2"></i>
                  Submission Details
                </h5>
                <div style={{ opacity: 0.9 }}>
                  Review submission information and continue the next action.
                </div>
              </div>

              <button
                type="button"
                className="close text-white"
                onClick={onClose}
                style={{ opacity: 0.9, textShadow: "none" }}
              >
                <span className="h2">&times;</span>
              </button>
            </div>

            <div className="modal-body p-4" style={{ background: "#ffffff" }}>
              <div className="row">
                <div className="col-md-8 mb-3">
                  <InfoCard label="Title" icon="fa-heading">
                    <h5 className="font-weight-bold mb-0 text-dark">
                      {submission.title || "—"}
                    </h5>
                  </InfoCard>
                </div>

                <div className="col-md-4 mb-3">
                  <InfoCard label="Subtitle" icon="fa-align-left">
                    <div className="font-weight-bold text-dark">
                      {submission.subtitle || "—"}
                    </div>
                  </InfoCard>
                </div>

                <div className="col-md-4 mb-3">
                  <InfoCard label="Status" icon="fa-signal">
                    <StatusBadge value={submission.status} />
                  </InfoCard>
                </div>

                <div className="col-md-4 mb-3">
                  <InfoCard label="Category" icon="fa-tag">
                    <div className="font-weight-bold text-dark">
                      {submission.category || "—"}
                    </div>
                  </InfoCard>
                </div>

                <div className="col-md-4 mb-3">
                  <InfoCard label="Language" icon="fa-language">
                    <div className="font-weight-bold text-dark">
                      {submission.language || "—"}
                    </div>
                  </InfoCard>
                </div>

                <div className="col-md-6 mb-3">
                  <InfoCard label="Payment Status" icon="fa-credit-card">
                    {submission.payment_status ? (
                      <>
                        <StatusBadge value={submission.payment_status} />
                        <div className="mt-2 font-weight-bold text-dark">
                          {submission.amount_due || 0} {submission.currency_code || "ETB"}
                        </div>
                      </>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </InfoCard>
                </div>

                <div className="col-md-6 mb-3">
                  <InfoCard label="Proof Status" icon="fa-check-circle">
                    {submission.proof_sent_to_author ? (
                      <>
                        <StatusBadge
                          value={submission.author_proof_approved ? "approved" : "pending"}
                        />
                        <div className="mt-2 text-muted">
                          {submission.author_proof_approved
                            ? "Approved by author"
                            : "Waiting for author approval"}
                        </div>
                      </>
                    ) : (
                      <span className="text-muted">Not ready</span>
                    )}
                  </InfoCard>
                </div>

                <div className="col-md-6 mb-3">
                  <InfoCard label="Files" icon="fa-file-upload">
                    <div className="d-flex align-items-center flex-wrap">
                      <span className="h4 mb-0 mr-2 font-weight-bold text-dark">
                        {submission.file_count || 0}
                      </span>
                      {Array.isArray(submission.file_roles) &&
                        submission.file_roles.length > 0 && (
                          <span className="text-muted small">
                            ({submission.file_roles.join(", ")})
                          </span>
                        )}
                    </div>
                  </InfoCard>
                </div>

                <div className="col-md-6 mb-3">
                  <InfoCard label="Last Updated" icon="fa-clock">
                    <div className="font-weight-bold text-dark">
                      {formatDate(
                        submission.updated_at ||
                          submission.submitted_at ||
                          submission.accepted_at
                      )}
                    </div>
                  </InfoCard>
                </div>

                {submission.abstract && (
                  <div className="col-12 mb-3">
                    <InfoCard label="Abstract" icon="fa-align-left">
                      <p className="mb-0 text-dark" style={{ lineHeight: 1.7 }}>
                        {submission.abstract}
                      </p>
                    </InfoCard>
                  </div>
                )}

                {submission.keywords && (
                  <div className="col-12 mb-3">
                    <InfoCard label="Keywords" icon="fa-tags">
                      <div>
                        {(Array.isArray(submission.keywords)
                          ? submission.keywords
                          : String(submission.keywords)
                              .split(",")
                              .map((item) => item.trim())
                              .filter(Boolean)
                        ).map((keyword, i) => (
                          <span
                            key={i}
                            className="badge badge-light mr-2 mb-2 px-3 py-2"
                            style={{
                              borderRadius: 999,
                              border: "1px solid #e2e8f0",
                              fontSize: "0.8rem",
                            }}
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </InfoCard>
                  </div>
                )}
              </div>
            </div>

            <div
              className="modal-footer border-0 d-flex justify-content-between"
              style={{ background: "#f8fafc" }}
            >
              <button
                type="button"
                className="btn btn-light px-4 rounded-pill"
                onClick={onClose}
                style={{ border: "1px solid #e2e8f0" }}
              >
                <i className="fas fa-times mr-2"></i>
                Close
              </button>

              <div className="d-flex flex-wrap" style={{ gap: 10 }}>
                 

                {primaryAction && (
                  <Link
                    className={`${primaryAction.className} rounded-pill px-4`}
                    to={primaryAction.to}
                  >
                    <i className={`fas ${primaryAction.icon} mr-2`}></i>
                    {primaryAction.label}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal-backdrop fade show"
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15,23,42,0.45)",
          zIndex: 1040,
          backdropFilter: "blur(5px)",
        }}
      ></div>
    </>
  );
};

export default function EbookAuthorStageListPage({ stage = "all" }) {
  const config = STAGE_CONFIG[stage] || STAGE_CONFIG.all;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [serverSearch, setServerSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [rows, setRows] = useState([]);

  const [sortBy, setSortBy] = useState("updated_at");
  const [sortDir, setSortDir] = useState("desc");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const load = async (query = "") => {
    setLoading(true);
    setError("");
    try {
      const result = await ebookApi.listMySubmissions({
        limit: 100,
        search: query,
        ...(config.query || {}),
      });
      setRows(Array.isArray(result?.rows) ? result.rows : []);
      setPage(1);
    } catch (err) {
      console.error("Load error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load submissions."
      );
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load("");
    setSearchInput("");
    setServerSearch("");
  }, [stage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setServerSearch(searchInput);
    load(searchInput);
    setPage(1);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDir("asc");
    }
    setPage(1);
  };

  const sortedRows = useMemo(() => {
    const list = [...rows];
    list.sort((a, b) => {
      const aVal = a?.[sortBy];
      const bVal = b?.[sortBy];

      if (
        sortBy === "title" ||
        sortBy === "status" ||
        sortBy === "payment_status"
      ) {
        const aa = String(aVal || "").toLowerCase();
        const bb = String(bVal || "").toLowerCase();
        if (aa < bb) return sortDir === "asc" ? -1 : 1;
        if (aa > bb) return sortDir === "asc" ? 1 : -1;
        return 0;
      }

      if (sortBy === "file_count" || sortBy === "amount_due") {
        const aa = Number(aVal || 0);
        const bb = Number(bVal || 0);
        return sortDir === "asc" ? aa - bb : bb - aa;
      }

      const aa = aVal ? new Date(aVal).getTime() : 0;
      const bb = bVal ? new Date(bVal).getTime() : 0;
      return sortDir === "asc" ? aa - bb : bb - aa;
    });
    return list;
  }, [rows, sortBy, sortDir]);

  const stats = useMemo(() => buildStats(rows), [rows]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  const sortIcon = (column) => {
    if (sortBy !== column) return <i className="fas fa-sort text-muted ml-1"></i>;
    return sortDir === "asc" ? (
      <i className="fas fa-sort-up text-primary ml-1"></i>
    ) : (
      <i className="fas fa-sort-down text-primary ml-1"></i>
    );
  };

  const clearSearch = () => {
    setSearchInput("");
    setServerSearch("");
    load("");
  };

  return (
    <MainLayout>
      <style>{`
        .ebook-stage-page .hero-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
          border: 1px solid #e9eef5;
          border-radius: 20px;
          box-shadow: 0 14px 35px rgba(15, 23, 42, 0.06);
        }

        .ebook-stage-page .toolbar-card,
        .ebook-stage-page .table-card {
          border: 1px solid #edf2f7;
          border-radius: 18px;
          box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05);
          background: #ffffff;
        }

        .ebook-stage-page .soft-input,
        .ebook-stage-page .soft-select {
          border-radius: 999px !important;
          border: 1px solid #dbe4ee !important;
          box-shadow: none !important;
          min-height: 44px;
        }

        .ebook-stage-page .soft-input:focus,
        .ebook-stage-page .soft-select:focus {
          border-color: #60a5fa !important;
          box-shadow: 0 0 0 0.2rem rgba(37, 99, 235, 0.12) !important;
        }

        .ebook-stage-page .modern-table thead th {
          background: #f8fafc;
          border-top: none !important;
          border-bottom: 1px solid #e9eef5 !important;
          color: #475569;
          font-weight: 700;
          font-size: 0.85rem;
          white-space: nowrap;
        }

        .ebook-stage-page .modern-table tbody td {
          border-top: 1px solid #f1f5f9 !important;
          vertical-align: middle;
        }

        .ebook-stage-page .modern-table tbody tr {
          transition: all 0.2s ease;
        }

        .ebook-stage-page .modern-table tbody tr:hover {
          background: #f8fbff;
        }

        .ebook-stage-page .empty-state {
          padding: 2rem 1rem;
        }

        .ebook-stage-page .section-label {
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #64748b;
          margin-bottom: 0.5rem;
        }

        .ebook-stage-page .pill-btn {
          border-radius: 999px;
        }
      `}</style>

      <div className="ebook-stage-page">
        <section className="content-header mb-4">
          <div className="hero-card p-4 p-md-5">
            <div className="d-flex justify-content-between align-items-start flex-wrap" style={{ gap: 16 }}>
              <div>
                <div className="section-label">Author Workspace</div>
                <h1 className="mb-2 font-weight-bold" style={{ color: "#1e293b" }}>
                  <i className={`fas ${config.icon} text-${config.color} mr-3`}></i>
                  {config.heading}
                </h1>
                <p className="text-muted mb-0" style={{ maxWidth: 760 }}>
                  {config.subtitle}
                </p>
              </div>

              <div className="d-flex flex-wrap" style={{ gap: 10 }}>
                <Link
                  className="btn btn-light pill-btn px-4"
                  style={{ border: "1px solid #dbe4ee" }}
                  to="/ebook/my-submissions"
                >
                  <i className="fas fa-folder-open mr-2"></i>
                  All Submissions
                </Link>
                <Link
                  className="btn btn-primary pill-btn px-4 shadow-sm"
                  to="/ebook/submissions/create"
                >
                  <i className="fas fa-plus mr-2"></i>
                  New Submission
                </Link>
              </div>
            </div>

            <div className="row mt-4">
              <div className="col-md-3 col-sm-6 mb-3">
                <SummaryCard
                  title="Total Submissions"
                  value={stats.total}
                  icon="fa-folder"
                  tone="primary"
                />
              </div>
              <div className="col-md-3 col-sm-6 mb-3">
                <SummaryCard
                  title="Drafts"
                  value={stats.drafts}
                  icon="fa-pen"
                  tone="secondary"
                />
              </div>
              <div className="col-md-3 col-sm-6 mb-3">
                <SummaryCard
                  title="Revisions"
                  value={stats.revisions}
                  icon="fa-code-branch"
                  tone="warning"
                />
              </div>
              <div className="col-md-3 col-sm-6 mb-3">
                <SummaryCard
                  title="Pending Proofs"
                  value={stats.proofs}
                  icon="fa-check-circle"
                  tone="success"
                />
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div
            className="alert alert-danger alert-dismissible fade show mb-4"
            role="alert"
            style={{ borderRadius: 16 }}
          >
            <div className="d-flex align-items-center">
              <i className="fas fa-exclamation-circle mr-3 fa-lg"></i>
              <div className="flex-grow-1">{error}</div>
              <button type="button" className="close" onClick={() => setError("")}>
                <span>&times;</span>
              </button>
            </div>
          </div>
        )}

        <div className="toolbar-card mb-4">
          <div className="card-body p-4">
            <form onSubmit={handleSearch}>
              <div className="row align-items-end">
                <div className="col-lg-7 mb-3 mb-lg-0">
                  <label className="section-label mb-2">Search submissions</label>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span
                        className="input-group-text bg-white border-right-0"
                        style={{ borderRadius: "999px 0 0 999px", borderColor: "#dbe4ee" }}
                      >
                        <i className="fas fa-search text-muted"></i>
                      </span>
                    </div>
                    <input
                      className="form-control soft-input border-left-0"
                      placeholder="Search by title, abstract, or keywords..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-lg-5">
                  <div className="d-flex flex-wrap justify-content-lg-end" style={{ gap: 10 }}>
                    <button className="btn btn-primary pill-btn px-4" type="submit">
                      <i className="fas fa-search mr-2"></i>
                      Search
                    </button>

                    {serverSearch && (
                      <button
                        className="btn btn-outline-secondary pill-btn px-4"
                        type="button"
                        onClick={clearSearch}
                      >
                        <i className="fas fa-times mr-2"></i>
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="table-card">
          <div
            className="card-body border-bottom"
            style={{ background: "#f8fafc", borderTopLeftRadius: 18, borderTopRightRadius: 18 }}
          >
            <div className="d-flex justify-content-between align-items-center flex-wrap" style={{ gap: 14 }}>
              <div className="text-muted">
                <i className="fas fa-database mr-2"></i>
                Showing {rows.length ? (currentPage - 1) * pageSize + 1 : 0}–
                {Math.min(currentPage * pageSize, sortedRows.length)} of {sortedRows.length}
                {serverSearch && (
                  <>
                    {" "}results for{" "}
                    <span className="font-weight-bold text-primary">"{serverSearch}"</span>
                  </>
                )}
              </div>

              <div className="d-flex align-items-center" style={{ gap: 10 }}>
                <span className="small text-muted">Rows per page</span>
                <select
                  className="form-control form-control-sm soft-select"
                  style={{ width: 92 }}
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table modern-table table-hover mb-0">
              <thead>
                <tr>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("title")}>
                    Title {sortIcon("title")}
                  </th>
                  <th
                    style={{ cursor: "pointer", width: 140 }}
                    onClick={() => handleSort("status")}
                  >
                    Status {sortIcon("status")}
                  </th>
                  <th
                    style={{ cursor: "pointer", width: 170 }}
                    onClick={() => handleSort("payment_status")}
                  >
                    Payment {sortIcon("payment_status")}
                  </th>
                  <th style={{ width: 140 }}>Proof</th>
                  <th
                    style={{ cursor: "pointer", width: 120 }}
                    onClick={() => handleSort("file_count")}
                  >
                    Files {sortIcon("file_count")}
                  </th>
                  <th
                    style={{ cursor: "pointer", width: 170 }}
                    onClick={() => handleSort("updated_at")}
                  >
                    Last Updated {sortIcon("updated_at")}
                  </th>
                  <th style={{ width: 110 }}>Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="d-flex flex-column align-items-center justify-content-center">
                        <div className="spinner-border text-primary mb-3" role="status">
                          <span className="sr-only">Loading...</span>
                        </div>
                        <span className="text-muted">Loading submissions...</span>
                      </div>
                    </td>
                  </tr>
                ) : !paginatedRows.length ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="empty-state">
                        <div
                          className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                          style={{
                            width: 72,
                            height: 72,
                            borderRadius: "50%",
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <i className={`fas ${config.icon} fa-2x text-muted`}></i>
                        </div>
                        <h5 className="mb-2">{config.empty}</h5>
                        <p className="text-muted mb-3">
                          Start by creating a new ebook submission or adjusting your search.
                        </p>
                        {stage === "all" && (
                          <Link
                            to="/ebook/submissions/create"
                            className="btn btn-primary pill-btn px-4"
                          >
                            <i className="fas fa-plus mr-2"></i>
                            Create Your First Submission
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row) => (
                    <tr
                      key={row.submission_id}
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelectedSubmission(row)}
                    >
                      <td>
                        <div className="font-weight-bold text-dark mb-1">
                          {row.title || "Untitled"}
                        </div>
                        <small className="text-muted d-block">
                          <i className="fas fa-tag mr-1"></i>
                          {row.category || "No category"}
                        </small>
                        <small className="text-muted d-block">
                          <i className="fas fa-language mr-1"></i>
                          {row.language || "—"}
                        </small>
                      </td>

                      <td>
                        <StatusBadge value={row.status} />
                      </td>

                      <td>
                        {row.amount_due || row.payment_status ? (
                          <>
                            <StatusBadge value={row.payment_status || "pending"} />
                            <small className="d-block text-muted mt-1">
                              {row.amount_due || 0} {row.currency_code || "ETB"}
                            </small>
                          </>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>

                      <td>
                        {row.proof_sent_to_author ? (
                          <>
                            <StatusBadge
                              value={row.author_proof_approved ? "approved" : "pending"}
                            />
                            <small className="d-block text-muted mt-1">
                              {row.author_proof_approved ? "Approved" : "Waiting"}
                            </small>
                          </>
                        ) : (
                          <span className="text-muted">Not ready</span>
                        )}
                      </td>

                      <td>
                        <div className="d-flex align-items-center flex-wrap">
                          <span
                            className="badge badge-light mr-2"
                            style={{
                              borderRadius: 999,
                              border: "1px solid #e2e8f0",
                              padding: "0.45rem 0.75rem",
                            }}
                          >
                            {row.file_count || 0}
                          </span>
                          {Array.isArray(row.file_roles) && row.file_roles.length > 0 && (
                            <small className="text-muted text-truncate" style={{ maxWidth: 120 }}>
                              {row.file_roles.join(", ")}
                            </small>
                          )}
                        </div>
                      </td>

                      <td>
                        <small className="text-muted d-block">
                          <i className="far fa-clock mr-1"></i>
                          {formatDate(row.updated_at || row.submitted_at || row.accepted_at)}
                        </small>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary pill-btn px-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSubmission(row);
                          }}
                        >
                          <i className="fas fa-eye mr-1"></i>
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="card-footer bg-white border-0 py-3 px-4">
            <div className="d-flex justify-content-between align-items-center flex-wrap" style={{ gap: 12 }}>
              <div className="small text-muted">
                Page {currentPage} of {totalPages}
              </div>

              <div className="d-flex" style={{ gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-outline-secondary pill-btn px-4"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <i className="fas fa-chevron-left mr-2"></i>
                  Previous
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary pill-btn px-4"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                  <i className="fas fa-chevron-right ml-2"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <SubmissionModal
          isOpen={!!selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          submission={selectedSubmission}
          stage={stage}
        />
      </div>
    </MainLayout>
  );
}