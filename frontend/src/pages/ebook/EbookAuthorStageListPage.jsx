import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout.jsx";
import ebookApi from "../../api/ebook.api";
import StatusBadge from "./components/StatusBadge.jsx";

const STAGE_CONFIG = {
  all: {
    heading: "My Submissions",
    subtitle:
      "List of all your submissions, including drafts. Open a submission to continue editing or review workflow details.",
    empty: "You have no submissions yet.",
    query: {},
  },
  drafts: {
    heading: "My Drafts",
    subtitle: "Continue unfinished submissions.",
    empty: "You have no draft submissions.",
    query: { status: "draft" },
  },
  revisions: {
    heading: "Revision Requests",
    subtitle: "Editor-requested revisions only.",
    empty: "No submissions are waiting for revision.",
    query: { stage: "revisions" },
  },
  payments: {
    heading: "Payments & Waivers",
    subtitle: "Submissions waiting for payment.",
    empty: "No submissions need payment.",
    query: { stage: "payments" },
  },
  proofs: {
    heading: "Proof Approvals",
    subtitle: "Approve final proofs.",
    empty: "No submissions need proof approval.",
    query: { stage: "proofs" },
  },
  rejected: {
    heading: "Rejected by Editor",
    subtitle: "Submissions closed by editorial decision.",
    empty: "No submissions have been rejected by the editor.",
    query: { status: "rejected" },
  },
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString();
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
    };
  }
  if (stage === "revisions") {
    return {
      label: "Open Revision",
      className: "btn btn-warning",
      to: `/ebook/submissions/${row.submission_id}/review-comments`,
    };
  }
  if (stage === "payments") {
    return {
      label: "Open Payment",
      className: "btn btn-danger",
      to: `/ebook/submissions/${row.submission_id}/payment`,
    };
  }
  if (stage === "proofs") {
    return {
      label: "Open Proof",
      className: "btn btn-success",
      to: `/ebook/submissions/${row.submission_id}/proof-approval`,
    };
  }
  return {
    label: "Open Detail",
    className: "btn btn-outline-primary",
    to: `/ebook/submissions/${row.submission_id}`,
  };
}

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

  const [selectedRow, setSelectedRow] = useState(null);

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
      setError(err?.response?.data?.message || "Failed to load submissions.");
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

      if (sortBy === "title" || sortBy === "status" || sortBy === "payment_status") {
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

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  const sortIcon = (column) => {
    if (sortBy !== column) return "↕";
    return sortDir === "asc" ? "↑" : "↓";
    };

  const primaryAction = selectedRow ? getPrimaryAction(stage, selectedRow) : null;

  return (
    <MainLayout>
      <section className="content-header mb-3">
        <h1 className="mb-1">{config.heading}</h1>
        <p className="text-muted mb-0">{config.subtitle}</p>
      </section>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="card card-secondary card-outline">
      <div className="card-header">
  <form
    className="d-flex justify-content-between align-items-center flex-wrap w-100"
    onSubmit={handleSearch}
    style={{ gap: 8 }}
  >
    {/* ✅ LEFT SIDE → Create button */}
    <div>
      <Link className="btn btn-primary" to="/ebook/submissions/create">
        + Create Submission
      </Link>
    </div>

    {/* ✅ RIGHT SIDE → Search */}
    <div className="d-flex align-items-center" style={{ gap: 8 }}>
      <input
        className="form-control"
        style={{ minWidth: 260 }}
        placeholder="Search title, abstract, keywords"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />

      <button className="btn btn-outline-primary" type="submit">
        Search
      </button>
    </div>
  </form>
</div>

        <div className="card-body border-bottom d-flex justify-content-between align-items-center flex-wrap" style={{ gap: 8 }}>
          <div className="text-muted small">
            Showing {rows.length ? (currentPage - 1) * pageSize + 1 : 0}–
            {Math.min(currentPage * pageSize, sortedRows.length)} of {sortedRows.length}
            {serverSearch ? ` results for "${serverSearch}"` : ""}
          </div>

          <div className="d-flex align-items-center" style={{ gap: 8 }}>
            <label className="mb-0 small text-muted">Rows</label>
            <select
              className="form-control form-control-sm"
              style={{ width: 90 }}
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

        <div className="card-body table-responsive p-0">
          <table className="table table-bordered table-hover mb-0">
            <thead>
              <tr>
                <th style={{ cursor: "pointer" }} onClick={() => handleSort("title")}>
                  Title {sortIcon("title")}
                </th>
                <th style={{ cursor: "pointer", width: 140 }} onClick={() => handleSort("status")}>
                  Status {sortIcon("status")}
                </th>
                <th style={{ cursor: "pointer", width: 170 }} onClick={() => handleSort("payment_status")}>
                  Payment {sortIcon("payment_status")}
                </th>
                <th style={{ width: 140 }}>Proof</th>
                <th style={{ cursor: "pointer", width: 120 }} onClick={() => handleSort("file_count")}>
                  Files {sortIcon("file_count")}
                </th>
                <th style={{ cursor: "pointer", width: 140 }} onClick={() => handleSort("updated_at")}>
                  Updated {sortIcon("updated_at")}
                </th>
                <th style={{ width: 110 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    Loading…
                  </td>
                </tr>
              ) : !paginatedRows.length ? (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    {config.empty}
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => (
                  <tr key={row.submission_id}>
                    <td>
                      <div className="font-weight-bold">{row.title}</div>
                      <small className="text-muted">
                        {row.category || "—"} • {row.language || "—"}
                      </small>
                    </td>

                    <td>
                      <StatusBadge value={row.status} />
                    </td>

                    <td>
                      {row.amount_due || row.payment_status ? (
                        <>
                          <div>
                            <StatusBadge value={row.payment_status || "pending"} />
                          </div>
                          <small className="d-block text-muted">
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
                          <div>
                            <StatusBadge
                              value={row.author_proof_approved ? "approved" : "pending"}
                            />
                          </div>
                          <small className="d-block text-muted">
                            {row.author_proof_approved ? "Approved" : "Waiting"}
                          </small>
                        </>
                      ) : (
                        <span className="text-muted">Not ready</span>
                      )}
                    </td>

                    <td>
                      <div>{row.file_count || 0}</div>
                      <small className="text-muted">
                        {Array.isArray(row.file_roles) && row.file_roles.length
                          ? row.file_roles.join(", ")
                          : "No files"}
                      </small>
                    </td>

                    <td>{formatDate(row.updated_at || row.submitted_at || row.accepted_at)}</td>

                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setSelectedRow(row)}
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="card-footer d-flex justify-content-between align-items-center flex-wrap" style={{ gap: 8 }}>
          <div className="small text-muted">
            Page {currentPage} of {totalPages}
          </div>

          <div className="btn-group">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedRow ? (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-lg modal-dialog-scrollable" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Submission Action</h5>
                  <button
                    type="button"
                    className="close"
                    onClick={() => setSelectedRow(null)}
                  >
                    <span>&times;</span>
                  </button>
                </div>

                <div className="modal-body">
                  <div className="table-responsive">
                    <table className="table table-bordered mb-0">
                      <tbody>
                        <tr>
                          <th style={{ width: 180 }}>Title</th>
                          <td>{selectedRow.title || "—"}</td>
                        </tr>
                        <tr>
                          <th>Subtitle</th>
                          <td>{selectedRow.subtitle || "—"}</td>
                        </tr>
                        <tr>
                          <th>Status</th>
                          <td>
                            <StatusBadge value={selectedRow.status} />
                          </td>
                        </tr>
                        <tr>
                          <th>Category</th>
                          <td>{selectedRow.category || "—"}</td>
                        </tr>
                        <tr>
                          <th>Language</th>
                          <td>{selectedRow.language || "—"}</td>
                        </tr>
                        <tr>
                          <th>Payment</th>
                          <td>
                            {selectedRow.payment_status ? (
                              <>
                                <StatusBadge value={selectedRow.payment_status} />
                                <span className="ml-2">
                                  {selectedRow.amount_due || 0}{" "}
                                  {selectedRow.currency_code || "ETB"}
                                </span>
                              </>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>Proof</th>
                          <td>
                            {selectedRow.proof_sent_to_author
                              ? selectedRow.author_proof_approved
                                ? "Author approved"
                                : "Waiting for author"
                              : "Not ready"}
                          </td>
                        </tr>
                        <tr>
                          <th>Files</th>
                          <td>
                            {selectedRow.file_count || 0}
                            {Array.isArray(selectedRow.file_roles) &&
                            selectedRow.file_roles.length
                              ? ` (${selectedRow.file_roles.join(", ")})`
                              : ""}
                          </td>
                        </tr>
                        <tr>
                          <th>Updated</th>
                          <td>
                            {formatDate(
                              selectedRow.updated_at ||
                                selectedRow.submitted_at ||
                                selectedRow.accepted_at
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="modal-footer d-flex justify-content-between">
                  <div>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setSelectedRow(null)}
                    >
                      Close
                    </button>
                  </div>

                  <div className="d-flex" style={{ gap: 8 }}>
                    <Link
                      className="btn btn-outline-primary"
                      to={`/ebook/submissions/${selectedRow.submission_id}`}
                    >
                      View Detail
                    </Link>

                    {primaryAction ? (
                      <Link
                        className={primaryAction.className}
                        to={primaryAction.to}
                      >
                        {primaryAction.label}
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      ) : null}
    </MainLayout>
  );
}