import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout.jsx";
import ebookApi from "../../api/ebookApi.js";
import StatusBadge from "./components/StatusBadge.jsx";

const STAGE_CONFIG = {
  screening: {
    heading: "Editorial Screening Queue",
    subtitle:
      "Review newly submitted manuscripts for scope, completeness, quality, and originality before moving them forward.",
    empty: "No new submissions are waiting for screening.",
    query: { stage: "screening" },
    actionLabel: "Start Screening",
  },
  screened: {
    heading: "Screened Manuscripts",
    subtitle:
      "These manuscripts passed editorial screening and are ready for reviewer assignment.",
    empty: "No screened manuscripts are waiting for reviewer assignment.",
    query: { stage: "screened" },
    actionLabel: "Assign Reviewer",
  },
  reviews: {
    heading: "Review Monitoring",
    subtitle:
      "Manuscripts currently under review. Track assignments, due dates, and submitted feedback.",
    empty: "No manuscripts are currently under review.",
    query: { stage: "reviews" },
    actionLabel: "Manage Reviews",
  },
  decision: {
    heading: "Decision Queue",
    subtitle:
      "Submissions with completed reviewer feedback, ready for editorial decision.",
    empty: "No reviewed manuscripts are waiting for editorial decision.",
    query: { stage: "decision" },
    actionLabel: "Open Decision",
  },
  handoff: {
    heading: "Accepted & Handoff Queue",
    subtitle:
      "Accepted titles moving toward finance clearance and production handoff.",
    empty: "No accepted manuscripts are waiting for handoff.",
    query: { stage: "handoff" },
    actionLabel: "Open Handoff",
  },
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

const defaultScreeningForm = {
  relevance_score: 0,
  quality_score: 0,
  scope_match: "yes",
  plagiarism_check: "pending",
  formatting_check: "pass",
  completeness_check: "pass",
  language_check: "pass",
  recommended_action: "screened",
  comments: "",
};

function ScreeningModal({
  row,
  detail,
  workflow,
  busy,
  form,
  setForm,
  onClose,
  onSubmitDecision,
}) {
  const source = detail || row || {};

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      role="dialog"
      style={{ background: "rgba(0,0,0,0.45)" }}
    >
      <div className="modal-dialog modal-xl modal-dialog-scrollable" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <div>
              <h5 className="modal-title mb-1">Editorial Screening</h5>
              <div className="text-muted small">
                Check scope, completeness, formatting, language, and quality before deciding the next action.
              </div>
            </div>
            <button
              type="button"
              className="close border-0 bg-transparent"
              onClick={onClose}
              disabled={busy}
            >
              <span>&times;</span>
            </button>
          </div>

          <div className="modal-body">
            <div className="row">
              <div className="col-md-6">
                <div className="table-responsive mb-3">
                  <table className="table table-bordered table-sm mb-0">
                    <tbody>
                      <tr>
                        <th style={{ width: 220 }}>Title</th>
                        <td>{source.title || "—"}</td>
                      </tr>
                      <tr>
                        <th>Subtitle</th>
                        <td>{source.subtitle || "—"}</td>
                      </tr>
                      <tr>
                        <th>Author</th>
                        <td>{source.author_name || "—"}</td>
                      </tr>
                      <tr>
                        <th>Current Status</th>
                        <td>
                          <StatusBadge value={source.status} />
                        </td>
                      </tr>
                      <tr>
                        <th>Category</th>
                        <td>{source.category || "—"}</td>
                      </tr>
                      <tr>
                        <th>Language</th>
                        <td>{source.language || "—"}</td>
                      </tr>
                      <tr>
                        <th>Publication Year</th>
                        <td>{source.publication_year || "—"}</td>
                      </tr>
                      <tr>
                        <th>Target Audience</th>
                        <td>{source.target_audience || "—"}</td>
                      </tr>
                      <tr>
                        <th>Keywords</th>
                        <td>
                          {Array.isArray(source.keywords) && source.keywords.length
                            ? source.keywords.join(", ")
                            : "—"}
                        </td>
                      </tr>
                      <tr>
                        <th>Submitted</th>
                        <td>{formatDate(source.submitted_at || source.created_at)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mb-3">
                  <h6>Abstract</h6>
                  <div className="border rounded p-3 bg-light" style={{ minHeight: 130 }}>
                    {source.abstract || "No abstract provided."}
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card card-outline card-primary mb-3">
                  <div className="card-header">
                    <h3 className="card-title mb-0">Screening Checklist</h3>
                  </div>
                  <div className="card-body">
                    <div className="form-group">
                      <label>Scope Match</label>
                      <select
                        className="form-control"
                        value={form.scope_match}
                        onChange={(e) => updateField("scope_match", e.target.value)}
                        disabled={busy}
                      >
                        <option value="yes">Yes - fits publisher scope</option>
                        <option value="partial">Partial - needs clarification</option>
                        <option value="no">No - outside scope</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Completeness Check</label>
                      <select
                        className="form-control"
                        value={form.completeness_check}
                        onChange={(e) => updateField("completeness_check", e.target.value)}
                        disabled={busy}
                      >
                        <option value="pass">Pass</option>
                        <option value="minor_issue">Minor Issue</option>
                        <option value="fail">Fail</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Formatting Check</label>
                      <select
                        className="form-control"
                        value={form.formatting_check}
                        onChange={(e) => updateField("formatting_check", e.target.value)}
                        disabled={busy}
                      >
                        <option value="pass">Pass</option>
                        <option value="minor_issue">Minor Issue</option>
                        <option value="fail">Fail</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Language Quality</label>
                      <select
                        className="form-control"
                        value={form.language_check}
                        onChange={(e) => updateField("language_check", e.target.value)}
                        disabled={busy}
                      >
                        <option value="pass">Pass</option>
                        <option value="minor_issue">Minor Issue</option>
                        <option value="fail">Fail</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Plagiarism / Originality Check</label>
                      <select
                        className="form-control"
                        value={form.plagiarism_check}
                        onChange={(e) => updateField("plagiarism_check", e.target.value)}
                        disabled={busy}
                      >
                        <option value="pending">Pending</option>
                        <option value="clear">Clear</option>
                        <option value="flagged">Flagged</option>
                      </select>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Relevance Score (0-10)</label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            className="form-control"
                            value={form.relevance_score}
                            onChange={(e) =>
                              updateField("relevance_score", Number(e.target.value || 0))
                            }
                            disabled={busy}
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Quality Score (0-10)</label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            className="form-control"
                            value={form.quality_score}
                            onChange={(e) =>
                              updateField("quality_score", Number(e.target.value || 0))
                            }
                            disabled={busy}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-group mb-0">
                      <label>Screening Comments</label>
                      <textarea
                        rows="5"
                        className="form-control"
                        placeholder="Write editorial screening notes here..."
                        value={form.comments}
                        onChange={(e) => updateField("comments", e.target.value)}
                        disabled={busy}
                      />
                    </div>
                  </div>
                </div>

                <div className="card card-outline card-light">
                  <div className="card-header">
                    <h3 className="card-title mb-0">Workflow History</h3>
                  </div>
                  <div className="card-body">
                    {!workflow?.history?.length ? (
                      <div className="text-muted small">No workflow history yet.</div>
                    ) : (
                      <div style={{ maxHeight: 220, overflowY: "auto" }}>
                        {workflow.history.map((item, index) => (
                          <div
                            key={item.history_id || index}
                            className="border rounded p-2 mb-2"
                          >
                            <div className="font-weight-bold small">
                              {item.action || "workflow update"}
                            </div>
                            <div className="small text-muted">
                              {formatDate(item.acted_at || item.created_at)}
                            </div>
                            <div className="small">{item.note || "—"}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer d-flex justify-content-between flex-wrap" style={{ gap: 8 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={busy}
            >
              Close
            </button>

            <div className="d-flex flex-wrap" style={{ gap: 8 }}>
              <button
                type="button"
                className="btn btn-warning"
                disabled={busy}
                onClick={() => onSubmitDecision("revision_requested")}
              >
                {busy ? "Saving..." : "Request Revision"}
              </button>

              <button
                type="button"
                className="btn btn-danger"
                disabled={busy}
                onClick={() => onSubmitDecision("reject")}
              >
                {busy ? "Saving..." : "Reject Manuscript"}
              </button>

              <button
                type="button"
                className="btn btn-success"
                disabled={busy}
                onClick={() => onSubmitDecision("screened")}
              >
                {busy ? "Saving..." : "Mark as Screened"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EbookEditorStageListPage({ stage = "screening" }) {
  const config = STAGE_CONFIG[stage] || STAGE_CONFIG.screening;

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [rows, setRows] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [serverSearch, setServerSearch] = useState("");
  const [sortBy, setSortBy] = useState("updated_at");
  const [sortDir, setSortDir] = useState("desc");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [screeningForm, setScreeningForm] = useState(defaultScreeningForm);

  const load = async (nextSearch = "") => {
    setLoading(true);
    setError("");

    try {
      const data = await ebookApi.getEditorQueue({
        ...(config.query || {}),
        search: nextSearch,
      });

      setRows(Array.isArray(data?.rows) ? data.rows : []);
      setPage(1);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load editor stage queue.");
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
      if (["title", "status", "payment_status", "author_name"].includes(sortBy)) {
        const aa = String(a?.[sortBy] || "").toLowerCase();
        const bb = String(b?.[sortBy] || "").toLowerCase();
        if (aa < bb) return sortDir === "asc" ? -1 : 1;
        if (aa > bb) return sortDir === "asc" ? 1 : -1;
        return 0;
      }

      if (["assignment_count", "review_count", "overdue_assignment_count"].includes(sortBy)) {
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

  const openScreening = async (row) => {
    setBusy(true);
    setError("");

    try {
      const [detail, workflow] = await Promise.all([
        ebookApi.getSubmission(row.submission_id),
        ebookApi.getWorkflow(row.submission_id),
      ]);

      setSelectedRow(row);
      setSelectedDetail(detail);
      setSelectedWorkflow(workflow);
      setScreeningForm({
        ...defaultScreeningForm,
        comments: "",
        recommended_action: "screened",
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to open submission for screening.");
    } finally {
      setBusy(false);
    }
  };

  const closeModal = () => {
    setSelectedRow(null);
    setSelectedDetail(null);
    setSelectedWorkflow(null);
    setScreeningForm(defaultScreeningForm);
  };

  const decisionMessage = (decision) => {
    if (decision === "screened") return "Submission moved to screened list.";
    if (decision === "revision_requested") return "Revision has been requested from the author.";
    if (decision === "reject")
      return "Submission rejected and moved to the author rejected list.";
    return "Screening decision saved.";
  };

  const decisionNote = (decision, comments) => {
    if (comments?.trim()) return comments.trim();
    if (decision === "screened")
      return "Passed initial editorial screening and moved to screened list.";
    if (decision === "revision_requested")
      return "Returned to author for revision after editorial screening.";
    if (decision === "reject") return "Rejected during editorial screening.";
    return "Editorial screening completed.";
  };

  const doScreeningAction = async (decision) => {
    if (!selectedRow) return;

    setBusy(true);
    setError("");
    setNotice("");

    try {
      await ebookApi.screening(selectedRow.submission_id, {
        decision,
        relevance_score: screeningForm.relevance_score,
        quality_score: screeningForm.quality_score,
        scope_match: screeningForm.scope_match,
        plagiarism_check: screeningForm.plagiarism_check,
        formatting_check: screeningForm.formatting_check,
        completeness_check: screeningForm.completeness_check,
        language_check: screeningForm.language_check,
        recommended_action: decision,
        comments: screeningForm.comments,
        note: decisionNote(decision, screeningForm.comments),
      });

      setNotice(decisionMessage(decision));
      closeModal();
      await load(serverSearch);
    } catch (err) {
      setError(err?.response?.data?.message || "Screening action failed.");
    } finally {
      setBusy(false);
    }
  };

  const sortIcon = (column) =>
    sortBy !== column ? "↕" : sortDir === "asc" ? "↑" : "↓";

  return (
    <MainLayout>
      <section className="content-header mb-3">
        <h1 className="mb-1">{config.heading}</h1>
        <p className="text-muted mb-0">{config.subtitle}</p>
      </section>

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {notice ? <div className="alert alert-success">{notice}</div> : null}

      <div className="card card-secondary card-outline">
        <div className="card-header">
          <form
            className="d-flex justify-content-between align-items-center flex-wrap w-100"
            onSubmit={handleSearch}
            style={{ gap: 8 }}
          >
           <div className="d-flex align-items-center flex-wrap" style={{ gap: 8 }}>
  <Link
    className={`btn ${
      stage === "screening" ? "btn-primary" : "btn-outline-primary"
    }`}
    to="/ebook/editor/screening"
  >
    Screening Queue
  </Link>

  <Link
    className={`btn ${
      stage === "screened" ? "btn-primary" : "btn-outline-primary"
    }`}
    to="/ebook/editor/screened"
  >
    Screened
  </Link>

  <Link
    className={`btn ${
      stage === "reviews" ? "btn-primary" : "btn-outline-primary"
    }`}
    to="/ebook/editor/reviews"
  >
    Under Review
  </Link>

  <Link
    className={`btn ${
      stage === "decision" ? "btn-primary" : "btn-outline-primary"
    }`}
    to="/ebook/editor/decision"
  >
    Decision Queue
  </Link>

  <Link
    className={`btn ${
      stage === "handoff" ? "btn-primary" : "btn-outline-primary"
    }`}
    to="/ebook/editor/handoff"
  >
    Handoff
  </Link>
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

        <div
          className="card-body border-bottom d-flex justify-content-between align-items-center flex-wrap"
          style={{ gap: 8 }}
        >
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
                <th style={{ cursor: "pointer", width: 180 }} onClick={() => handleSort("author_name")}>
                  Author {sortIcon("author_name")}
                </th>
                <th
                  style={{ cursor: "pointer", width: 110 }}
                  onClick={() => handleSort("assignment_count")}
                >
                  Assignments {sortIcon("assignment_count")}
                </th>
                <th
                  style={{ cursor: "pointer", width: 100 }}
                  onClick={() => handleSort("review_count")}
                >
                  Reviews {sortIcon("review_count")}
                </th>
                <th
                  style={{ cursor: "pointer", width: 160 }}
                  onClick={() => handleSort("updated_at")}
                >
                  Updated {sortIcon("updated_at")}
                </th>
                <th style={{ width: 180 }}>Action</th>
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
                      <div className="small text-muted">
                        {row.subtitle || row.abstract?.slice?.(0, 90) || "No subtitle"}
                      </div>
                    </td>

                    <td>
                      <StatusBadge value={row.status} />
                    </td>

                    <td>
                      <div>{row.author_name || "—"}</div>
                      <div className="small text-muted">{row.author_email || ""}</div>
                    </td>

                    <td>{row.assignment_count || 0}</td>
                    <td>{row.review_count || 0}</td>
                    <td className="small text-muted">
                      {formatDate(row.updated_at || row.created_at)}
                    </td>

                   <td>
  {stage === "screening" ? (
    <button
      className="btn btn-primary btn-sm"
      onClick={() => openScreening(row)}
    >
      Start Screening
    </button>
  ) : stage === "screened" ? (
    <Link
      className="btn btn-warning btn-sm"
      to={`/ebook/reviewer-manager?submissionId=${row.submission_id}`}
    >
      Assign Reviewer
    </Link>
  ) : stage === "reviews" ? (
    <Link
      className="btn btn-outline-warning btn-sm"
      to={`/ebook/reviewer-manager?submissionId=${row.submission_id}`}
    >
      Manage Reviews
    </Link>
  ) : stage === "decision" ? (
    <Link
      className="btn btn-outline-primary btn-sm"
      to={`/ebook/editor/decision?submissionId=${row.submission_id}`}
    >
      Open Decision
    </Link>
  ) : (
    <Link
      className="btn btn-outline-success btn-sm"
      to={`/ebook/submissions/${row.submission_id}`}
    >
      Open Handoff
    </Link>
  )}
</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {stage === "screening" && selectedRow ? (
        <ScreeningModal
          row={selectedRow}
          detail={selectedDetail}
          workflow={selectedWorkflow}
          busy={busy}
          form={screeningForm}
          setForm={setScreeningForm}
          onClose={closeModal}
          onSubmitDecision={doScreeningAction}
        />
      ) : null}
    </MainLayout>
  );
}