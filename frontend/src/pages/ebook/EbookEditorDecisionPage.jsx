import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "../../components/layout/MainLayout.jsx";
import ebookApi from "./mock/ebookMockApi.js";
import StatusBadge from "./components/StatusBadge.jsx";

const DECISION_FORM_DEFAULT = {
  decision: "accept",
  note: "",
};

const API_BASE_URL =
  process.env.REACT_APP_API_URL?.replace(/\/api\/?$/, "") ||
  "http://localhost:5000";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function prettyValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function safeJsonParse(value) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function ObjectTextBlock({ value }) {
  const parsed = safeJsonParse(value);

  if (parsed === null || parsed === undefined || parsed === "") {
    return <span>—</span>;
  }

  if (typeof parsed !== "object" || Array.isArray(parsed)) {
    return <span>{prettyValue(parsed)}</span>;
  }

  const entries = Object.entries(parsed);

  if (!entries.length) return <span>—</span>;

  return (
    <div>
      {entries.map(([key, val]) => (
        <div key={key} className="mb-1">
          <strong>{prettyValue(key)}:</strong>{" "}
          {val === null || val === undefined || val === ""
            ? "—"
            : typeof val === "object"
            ? JSON.stringify(val)
            : prettyValue(val)}
        </div>
      ))}
    </div>
  );
}

function buildFileUrl(file) {
  const filePath =
    file?.file_path ||
    file?.path ||
    file?.url ||
    file?.download_url ||
    file?.downloadUrl;

  if (!filePath) return "#";
  if (/^https?:\/\//i.test(filePath)) return filePath;

  const normalizedPath = String(filePath).startsWith("/")
    ? filePath
    : `/${filePath}`;

  return `${API_BASE_URL}${normalizedPath}`;
}

function normalizeRows(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.rows)) return result.rows;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.items)) return result.items;
  if (Array.isArray(result?.submissions)) return result.submissions;
  if (Array.isArray(result?.assignments)) return result.assignments;
  return [];
}

function normalizeFiles(result) {
  const rows = normalizeRows(result);

  const manuscriptRoles = new Set([
    "manuscript",
    "submission",
    "original",
    "author_revision",
    "revised_manuscript",
    "revision",
    "final_manuscript",
  ]);

  const reviewRoles = new Set([
    "review",
    "review_attachment",
    "review_file",
    "review_report",
    "reviewer_attachment",
    "review_note",
    "editor_note",
    "decision_letter",
    "confidential_review",
  ]);

  const normalized = rows.map((file, index) => {
    const role = String(
      file?.file_role || file?.role || file?.type || file?.category || ""
    ).toLowerCase();

    return {
      id: file?.file_id || file?.id || `${role || "file"}-${index}`,
      original_name:
        file?.original_name ||
        file?.filename ||
        file?.name ||
        file?.stored_name ||
        "File",
      stored_name: file?.stored_name || file?.server_name || "",
      file_role: role,
      created_at: file?.created_at || file?.uploaded_at || file?.updated_at,
      url: buildFileUrl(file),
      raw: file,
    };
  });

  const manuscript_files = normalized.filter((file) =>
    manuscriptRoles.has(file.file_role)
  );

  const review_attachments = normalized.filter((file) =>
    reviewRoles.has(file.file_role)
  );

  const uncategorized = normalized.filter(
    (file) =>
      !manuscriptRoles.has(file.file_role) && !reviewRoles.has(file.file_role)
  );

  return {
    all_files: normalized,
    manuscript_files:
      manuscript_files.length > 0
        ? manuscript_files
        : normalized.filter((file) =>
            /manuscript|submission|revision|author/i.test(file.file_role)
          ),
    review_attachments:
      review_attachments.length > 0
        ? review_attachments
        : normalized.filter((file) =>
            /review|editor|decision|attachment/i.test(file.file_role)
          ),
    uncategorized_files: uncategorized,
  };
}

function normalizeReviewsFromDetail(detail) {
  if (Array.isArray(detail?.reviews)) return detail.reviews;
  if (Array.isArray(detail?.review_rows)) return detail.review_rows;
  if (Array.isArray(detail?.submitted_reviews)) return detail.submitted_reviews;
  if (Array.isArray(detail?.data?.reviews)) return detail.data.reviews;
  return [];
}

