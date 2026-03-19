import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout.jsx";
import ebookApi from "../../api/ebook.api";
import StatusBadge from "./components/StatusBadge.jsx";

const STAGE_CONFIG = {
  screening: {
    heading: "Editorial Screening",
    subtitle:
      "New and returned manuscripts waiting for scope check, completeness validation, and next-step routing.",
    empty: "No submissions are waiting for editorial screening.",
    query: { stage: "screening" },
  },
  reviews: {
    heading: "Review Monitoring",
    subtitle:
      "Manuscripts under review. Track assignments, overdue reviewers, and submitted feedback.",
    empty: "No manuscripts are currently under review.",
    query: { stage: "reviews" },
  },
  handoff: {
    heading: "Accepted & Handoff Queue",
    subtitle:
      "Accepted titles moving toward finance clearance and production handoff.",
    empty: "No accepted manuscripts are waiting for handoff.",
    query: { stage: "handoff" },
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
  if (stage === "screening") {
    return {
      label: "Open Screening",
      className: "btn btn-primary",
      to: `/ebook/submissions/${row.submission_id}`,
    };
  }
  if (stage === "reviews") {
    return {
      label: "Manage Reviewers",
      className: "btn btn-warning",
      to: `/ebook/reviewer-manager?submissionId=${row.submission_id}`,
    };
  }
  return {
    label: "Open Handoff",
    className: "btn btn-success",
    to: `/ebook/submissions/${row.submission_id}`,
  };
}

export default function EbookEditorStageListPage({ stage = "screening" }) {
  const config = STAGE_CONFIG[stage] || STAGE_CONFIG.screening;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [serverSearch, setServerSearch] = useState("");
  const [overdueOnly, setOverdueOnly] = useState(false);

  const [sortBy, setSortBy] = useState("updated_at");
  const [sortDir, setSortDir] = useState("desc");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const [selectedRow, setSelectedRow] = useState(null);

  const load = async (nextSearch = "") => {
    setLoading(true);
    setError("");
    try {
      const data = await ebookApi.getEditorQueue({
        ...(config.query || {}),
        search: nextSearch,
        overdue_only: overdueOnly ? "true" : "",
      });
      setRows(Array.isArray(data?.rows) ? data.rows : []);
      setPage(1);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to load editor stage queue."
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
  }, [stage, overdueOnly]);

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
      if (sortBy === "title" || sortBy === "status" || sortBy === "payment_status") {
        const aa = String(a?.[sortBy] || "").toLowerCase();
        const bb = String(b?.[sortBy] || "").toLowerCase();
        if (aa < bb) return sortDir === "asc" ? -1 : 1;
        if (aa > bb) return sortDir === "asc" ? 1 : -1;
        return 0;
      }

      if (
        ["assignment_count", "review_count", "overdue_assignment_count"].includes(sortBy)
      ) {
        const aa = Number(a?.[sortBy] || 0);
        const bb = Number(b?.[sortBy] || 0);
        return sortDir === "asc" ? aa - bb : bb - aa;
      }

      const aa = a?.[sortBy] ? new Date(a[sortBy]).getTime() : 0;
      const bb = b?.[sortBy] ? new Date(b[sortBy]).getTime() : 0;
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
            <div className="d-flex align-items-center flex-wrap" style={{ gap: 8 }}>
              <Link className="btn btn-outline-primary" to="/ebook/reviewer-manager">
                Reviewer Manager
              </Link>

              <div className="form-check d-flex align-items-center px-2 mb-0">
                <input
                  id="editorOverdueOnly"
                  className="form-check-input mr-2"
                  type="checkbox"
                  checked={overdueOnly}
                  onChange={(e) => setOverdueOnly(e.target.checked)}
                />
                <label htmlFor="editorOverdueOnly" className="form-check-label">
                  Overdue only
                </label>
              </div>
            </div>

            <div className="d-flex align-items-center flex-wrap" style={{ gap: 8 }}>
              <input
                className="form-control"
                style={{ minWidth: 260 }}
                placeholder="Search title, author, abstract"
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
                <th style={{ cursor: "pointer", width: 150 }} onClick={() => handleSort("status")}>
                  Status {sortIcon("status")}
                </th>
                <th style={{ cursor: "pointer", width: 120 }} onClick={() => handleSort("assignment_count")}>
                  Assignments {sortIcon("assignment_count")}
                </th>
                <th style={{ cursor: "pointer", width: 100 }} onClick={() => handleSort("review_count")}>
                  Reviews {sortIcon("review_count")}
                </th>
                <th style={{ cursor: "pointer", width: 100 }} onClick={() => handleSort("overdue_assignment_count")}>
                  Overdue {sortIcon("overdue_assignment_count")}
                </th>
                <th style={{ cursor: "pointer", width: 170 }} onClick={() => handleSort("payment_status")}>
                  Payment / Proof {sortIcon("payment_status")}
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
                  <td colSpan="8" className="text-center py-4">
                    Loading…
                  </td>
                </tr>
              ) : !paginatedRows.length ? (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-4">
                    {config.empty}
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => (
                  <tr key={row.submission_id}>
                    <td>
                      <div className="font-weight-bold">{row.title}</div>
                      <small className="text-muted">
                        {row.author_name || "—"} •{" "}
                        {Array.isArray(row.reviewer_names) && row.reviewer_names.length
                          ? row.reviewer_names.join(", ")
                          : "No reviewers yet"}
                      </small>
                    </td>

                    <td>
                      <StatusBadge value={row.status} />
                    </td>

                    <td>{row.assignment_count || 0}</td>
                    <td>{row.review_count || 0}</td>
                    <td>{row.overdue_assignment_count || 0}</td>

                    <td>
                      <div>
                        <StatusBadge value={row.payment_status || "pending"} />
                      </div>
                      <small className="d-block text-muted">
                        {row.proof_sent_to_author
                          ? row.author_proof_approved
                            ? "Proof approved"
                            : "Proof waiting"
                          : "Proof not sent"}
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
                          <th>Author</th>
                          <td>{selectedRow.author_name || "—"}</td>
                        </tr>
                        <tr>
                          <th>Status</th>
                          <td>
                            <StatusBadge value={selectedRow.status} />
                          </td>
                        </tr>
                        <tr>
                          <th>Assignments</th>
                          <td>{selectedRow.assignment_count || 0}</td>
                        </tr>
                        <tr>
                          <th>Reviews</th>
                          <td>{selectedRow.review_count || 0}</td>
                        </tr>
                        <tr>
                          <th>Overdue</th>
                          <td>{selectedRow.overdue_assignment_count || 0}</td>
                        </tr>
                        <tr>
                          <th>Reviewers</th>
                          <td>
                            {Array.isArray(selectedRow.reviewer_names) &&
                            selectedRow.reviewer_names.length
                              ? selectedRow.reviewer_names.join(", ")
                              : "No reviewers yet"}
                          </td>
                        </tr>
                        <tr>
                          <th>Payment</th>
                          <td>
                            <StatusBadge value={selectedRow.payment_status || "pending"} />
                          </td>
                        </tr>
                        <tr>
                          <th>Proof</th>
                          <td>
                            {selectedRow.proof_sent_to_author
                              ? selectedRow.author_proof_approved
                                ? "Proof approved"
                                : "Proof waiting"
                              : "Proof not sent"}
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
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setSelectedRow(null)}
                  >
                    Close
                  </button>

                  <div className="d-flex" style={{ gap: 8 }}>
                    <Link
                      className="btn btn-outline-primary"
                      to={`/ebook/submissions/${selectedRow.submission_id}`}
                    >
                      View Detail
                    </Link>

                    {primaryAction ? (
                      <Link className={primaryAction.className} to={primaryAction.to}>
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