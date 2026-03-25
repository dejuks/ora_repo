import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "../../components/layout/MainLayout.jsx";
import ebookApi from "../../api/ebook.api";
import StatusBadge from "./components/StatusBadge.jsx";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const API_BASE_URL =
  process.env.REACT_APP_API_URL?.replace(/\/api\/?$/, "") ||
  "http://localhost:5000";

const DECISION_FORM_DEFAULT = {
  decision: "accept",
  note: "",
};

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function buildFileUrl(filePath) {
  if (!filePath) return "#";
  if (/^https?:\/\//i.test(filePath)) return filePath;
  const normalizedPath = String(filePath).startsWith("/") ? filePath : `/${filePath}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

function sortIcon(sortBy, sortDir, column) {
  if (sortBy !== column) return "↕";
  return sortDir === "asc" ? "↑" : "↓";
}

function WorkflowBlock({ workflow }) {
  const history = workflow?.history || [];

  return (
    <div className="card card-outline card-light mb-3">
      <div className="card-header">
        <h3 className="card-title mb-0">Workflow History</h3>
      </div>
      <div className="card-body">
        {!history.length ? (
          <div className="text-muted small">No workflow history yet.</div>
        ) : (
          <div style={{ maxHeight: 260, overflowY: "auto" }}>
            {history.map((item, index) => (
              <div
                key={item.history_id || index}
                className="border rounded p-2 mb-2"
              >
                <div className="d-flex justify-content-between align-items-start flex-wrap">
                  <div className="font-weight-bold small">
                    {item.action || "workflow update"}
                  </div>
                  <div className="small text-muted">
                    {formatDate(item.acted_at || item.created_at)}
                  </div>
                </div>
                <div className="small text-muted mb-1">
                  {item.from_status || "—"} → {item.to_status || "—"}
                </div>
                <div className="small">{item.note || "—"}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilesBlock({ files }) {
  const manuscriptFiles = files?.manuscript_files || [];
  const reviewAttachments = files?.review_attachments || [];

  const FileItem = ({ file, badge, type }) => (
    <div className="border rounded p-3 mb-2">
      <div className="d-flex justify-content-between align-items-start">
        <div className="flex-grow-1 pr-2">
          <div className="font-weight-bold text-primary">
            {file.original_name || file.file_name || "File"}
          </div>
          <div className="small text-muted mt-1">
            <span className={`badge badge-${badge} mr-2`}>
              {type}
            </span>
            {file.file_role ? String(file.file_role).replace(/_/g, " ") : ""}
            {file.created_at ? ` • ${formatDate(file.created_at)}` : ""}
          </div>
        </div>
        <a
          className="btn btn-sm btn-outline-primary"
          href={buildFileUrl(file.file_path || file.url || file.path)}
          target="_blank"
          rel="noreferrer"
          download
        >
          Download
        </a>
      </div>
    </div>
  );

  return (
    <div className="row">
      <div className="col-md-6 mb-3">
        <div className="card card-outline card-light h-100">
          <div className="card-header">
            <h3 className="card-title mb-0">Manuscript Files</h3>
          </div>
          <div className="card-body">
            {!manuscriptFiles.length ? (
              <div className="text-muted small">No manuscript files available.</div>
            ) : (
              manuscriptFiles.map((file) => (
                <FileItem
                  key={file.file_id}
                  file={file}
                  badge="secondary"
                  type="Manuscript"
                />
              ))
            )}
          </div>
        </div>
      </div>

      <div className="col-md-6 mb-3">
        <div className="card card-outline card-light h-100">
          <div className="card-header">
            <h3 className="card-title mb-0">Review Attachments</h3>
          </div>
          <div className="card-body">
            {!reviewAttachments.length ? (
              <div className="text-muted small">No review attachments uploaded.</div>
            ) : (
              reviewAttachments.map((file) => (
                <FileItem
                  key={file.file_id}
                  file={file}
                  badge="info"
                  type="Review"
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SubmissionSummary({ detail }) {
  const source = detail || {};

  const Row = ({ label, value }) => (
    <tr>
      <th style={{ width: 220 }}>{label}</th>
      <td>{value || "—"}</td>
    </tr>
  );

  return (
    <div className="table-responsive mb-3">
      <table className="table table-bordered table-sm mb-0">
        <tbody>
          <Row label="Title" value={source.title} />
          <Row label="Subtitle" value={source.subtitle} />
          <Row label="Author" value={source.author_name} />
          <Row
            label="Submission Status"
            value={<StatusBadge value={source.status || source.submission_status} />}
          />
          <Row label="Category" value={source.category} />
          <Row label="Language" value={source.language} />
          <Row label="Publication Year" value={source.publication_year} />
          <Row label="Target Audience" value={source.target_audience} />
          <Row
            label="Keywords"
            value={
              Array.isArray(source.keywords) && source.keywords.length
                ? source.keywords.join(", ")
                : "—"
            }
          />
          <Row label="Submitted At" value={formatDate(source.submitted_at || source.created_at)} />
          <Row label="Updated At" value={formatDate(source.updated_at)} />
        </tbody>
      </table>
    </div>
  );
}

function ReviewsTable({ reviews }) {
  const rows = Array.isArray(reviews) ? reviews : [];

  return (
    <div className="card card-outline card-primary mb-3">
      <div className="card-header">
        <h3 className="card-title mb-0">Submitted Reviewer Feedback</h3>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-bordered table-hover mb-0">
            <thead>
              <tr>
                <th>Reviewer</th>
                <th>Recommendation</th>
                <th>Originality</th>
                <th>Quality</th>
                <th>Relevance</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {!rows.length ? (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-3">
                    No submitted reviews found.
                  </td>
                </tr>
              ) : (
                rows.map((review, index) => (
                  <tr key={review.review_id || review.assignment_id || index}>
                    <td>
                      <div>{review.reviewer_name || review.full_name || "—"}</div>
                      <div className="small text-muted">{review.reviewer_email || ""}</div>
                    </td>
                    <td>
                      <span className="badge badge-primary">
                        {String(review.recommendation || "—").replace(/_/g, " ")}
                      </span>
                    </td>
                    <td>{review.originality_score ?? "—"}</td>
                    <td>{review.quality_score ?? "—"}</td>
                    <td>{review.relevance_score ?? "—"}</td>
                    <td>{formatDate(review.submitted_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReviewCommentsBlock({ reviews }) {
  const rows = Array.isArray(reviews) ? reviews : [];

  return (
    <div className="card card-outline card-light mb-3">
      <div className="card-header">
        <h3 className="card-title mb-0">Reviewer Comments</h3>
      </div>
      <div className="card-body">
        {!rows.length ? (
          <div className="text-muted small">No review comments available.</div>
        ) : (
          rows.map((review, index) => (
            <div key={review.review_id || review.assignment_id || index} className="border rounded p-3 mb-3">
              <div className="d-flex justify-content-between align-items-start flex-wrap mb-2">
                <div className="font-weight-bold">
                  {review.reviewer_name || "Reviewer"}
                </div>
                <div className="small text-muted">
                  {formatDate(review.submitted_at)}
                </div>
              </div>

              <div className="mb-2">
                <span className="badge badge-primary">
                  {String(review.recommendation || "—").replace(/_/g, " ").toUpperCase()}
                </span>
              </div>

              <div className="mb-3">
                <div className="font-weight-bold small mb-1">Comments for Author</div>
                <div className="border rounded bg-light p-2 text-pre-wrap">
                  {review.comments_for_author || "—"}
                </div>
              </div>

              <div>
                <div className="font-weight-bold small mb-1">Confidential Comments</div>
                <div className="border rounded bg-light p-2 text-pre-wrap">
                  {review.confidential_comments || "—"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function DecisionModal({
  row,
  detail,
  workflow,
  files,
  reviews,
  form,
  setForm,
  busy,
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
              <h5 className="modal-title mb-1">Editorial Decision Workspace</h5>
              <div className="text-muted small">
                Review all submitted reviewer feedback and make the final editorial decision.
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
                <SubmissionSummary detail={source} />

                <div className="mb-3">
                  <h6>Abstract</h6>
                  <div className="border rounded p-3 bg-light" style={{ minHeight: 120 }}>
                    {source.abstract || "No abstract provided."}
                  </div>
                </div>

                <WorkflowBlock workflow={workflow} />
              </div>

              <div className="col-md-6">
                <div className="card card-outline card-success mb-3">
                  <div className="card-header">
                    <h3 className="card-title mb-0">Editor Decision Form</h3>
                  </div>
                  <div className="card-body">
                    <div className="form-group">
                      <label>Final Decision</label>
                      <select
                        className="form-control"
                        value={form.decision}
                        onChange={(e) => updateField("decision", e.target.value)}
                        disabled={busy}
                      >
                        <option value="accept">Accept</option>
                        <option value="minor_revision">Minor Revision</option>
                        <option value="major_revision">Major Revision</option>
                        <option value="reject">Reject</option>
                      </select>
                    </div>

                    <div className="form-group mb-0">
                      <label>Editor Decision Note</label>
                      <textarea
                        rows="6"
                        className="form-control"
                        placeholder="Write the final editorial decision note..."
                        value={form.note}
                        onChange={(e) => updateField("note", e.target.value)}
                        disabled={busy}
                      />
                    </div>
                  </div>
                </div>

                <div className="card card-outline card-light mb-3">
                  <div className="card-header">
                    <h3 className="card-title mb-0">Review Summary</h3>
                  </div>
                  <div className="card-body">
                    <div className="row text-center">
                      <div className="col-4">
                        <div className="border rounded p-3">
                          <div className="small text-muted">Assignments</div>
                          <div className="h4 mb-0">{row?.assignment_count || 0}</div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="border rounded p-3">
                          <div className="small text-muted">Submitted Reviews</div>
                          <div className="h4 mb-0">{row?.review_count || 0}</div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="border rounded p-3">
                          <div className="small text-muted">Overdue</div>
                          <div className="h4 mb-0">{row?.overdue_assignment_count || 0}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <ReviewsTable reviews={reviews} />
            <ReviewCommentsBlock reviews={reviews} />
            <FilesBlock files={files} />
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
                className="btn btn-success"
                disabled={busy}
                onClick={() => onSubmitDecision("accept")}
              >
                {busy ? "Saving..." : "Accept"}
              </button>

              <button
                type="button"
                className="btn btn-warning"
                disabled={busy}
                onClick={() => onSubmitDecision("minor_revision")}
              >
                {busy ? "Saving..." : "Minor Revision"}
              </button>

              <button
                type="button"
                className="btn btn-warning"
                disabled={busy}
                onClick={() => onSubmitDecision("major_revision")}
              >
                {busy ? "Saving..." : "Major Revision"}
              </button>

              <button
                type="button"
                className="btn btn-danger"
                disabled={busy}
                onClick={() => onSubmitDecision("reject")}
              >
                {busy ? "Saving..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EbookEditorDecisionQueuePage() {
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
  const [selectedFiles, setSelectedFiles] = useState({ manuscript_files: [], review_attachments: [] });
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [decisionForm, setDecisionForm] = useState(DECISION_FORM_DEFAULT);

  const load = async (nextSearch = "") => {
    setLoading(true);
    setError("");

    try {
      const data = await ebookApi.getEditorQueue({
        stage: "decision",
        search: nextSearch,
      });

      setRows(Array.isArray(data?.rows) ? data.rows : []);
      setPage(1);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load decision queue.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load("");
  }, []);

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
      if (["title", "status", "author_name"].includes(sortBy)) {
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

  const openDecisionModal = async (row) => {
    setBusy(true);
    setError("");

    try {
      const [detail, workflow, files, reviews] = await Promise.all([
        ebookApi.getSubmission(row.submission_id),
        ebookApi.getWorkflow(row.submission_id),
        ebookApi.getSubmissionFiles
          ? ebookApi.getSubmissionFiles(row.submission_id)
          : Promise.resolve({ manuscript_files: [], review_attachments: [] }),
        ebookApi.getSubmissionReviews
          ? ebookApi.getSubmissionReviews(row.submission_id)
          : Promise.resolve({ rows: [] }),
      ]);

      setSelectedRow(row);
      setSelectedDetail(detail);
      setSelectedWorkflow(workflow);
      setSelectedFiles(files || { manuscript_files: [], review_attachments: [] });
      setSelectedReviews(Array.isArray(reviews?.rows) ? reviews.rows : Array.isArray(reviews) ? reviews : []);
      setDecisionForm({
        decision: "accept",
        note: "",
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to open decision details.");
    } finally {
      setBusy(false);
    }
  };

  const closeModal = () => {
    setSelectedRow(null);
    setSelectedDetail(null);
    setSelectedWorkflow(null);
    setSelectedFiles({ manuscript_files: [], review_attachments: [] });
    setSelectedReviews([]);
    setDecisionForm(DECISION_FORM_DEFAULT);
  };

  const decisionMessage = (decision) => {
    if (decision === "accept") return "Submission accepted successfully.";
    if (decision === "minor_revision") return "Minor revision requested successfully.";
    if (decision === "major_revision") return "Major revision requested successfully.";
    if (decision === "reject") return "Submission rejected successfully.";
    return "Editorial decision saved successfully.";
  };

  const doDecisionAction = async (decision) => {
    if (!selectedRow) return;

    setBusy(true);
    setError("");
    setNotice("");

    try {
      await ebookApi.editorialDecision(selectedRow.submission_id, {
        decision,
        note: decisionForm.note?.trim() || "",
      });

      setNotice(decisionMessage(decision));
      closeModal();
      await load(serverSearch);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save editorial decision.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <MainLayout>
      <section className="content-header mb-3">
        <h1 className="mb-1">Editorial Decision Queue</h1>
        <p className="text-muted mb-0">
          Submissions with reviewer feedback ready for final editorial decision.
        </p>
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
            <div className="font-weight-bold">Decision List</div>

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
                  Title {sortIcon(sortBy, sortDir, "title")}
                </th>
                <th style={{ cursor: "pointer", width: 150 }} onClick={() => handleSort("status")}>
                  Status {sortIcon(sortBy, sortDir, "status")}
                </th>
                <th style={{ cursor: "pointer", width: 180 }} onClick={() => handleSort("author_name")}>
                  Author {sortIcon(sortBy, sortDir, "author_name")}
                </th>
                <th style={{ cursor: "pointer", width: 110 }} onClick={() => handleSort("assignment_count")}>
                  Assignments {sortIcon(sortBy, sortDir, "assignment_count")}
                </th>
                <th style={{ cursor: "pointer", width: 100 }} onClick={() => handleSort("review_count")}>
                  Reviews {sortIcon(sortBy, sortDir, "review_count")}
                </th>
                <th style={{ cursor: "pointer", width: 120 }} onClick={() => handleSort("overdue_assignment_count")}>
                  Overdue {sortIcon(sortBy, sortDir, "overdue_assignment_count")}
                </th>
                <th style={{ cursor: "pointer", width: 160 }} onClick={() => handleSort("updated_at")}>
                  Updated {sortIcon(sortBy, sortDir, "updated_at")}
                </th>
                <th style={{ width: 160 }}>Action</th>
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
                    No submissions are ready for decision.
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
                    <td>{row.overdue_assignment_count || 0}</td>
                    <td className="small text-muted">
                      {formatDate(row.updated_at || row.created_at)}
                    </td>

                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => openDecisionModal(row)}
                      >
                        Open Decision
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRow ? (
        <DecisionModal
          row={selectedRow}
          detail={selectedDetail}
          workflow={selectedWorkflow}
          files={selectedFiles}
          reviews={selectedReviews}
          form={decisionForm}
          setForm={setDecisionForm}
          busy={busy}
          onClose={closeModal}
          onSubmitDecision={doDecisionAction}
        />
      ) : null}
    </MainLayout>
  );
}