function normalizeReviewsFromAssignments(assignmentsResult) {
  const rows = normalizeRows(assignmentsResult);

  return rows
    .filter((item) => {
      const status = String(item?.status || "").toLowerCase();
      return (
        status === "submitted" ||
        status === "completed" ||
        !!item?.submitted_at ||
        !!item?.recommendation ||
        !!item?.comments_for_author ||
        !!item?.confidential_comments
      );
    })
    .map((item) => ({
      review_id: item.review_id || item.assignment_id,
      assignment_id: item.assignment_id,
      reviewer_name: item.reviewer_name || item.reviewer?.name || "—",
      reviewer_email: item.reviewer_email || item.reviewer?.email || "",
      recommendation: item.recommendation || "—",
      originality_score: item.originality_score,
      quality_score: item.quality_score,
      relevance_score: item.relevance_score,
      comments_for_author: item.comments_for_author,
      confidential_comments: item.confidential_comments,
      submitted_at: item.submitted_at || item.completed_at,
    }));
}

function isAssignedSubmission(row) {
  const status = String(row?.status || "").toLowerCase();
  const assignmentCount = Number(row?.assignment_count || 0);
  const reviewCount = Number(row?.review_count || 0);

  return (
    assignmentCount > 0 ||
    reviewCount > 0 ||
    [
      "screened",
      "under_review",
      "reviews",
      "reviews_submitted",
      "revision_submitted",
      "decision",
      "accepted",
      "rejected",
      "minor_revision",
      "major_revision",
    ].includes(status)
  );
}

