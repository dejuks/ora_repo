import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import MainLayout from "../../components/layout/MainLayout.jsx";
import StatusBadge from "./components/StatusBadge.jsx";

const API = process.env.REACT_APP_API_URL;

const STAGE_CONFIG = {
  all: {
    heading: "My Submissions",
    subtitle: "Manage all your ebook submissions, track progress, and continue work from one place.",
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
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return value;
  }
}

function getPrimaryAction(stage, row) {
  if (stage === "drafts") {
    return {
      label: "Continue Draft",
      className: "btn btn-primary btn-sm",
      to: `/ebook/manuscripts/edit/${row.id}`,
      icon: "fa-pen",
    };
  }
  if (stage === "revisions") {
    return {
      label: "Open Revision",
      className: "btn btn-warning btn-sm",
      to: `/ebook/manuscripts/${row.id}/revisions`,
      icon: "fa-code-branch",
    };
  }
  if (stage === "payments") {
    return {
      label: "Open Payment",
      className: "btn btn-danger btn-sm",
      to: `/ebook/manuscripts/${row.id}/payment`,
      icon: "fa-credit-card",
    };
  }
  if (stage === "proofs") {
    return {
      label: "Open Proof",
      className: "btn btn-success btn-sm",
      to: `/ebook/manuscripts/${row.id}/proof`,
      icon: "fa-check-circle",
    };
  }
  return {
    label: "Open Detail",
    className: "btn btn-outline-primary btn-sm",
    to: `/ebook/manuscripts/show/${row.id}`,
    icon: "fa-arrow-right",
  };
}

function buildStats(rows = []) {
  return {
    total: rows.length,
    drafts: rows.filter((r) => String(r.status || "").toLowerCase() === "draft").length,
    revisions: rows.filter((r) => String(r.status || "").toLowerCase() === "revision_required").length,
    payments: rows.filter((r) => r.payment_status || Number(r.amount_due || 0) > 0).length,
    proofs: rows.filter((r) => !!r.proof_sent_to_author && !r.author_proof_approved).length,
    paymentOrdered: rows.filter(
      (r) => String(r.payment_status || "").toLowerCase() === "payment_ordered" ||
             String(r.status || "").toLowerCase() === "payment_ordered"
    ).length,
  };
}

function InfoCard({ label, children, icon = "fa-circle" }) {
  return (
    <div className="h-100 p-3" style={{ background: "#f8fafc", border: "1px solid #edf2f7", borderRadius: 14 }}>
      <div className="d-flex align-items-center mb-2">
        <div className="d-inline-flex align-items-center justify-content-center mr-2" style={{ width: 34, height: 34, borderRadius: 10, background: "#ffffff", border: "1px solid #e2e8f0", color: "#4a5568" }}>
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
    dark: { bg: "#f1f5f9", text: "#334155", border: "#cbd5e1" },
    info: { bg: "#e0f2fe", text: "#0369a1", border: "#bae6fd" },
  };
  const theme = tones[tone] || tones.primary;
  return (
    <div className="p-3 h-100" style={{ borderRadius: 16, background: theme.bg, border: `1px solid ${theme.border}` }}>
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <div className="small text-muted mb-1">{title}</div>
          <div className="h4 mb-0 font-weight-bold" style={{ color: theme.text }}>{value}</div>
        </div>
        <div className="d-flex align-items-center justify-content-center" style={{ width: 44, height: 44, borderRadius: 12, background: "#fff", color: theme.text, border: `1px solid ${theme.border}` }}>
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
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ display: "block" }}>
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable" role="document">
          <div className="modal-content border-0" style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 30px 80px rgba(15, 23, 42, 0.18)" }}>
            <div className="modal-header border-0 text-white" style={{ background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)", padding: "1.25rem 1.5rem" }}>
              <div>
                <h5 className="modal-title h4 font-weight-bold mb-1"><i className="fas fa-file-alt mr-2"></i>Submission Details</h5>
                <div style={{ opacity: 0.9 }}>Review submission information and continue the next action.</div>
              </div>
              <button type="button" className="close text-white" onClick={onClose} style={{ opacity: 0.9, textShadow: "none" }}><span className="h2">&times;</span></button>
            </div>
            <div className="modal-body p-4" style={{ background: "#ffffff" }}>
              <div className="row">
                <div className="col-md-8 mb-3"><InfoCard label="Title" icon="fa-heading"><h5 className="font-weight-bold mb-0 text-dark">{submission.title || "—"}</h5></InfoCard></div>
                <div className="col-md-4 mb-3"><InfoCard label="Subtitle" icon="fa-align-left"><div className="font-weight-bold text-dark">{submission.subtitle || "—"}</div></InfoCard></div>
                <div className="col-md-4 mb-3"><InfoCard label="Status" icon="fa-signal"><StatusBadge value={submission.status} /></InfoCard></div>
                <div className="col-md-4 mb-3"><InfoCard label="Category" icon="fa-tag"><div className="font-weight-bold text-dark">{submission.category || "—"}</div></InfoCard></div>
                <div className="col-md-4 mb-3"><InfoCard label="Language" icon="fa-language"><div className="font-weight-bold text-dark">{submission.language || "—"}</div></InfoCard></div>
                <div className="col-md-6 mb-3">
                  <InfoCard label="Payment Status" icon="fa-credit-card">
                    {submission.payment_status ? <><StatusBadge value={submission.payment_status} /><div className="mt-2 font-weight-bold text-dark">{submission.amount_due || 0} {submission.currency_code || "ETB"}</div></> : <span className="text-muted">—</span>}
                  </InfoCard>
                </div>
                <div className="col-md-6 mb-3">
                  <InfoCard label="Proof Status" icon="fa-check-circle">
                    {submission.proof_sent_to_author ? <StatusBadge value={submission.author_proof_approved ? "approved" : "pending"} /> : <span className="text-muted">Not ready</span>}
                  </InfoCard>
                </div>
                <div className="col-md-6 mb-3"><InfoCard label="Files" icon="fa-file-upload"><span className="h4 mb-0 mr-2 font-weight-bold text-dark">{submission.file_count || 0}</span></InfoCard></div>
                <div className="col-md-6 mb-3"><InfoCard label="Last Updated" icon="fa-clock"><div className="font-weight-bold text-dark">{formatDate(submission.updated_at || submission.created_at)}</div></InfoCard></div>
                {submission.abstract && (<div className="col-12 mb-3"><InfoCard label="Abstract" icon="fa-align-left"><p className="mb-0 text-dark" style={{ lineHeight: 1.7 }}>{submission.abstract}</p></InfoCard></div>)}
              </div>
            </div>
            <div className="modal-footer border-0 d-flex justify-content-between" style={{ background: "#f8fafc" }}>
              <button type="button" className="btn btn-light px-4 rounded-pill" onClick={onClose} style={{ border: "1px solid #e2e8f0" }}><i className="fas fa-times mr-2"></i>Close</button>
              {primaryAction && (<Link className={`${primaryAction.className} rounded-pill px-4`} to={primaryAction.to}><i className={`fas ${primaryAction.icon} mr-2`}></i>{primaryAction.label}</Link>)}
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.45)", zIndex: 1040, backdropFilter: "blur(5px)" }} />
    </>
  );
};