function SummaryCards({ rows }) {
  const total = rows.length;
  const withAssignments = rows.filter(
    (row) => Number(row?.assignment_count || 0) > 0
  ).length;
  const withReviews = rows.filter(
    (row) => Number(row?.review_count || 0) > 0
  ).length;
  const overdue = rows.filter(
    (row) => Number(row?.overdue_assignment_count || 0) > 0
  ).length;

  const cards = [
    { label: "All Assigned", value: total, tone: "primary" },
    { label: "With Assignments", value: withAssignments, tone: "warning" },
    { label: "With Reviews", value: withReviews, tone: "info" },
    { label: "Overdue", value: overdue, tone: "danger" },
  ];

  return (
    <div className="row mb-4">
      {cards.map((card) => (
        <div className="col-md-3 mb-3" key={card.label}>
          <div className={`card border-${card.tone} h-100 shadow-sm`}>
            <div className="card-body">
              <div className="small text-muted mb-1">{card.label}</div>
              <div className={`h3 mb-0 text-${card.tone}`}>{card.value}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SubmissionDetailTable({ detail }) {
  const source = detail || {};
  const assignedReviewer =
    source?.editor?.assigned_reviewer ?? source?.assigned_reviewer;
  const screened = source?.editor?.screened ?? source?.screened;

  const Item = ({ label, value }) => (
    <tr>
      <th style={{ width: 220, backgroundColor: "#f8f9fa" }}>{label}</th>
      <td>{value || "—"}</td>
    </tr>
  );

  return (
    <div className="table-responsive mb-4">
      <table className="table table-bordered table-sm mb-0">
        <tbody>
          <Item label="Title" value={source.title} />
          <Item label="Subtitle" value={source.subtitle} />
          <Item label="Author" value={source.author_name} />
          <Item label="Author Email" value={source.author_email} />
          <Item
            label="Status"
            value={<StatusBadge value={source.status || source.submission_status} />}
          />
          <Item label="Category" value={source.category} />
          <Item label="Language" value={source.language} />
          <Item label="Publication Year" value={source.publication_year} />
          <Item label="Target Audience" value={source.target_audience} />
          <Item
            label="Keywords"
            value={
              Array.isArray(source.keywords) && source.keywords.length
                ? source.keywords.join(", ")
                : "—"
            }
          />
          <Item label="Assignments" value={source.assignment_count ?? 0} />
          <Item label="Submitted Reviews" value={source.review_count ?? 0} />
          <Item
            label="Overdue Assignments"
            value={source.overdue_assignment_count ?? 0}
          />
          <Item
            label="Assigned Reviewer"
            value={<ObjectTextBlock value={assignedReviewer} />}
          />
          <Item
            label="Screened"
            value={<ObjectTextBlock value={screened} />}
          />
          <Item label="Submitted At" value={formatDateTime(source.submitted_at)} />
          <Item label="Updated At" value={formatDateTime(source.updated_at)} />
        </tbody>
      </table>
    </div>
  );
}

function ScreeningBlock({ detail }) {
  const screening =
    detail?.screening ||
    detail?.screening_result ||
    detail?.screening_assessment ||
    detail?.editor_screening ||
    detail?.editor?.screened ||
    null;

  const parsed = safeJsonParse(screening);

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;

  return (
    <div className="card card-outline card-info mb-4">
      <div className="card-header">
        <h3 className="card-title mb-0">Screening Information</h3>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-bordered table-sm mb-0">
            <tbody>
              {Object.entries(parsed).map(([key, val]) => (
                <tr key={key}>
                  <th style={{ width: 240 }}>{prettyValue(key)}</th>
                  <td>
                    {val === null || val === undefined || val === ""
                      ? "—"
                      : typeof val === "object"
                      ? JSON.stringify(val)
                      : prettyValue(val)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReviewsTable({ reviews }) {
  const rows = Array.isArray(reviews) ? reviews : [];

  return (
    <div className="card card-outline card-primary mb-4">
      <div className="card-header">
        <h3 className="card-title mb-0">Reviewer Submitted Reviews</h3>
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
                  <td colSpan="6" className="text-center text-muted py-4">
                    No submitted reviews found.
                  </td>
                </tr>
              ) : (
                rows.map((review, index) => (
                  <tr key={review.review_id || review.assignment_id || index}>
                    <td>
                      <div>{review.reviewer_name || "—"}</div>
                      <div className="small text-muted">{review.reviewer_email || ""}</div>
                    </td>
                    <td>
                      <span className="badge badge-primary">
                        {prettyValue(review.recommendation)}
                      </span>
                    </td>
                    <td>{review.originality_score ?? "—"}</td>
                    <td>{review.quality_score ?? "—"}</td>
                    <td>{review.relevance_score ?? "—"}</td>
                    <td>{formatDateTime(review.submitted_at)}</td>
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

function FileListCard({ title, files, badge }) {
  return (
    <div className="card card-outline card-light h-100">
      <div className="card-header">
        <h3 className="card-title mb-0">{title}</h3>
      </div>
      <div className="card-body">
        {!files.length ? (
          <div className="text-muted">No files available.</div>
        ) : (
          files.map((file) => (
            <div key={file.id} className="border rounded p-3 mb-2">
              <div className="d-flex justify-content-between align-items-start">
                <div className="pr-2">
                  <div className="font-weight-bold text-primary">
                    {file.original_name}
                  </div>
                  <div className="small text-muted mt-1">
                    <span className={`badge badge-${badge} mr-2`}>
                      {prettyValue(file.file_role || "file")}
                    </span>
                    {file.created_at ? ` • ${formatDate(file.created_at)}` : ""}
                  </div>
                </div>

                <a
                  className="btn btn-sm btn-outline-primary"
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  download
                >
                  Download
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function FilesBlock({ files }) {
  const manuscriptFiles = files?.manuscript_files || [];
  const reviewAttachments = files?.review_attachments || [];
  const uncategorizedFiles = files?.uncategorized_files || [];
  const allFiles = files?.all_files || [];

  const showFallbackAll =
    allFiles.length > 0 &&
    manuscriptFiles.length === 0 &&
    reviewAttachments.length === 0;

  return (
    <>
      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <FileListCard
            title="Manuscript Files"
            files={manuscriptFiles}
            badge="secondary"
          />
        </div>

        <div className="col-md-6 mb-3">
          <FileListCard
            title="Review Attachments"
            files={reviewAttachments}
            badge="info"
          />
        </div>
      </div>

      {uncategorizedFiles.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <FileListCard
              title="Other Related Files"
              files={uncategorizedFiles}
              badge="dark"
            />
          </div>
        </div>
      )}

      {showFallbackAll && (
        <div className="row mb-4">
          <div className="col-12">
            <FileListCard title="All Files" files={allFiles} badge="primary" />
          </div>
        </div>
      )}
    </>
  );
}

function WorkflowBlock({ workflow }) {
  const history = normalizeRows(workflow?.history || workflow);

  return (
    <div className="card card-outline card-light mb-4">
      <div className="card-header">
        <h3 className="card-title mb-0">Workflow History</h3>
      </div>
      <div className="card-body">
        {!history.length ? (
          <div className="text-muted">No workflow history available.</div>
        ) : (
          <div style={{ maxHeight: 280, overflowY: "auto" }}>
            {history.map((item, index) => (
              <div key={item.history_id || index} className="border rounded p-3 mb-2">
                <div className="d-flex justify-content-between flex-wrap mb-1">
                  <div className="font-weight-bold">
                    {item.action || "Workflow update"}
                  </div>
                  <div className="small text-muted">
                    {formatDateTime(item.acted_at || item.created_at)}
                  </div>
                </div>
                <div className="small text-muted mb-1">
                  {item.from_status || "—"} → {item.to_status || "—"}
                </div>
                <div>{item.note || "—"}</div>
              </div>
            ))}
          </div>
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
  onSubmit,
}) {
  const source = detail || row || {};
  const hasReviews = Array.isArray(reviews) && reviews.length > 0;

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      role="dialog"
      style={{ background: "rgba(0,0,0,0.45)" }}
    >
      <div className="modal-dialog modal-xl modal-dialog-scrollable" role="document">
        <div className="modal-content shadow-lg">
          <div className="modal-header bg-light">
            <div>
              <h5 className="modal-title mb-1">Editorial Decision Workspace</h5>
              <div className="text-muted small">
                View assigned manuscript details and make the final decision.
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
            <SubmissionDetailTable detail={source} />
            <ScreeningBlock detail={source} />

            <div className="mb-4">
              <h6 className="font-weight-bold mb-2">Abstract</h6>
              <div className="border rounded bg-light p-3 text-pre-wrap">
                {source.abstract || "No abstract available."}
              </div>
            </div>

            <ReviewsTable reviews={reviews} />
            <FilesBlock files={files} />
            <WorkflowBlock workflow={workflow} />

            <div className="card card-outline card-success">
              <div className="card-header">
                <h3 className="card-title mb-0">Final Editorial Decision</h3>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="font-weight-bold">Decision</label>
                  <select
                    className="form-control"
                    value={form.decision}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, decision: e.target.value }))
                    }
                    disabled={busy || !hasReviews}
                  >
                    <option value="accept">Accept</option>
                    <option value="minor_revision">Minor Revision</option>
                    <option value="major_revision">Major Revision</option>
                    <option value="reject">Reject</option>
                  </select>
                  {!hasReviews && (
                    <small className="form-text text-warning">
                      At least one submitted review is required before making a decision.
                    </small>
                  )}
                </div>

                <div className="form-group mb-0">
                  <label className="font-weight-bold">Editor Note</label>
                  <textarea
                    className="form-control"
                    rows="5"
                    value={form.note}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, note: e.target.value }))
                    }
                    placeholder="Write the final editorial note..."
                    disabled={busy || !hasReviews}
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            className="modal-footer bg-light d-flex justify-content-between flex-wrap"
            style={{ gap: 8 }}
          >
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
                disabled={busy || !hasReviews}
                onClick={() => onSubmit("accept")}
              >
                Accept
              </button>
              <button
                type="button"
                className="btn btn-warning"
                disabled={busy || !hasReviews}
                onClick={() => onSubmit("minor_revision")}
              >
                Minor Revision
              </button>
              <button
                type="button"
                className="btn btn-warning"
                disabled={busy || !hasReviews}
                onClick={() => onSubmit("major_revision")}
              >
                Major Revision
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={busy || !hasReviews}
                onClick={() => onSubmit("reject")}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EbookEditorDecisionPage() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");

  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({
    all_files: [],
    manuscript_files: [],
    review_attachments: [],
    uncategorized_files: [],
  });
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [decisionForm, setDecisionForm] = useState(DECISION_FORM_DEFAULT);

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await ebookApi.getEditorQueue();
      const allRows = normalizeRows(result);
      setRows(allRows.filter(isAssignedSubmission));
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to load assigned submissions."
      );
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredRows = useMemo(() => {
    const term = String(search || "").trim().toLowerCase();

    return [...rows]
      .filter((row) => {
        if (!term) return true;

        const text = [
          row?.title,
          row?.subtitle,
          row?.abstract,
          row?.author_name,
          row?.author_email,
          row?.status,
          row?.category,
          row?.language,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return text.includes(term);
      })
      .sort((a, b) => {
        const aDate = new Date(a?.updated_at || a?.created_at || 0).getTime();
        const bDate = new Date(b?.updated_at || b?.created_at || 0).getTime();
        return bDate - aDate;
      });
  }, [rows, search]);

  const openDecisionModal = async (row) => {
    setBusy(true);
    setError("");
    setNotice("");

    try {
      const [detail, workflow, files, assignments] = await Promise.all([
        ebookApi.getSubmission(row.submission_id),
        ebookApi.getWorkflow(row.submission_id),
        ebookApi.listFiles(row.submission_id),
        typeof ebookApi.listReviewAssignments === "function"
          ? ebookApi.listReviewAssignments({ submission_id: row.submission_id })
          : Promise.resolve([]),
      ]);

      const detailObj = detail || row;
      const detailReviews = normalizeReviewsFromDetail(detailObj);
      const assignmentReviews = normalizeReviewsFromAssignments(assignments);
      const mergedReviews = detailReviews.length ? detailReviews : assignmentReviews;

      setSelectedRow(row);
      setSelectedDetail(detailObj);
      setSelectedWorkflow(workflow || { rows: [] });
      setSelectedFiles(normalizeFiles(files));
      setSelectedReviews(mergedReviews);
      setDecisionForm(DECISION_FORM_DEFAULT);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to load submission detail."
      );
    } finally {
      setBusy(false);
    }
  };

  const closeDecisionModal = () => {
    setSelectedRow(null);
    setSelectedDetail(null);
    setSelectedWorkflow(null);
    setSelectedFiles({
      all_files: [],
      manuscript_files: [],
      review_attachments: [],
      uncategorized_files: [],
    });
    setSelectedReviews([]);
    setDecisionForm(DECISION_FORM_DEFAULT);
  };

  const handleDecision = async (decisionValue) => {
    if (!selectedRow?.submission_id) return;

    if (selectedReviews.length === 0) {
      setError("Cannot make a decision without submitted reviews.");
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");

    try {
      await ebookApi.makeDecision(selectedRow.submission_id, {
        decision: decisionValue,
        note: decisionForm.note,
      });

      setNotice("Editorial decision saved successfully.");
      closeDecisionModal();
      await load();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to save editorial decision."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <MainLayout>
      <section className="content-header mb-3">
        <div
          className="d-flex justify-content-between align-items-start flex-wrap"
          style={{ gap: 12 }}
        >
          <div>
            <h1 className="mb-1">Editor Decision Page</h1>
            <p className="text-muted mb-0">
              Shows all submissions that have reviewer assignments or review activity.
            </p>
          </div>
          <div className="text-muted small">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </section>

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {notice ? <div className="alert alert-success">{notice}</div> : null}

      <SummaryCards rows={rows} />

      <div className="card card-outline card-primary">
        <div className="card-header">
          <div
            className="d-flex justify-content-between align-items-center flex-wrap"
            style={{ gap: 10 }}
          >
            <h3 className="card-title mb-0">All Assigned Submissions</h3>
            <div className="d-flex align-items-center" style={{ gap: 8 }}>
              <input
                type="text"
                className="form-control"
                style={{ minWidth: 280 }}
                placeholder="Search title, author, category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={load}
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="card-body table-responsive p-0">
          <table className="table table-bordered table-hover mb-0">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>Title</th>
                <th>Author</th>
                <th>Status</th>
                <th>Assignments</th>
                <th>Reviews</th>
                <th>Overdue</th>
                <th>Updated</th>
                <th style={{ width: 240 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center text-muted py-4">
                    No assigned submissions found.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, index) => {
                  const hasReviewCount = Number(row?.review_count || 0) > 0;

                  return (
                    <tr key={row.submission_id || index}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="font-weight-bold">
                          {row.title || "Untitled Submission"}
                        </div>
                        <div className="small text-muted">
                          {row.subtitle || row.category || "—"}
                        </div>
                      </td>
                      <td>
                        <div>{row.author_name || "—"}</div>
                        <div className="small text-muted">{row.author_email || ""}</div>
                      </td>
                      <td>
                        <StatusBadge value={row.status} />
                      </td>
                      <td>{row.assignment_count ?? 0}</td>
                      <td>
                        <span
                          className={`badge ${
                            hasReviewCount ? "badge-success" : "badge-secondary"
                          }`}
                        >
                          {row.review_count ?? 0}
                        </span>
                      </td>
                      <td>
                        {Number(row.overdue_assignment_count || 0) > 0 ? (
                          <span className="badge badge-danger">
                            {row.overdue_assignment_count}
                          </span>
                        ) : (
                          <span className="badge badge-light">0</span>
                        )}
                      </td>
                      <td>{formatDate(row.updated_at || row.created_at)}</td>
                      <td>
                        <div className="d-flex flex-wrap" style={{ gap: 8 }}>
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => openDecisionModal(row)}
                          >
                            View Detail
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => openDecisionModal(row)}
                          >
                            Make Decision
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
          onClose={closeDecisionModal}
          onSubmit={handleDecision}
        />
      ) : null}
    </MainLayout>
  );
}