export default function EbookAuthorStageListPage({ stage = "all" }) {
  const config = STAGE_CONFIG[stage] || STAGE_CONFIG.all;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [rows, setRows] = useState([]);
  const [sortBy, setSortBy] = useState("updated_at");
  const [sortDir, setSortDir] = useState("desc");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Define handleSort function
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDir("asc");
    }
    setPage(1);
  };

  const load = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login to continue");
      setLoading(false);
      return;
    }
    try {
      const baseUrl = `${API}/ebook/manuscripts/my-manuscripts`;
      const res = await axios.get(baseUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let manuscripts = [];
      if (Array.isArray(res.data)) {
        manuscripts = res.data;
      } else if (res.data?.rows) {
        manuscripts = res.data.rows;
      }
      // Apply stage filter
      let filtered = manuscripts;
      if (config.query?.status) {
        filtered = manuscripts.filter(m => m.status === config.query.status);
      }
      if (config.query?.stage) {
        filtered = manuscripts.filter(m => m.stage === config.query.stage);
      }
      setRows(filtered);
    } catch (err) {
      console.error("Load error:", err);
      setError(err?.response?.data?.error || err?.message || "Failed to load submissions.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [stage]);

  const filteredRows = useMemo(() => {
    if (!searchInput.trim()) return rows;
    const search = searchInput.toLowerCase();
    return rows.filter(row => 
      (row.title || "").toLowerCase().includes(search) ||
      (row.isbn || "").toLowerCase().includes(search) ||
      String(row.publication_year || "").includes(search)
    );
  }, [rows, searchInput]);

  const sortedRows = useMemo(() => {
    const list = [...filteredRows];
    list.sort((a, b) => {
      let aVal = a?.[sortBy];
      let bVal = b?.[sortBy];
      if (sortBy === "title") {
        const aa = String(aVal || "").toLowerCase();
        const bb = String(bVal || "").toLowerCase();
        if (aa < bb) return sortDir === "asc" ? -1 : 1;
        if (aa > bb) return sortDir === "asc" ? 1 : -1;
        return 0;
      }
      if (sortBy === "status") {
        const aa = String(aVal || "").toLowerCase();
        const bb = String(bVal || "").toLowerCase();
        if (aa < bb) return sortDir === "asc" ? -1 : 1;
        if (aa > bb) return sortDir === "asc" ? 1 : -1;
        return 0;
      }
      aVal = aVal ? new Date(aVal).getTime() : 0;
      bVal = bVal ? new Date(bVal).getTime() : 0;
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    });
    return list;
  }, [filteredRows, sortBy, sortDir]);

  const stats = useMemo(() => buildStats(rows), [rows]);
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  const sortIcon = (column) => {
    if (sortBy !== column) return <i className="fas fa-sort text-muted ml-1"></i>;
    return sortDir === "asc" ? <i className="fas fa-sort-up text-primary ml-1"></i> : <i className="fas fa-sort-down text-primary ml-1"></i>;
  };

  return (
    <MainLayout>
      <div className="ebook-stage-page" style={{ background: "#f4f7fb", minHeight: "100vh" }}>
        <div className="container-fluid py-4">
          {/* Hero Header */}
          <div className="rounded-4 shadow-sm overflow-hidden mb-4" style={{ background: "linear-gradient(135deg, #0d6efd 0%, #4f46e5 50%, #7c3aed 100%)" }}>
            <div className="p-4 p-md-5 text-white">
              <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-4">
                <div>
                  <div className="d-inline-flex align-items-center px-3 py-2 rounded-pill mb-3" style={{ background: "rgba(255,255,255,0.16)", backdropFilter: "blur(6px)" }}>
                    <i className="fas fa-pen-nib mr-2"></i>
                    <span className="font-weight-bold">ORA eBook Publishing</span>
                  </div>
                  <h2 className="mb-2 font-weight-bold"><i className={`fas ${config.icon} mr-3`}></i>{config.heading}</h2>
                  <p className="mb-0" style={{ color: "rgba(255,255,255,0.88)" }}>{config.subtitle}</p>
                </div>
                <div>
                  <Link className="btn btn-light btn-lg rounded-pill px-4 shadow-sm" to="/ebook/submissions/create">
                    <i className="fas fa-plus mr-2"></i>New Submission
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="row mb-4">
            <div className="col-md-3 col-sm-6 mb-3"><SummaryCard title="Total Submissions" value={stats.total} icon="fa-folder" tone="primary" /></div>
            <div className="col-md-3 col-sm-6 mb-3"><SummaryCard title="Drafts" value={stats.drafts} icon="fa-pen" tone="secondary" /></div>
            <div className="col-md-3 col-sm-6 mb-3"><SummaryCard title="Revisions" value={stats.revisions} icon="fa-code-branch" tone="warning" /></div>
            <div className="col-md-3 col-sm-6 mb-3"><SummaryCard title="Pending Proofs" value={stats.proofs} icon="fa-check-circle" tone="success" /></div>
            <div className="col-md-3 col-sm-6 mb-3"><SummaryCard title="Payment Ordered" value={stats.paymentOrdered} icon="fa-shopping-cart" tone="info" /></div>
          </div>

          {/* Search Bar */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-4">
              <div className="input-group" style={{ maxWidth: "400px" }}>
                <div className="input-group-prepend">
                  <span className="input-group-text bg-white border-right-0" style={{ borderRadius: "999px 0 0 999px" }}><i className="fas fa-search text-muted"></i></span>
                </div>
                <input type="text" className="form-control border-left-0" placeholder="Search by title, ISBN, or year..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} style={{ borderRadius: "0 999px 999px 0" }} />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white border-0 px-4 py-3">
              <div className="d-flex justify-content-between align-items-center flex-wrap">
                <div className="small text-muted">Showing {paginatedRows.length} of {sortedRows.length} manuscript(s)</div>
                <div className="d-flex align-items-center gap-2">
                  <span className="small text-muted">Rows per page</span>
                  <select className="form-control form-control-sm" style={{ width: 70 }} value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
                    {PAGE_SIZE_OPTIONS.map(size => <option key={size} value={size}>{size}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-primary mb-3"></div><div className="text-muted">Loading submissions...</div></div>
              ) : paginatedRows.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle" style={{ width: 80, height: 80, background: "rgba(13,110,253,0.10)" }}><i className={`fas ${config.icon} fa-2x text-primary`}></i></div>
                  <h4 className="font-weight-bold">{config.empty}</h4>
                  <Link className="btn btn-primary rounded-pill px-4 mt-3" to="/ebook/submissions/create"><i className="fas fa-plus mr-2"></i>New Submission</Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead style={{ background: "#f8fafc" }}>
                      <tr>
                        <th style={{ cursor: "pointer" }} onClick={() => handleSort("title")}>Title {sortIcon("title")}</th>
                        <th style={{ cursor: "pointer", width: 140 }} onClick={() => handleSort("status")}>Status {sortIcon("status")}</th>
                        <th style={{ width: 140 }}>Payment</th>
                        <th style={{ width: 120 }}>Year</th>
                        <th style={{ cursor: "pointer", width: 170 }} onClick={() => handleSort("updated_at")}>Last Updated {sortIcon("updated_at")}</th>
                        <th style={{ width: 170 }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRows.map((row) => {
                        const primaryAction = getPrimaryAction(stage, row);
                        const isPaymentOrdered = row.payment_status?.toLowerCase() === "payment_ordered" || row.status?.toLowerCase() === "payment_ordered";
                        return (
                          <tr key={row.id} style={isPaymentOrdered ? { background: "#fefce8" } : {}}>
                            <td><div className="font-weight-bold">{row.title || "Untitled"}</div><small className="text-muted">{row.abstract?.substring(0, 60)}...</small></td>
                            <td><StatusBadge value={row.status} /></td>
                            <td>{row.payment_status ? <StatusBadge value={row.payment_status} /> : <span className="text-muted">—</span>}</td>
                            <td><span className="badge badge-info">{row.publication_year || "—"}</span></td>
                            <td><small>{formatDate(row.updated_at || row.created_at)}</small></td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button className="btn btn-outline-primary" onClick={() => setSelectedSubmission(row)} title="Quick View"><i className="fas fa-eye"></i></button>
                                <Link className={`btn ${primaryAction.className}`} to={primaryAction.to}><i className={`fas ${primaryAction.icon}`}></i></Link>
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
            {!loading && sortedRows.length > 0 && (
              <div className="card-footer bg-white border-0 px-4 py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="small text-muted">Page {currentPage} of {totalPages}</div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-secondary" disabled={currentPage <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}><i className="fas fa-chevron-left mr-1"></i>Prev</button>
                    <button className="btn btn-sm btn-outline-secondary" disabled={currentPage >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next<i className="fas fa-chevron-right ml-1"></i></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <SubmissionModal isOpen={!!selectedSubmission} onClose={() => setSelectedSubmission(null)} submission={selectedSubmission} stage={stage} />
      </div>
    </MainLayout>
  );
}