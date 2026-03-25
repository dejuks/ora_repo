import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout.jsx";
import ebookApi from "../../api/ebook.api";
import StatusBadge from "./components/StatusBadge.jsx";

const PAGE_CONFIG = {
  all: {
    title: "My Assigned Submissions",
    subtitle: "Comprehensive overview of all your reviewer assignments",
    empty: "No reviewer assignments found in your queue.",
  },
  pending: {
    title: "Pending Assignments",
    subtitle: "Assignments awaiting your response",
    empty: "No pending assignments require your attention.",
  },
  accepted: {
    title: "Accepted Submissions",
    subtitle: "Active reviews ready for evaluation",
    empty: "No accepted assignments in progress.",
  },
  rejected: {
    title: "Rejected Assignments",
    subtitle: "Declined assignments - view-only access",
    empty: "No rejected assignments on record.",
  },
  completed: {
    title: "Completed Reviews",
    subtitle: "Submitted reviews - historical record",
    empty: "No completed reviews available.",
  },
  overdue: {
    title: "Overdue Assignments",
    subtitle: "Past-due assignments requiring immediate attention",
    empty: "No overdue assignments to address.",
  },
};

const DEFAULT_FORM = {
  originality_score: 3,
  quality_score: 3,
  relevance_score: 3,
  recommendation: "accept",
  comments_for_author: "",
  confidential_comments: "",
  attachments: [],
};

const API_BASE_URL =
  process.env.REACT_APP_API_URL?.replace(/\/api\/?$/, "") ||
  "http://localhost:5000";

const WORKFLOW_STAGES = [
  { key: "draft", label: "Draft" },
  { key: "submitted", label: "Submitted" },
  { key: "screening", label: "Screening" },
  { key: "screened", label: "Screened" },
  { key: "under_review", label: "Under Review" },
  { key: "reviews_completed", label: "Reviews Completed" },
  { key: "editor_decision", label: "Editor Decision" },
  { key: "accepted", label: "Accepted" },
  { key: "finance_pending", label: "Finance Pending" },
  { key: "finance_cleared", label: "Finance Cleared" },
  { key: "production", label: "Production" },
  { key: "published", label: "Published" },
];

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

function isOverdue(row) {
  if (!row?.due_date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(row.due_date);
  due.setHours(0, 0, 0, 0);

  return (
    due < today &&
    ["assigned", "accepted"].includes(String(row.status || "").toLowerCase())
  );
}

function getFilteredRows(rows, filter) {
  switch (filter) {
    case "pending":
      return rows.filter((row) => row.status === "assigned");
    case "accepted":
      return rows.filter((row) => row.status === "accepted");
    case "rejected":
      return rows.filter((row) => row.status === "declined");
    case "completed":
      return rows.filter((row) => row.status === "submitted");
    case "overdue":
      return rows.filter((row) => isOverdue(row));
    case "all":
    default:
      return rows;
  }
}

function getReviewerCounts(rows) {
  const safeRows = Array.isArray(rows) ? rows : [];
  return {
    all: safeRows.length,
    pending: safeRows.filter((row) => row.status === "assigned").length,
    accepted: safeRows.filter((row) => row.status === "accepted").length,
    rejected: safeRows.filter((row) => row.status === "declined").length,
    completed: safeRows.filter((row) => row.status === "submitted").length,
    overdue: safeRows.filter((row) => isOverdue(row)).length,
  };
}

function buildReviewForm(detail) {
  return {
    originality_score: detail?.review?.originality_score ?? 3,
    quality_score: detail?.review?.quality_score ?? 3,
    relevance_score: detail?.review?.relevance_score ?? 3,
    recommendation: detail?.review?.recommendation || "accept",
    comments_for_author: detail?.review?.comments_for_author || "",
    confidential_comments: detail?.review?.confidential_comments || "",
    attachments: [],
  };
}

function getStatusForBadge(row) {
  return isOverdue(row) ? "overdue" : row?.status;
}

function getActionItems(row, filter) {
  const status = String(row?.status || "").toLowerCase();
  const items = [];

  if (status === "assigned") {
    items.push({ key: "detail", label: "View Details", icon: "📄" });
    items.push({ key: "accept", label: "Accept Assignment", icon: "✓", variant: "success" });
    items.push({ key: "reject", label: "Reject Assignment", icon: "✗", variant: "danger" });
    return items;
  }

  if (status === "accepted") {
    if (filter === "accepted") {
      items.push({ key: "review", label: "Submit Review", icon: "✍️", variant: "primary" });
    } else {
      items.push({ key: "detail", label: "View Details", icon: "📄" });
      items.push({ key: "review", label: "Submit Review", icon: "✍️", variant: "primary" });
    }
    return items;
  }

  items.push({ key: "detail", label: "View Details", icon: "📄" });
  return items;
}

function normalizeWorkflowStatus(status) {
  const value = String(status || "").trim().toLowerCase();

  const map = {
    draft: "draft",
    submitted: "submitted",
    pending: "submitted",

    screening: "screening",
    in_screening: "screening",

    screened: "screened",

    review: "under_review",
    under_review: "under_review",
    in_review: "under_review",
    reviewer_assigned: "under_review",

    reviews_completed: "reviews_completed",
    review_completed: "reviews_completed",

    editor_decision: "editor_decision",
    decision: "editor_decision",

    accepted: "accepted",
    approved: "accepted",

    finance: "finance_pending",
    finance_pending: "finance_pending",
    payment_pending: "finance_pending",

    finance_cleared: "finance_cleared",
    payment_completed: "finance_cleared",
    paid: "finance_cleared",

    production: "production",
    processing: "production",
    dcm_processing: "production",

    published: "published",

    rejected: "editor_decision",
    declined: "editor_decision",
    revision_required: "editor_decision",
    minor_revision: "editor_decision",
    major_revision: "editor_decision",
  };

  return map[value] || value || "submitted";
}

function getWorkflowStageIndex(status) {
  const normalized = normalizeWorkflowStatus(status);
  const index = WORKFLOW_STAGES.findIndex((item) => item.key === normalized);
  return index >= 0 ? index : 1;
}

function WorkflowTracker({ currentStatus }) {
  const currentIndex = getWorkflowStageIndex(currentStatus);
  const normalizedCurrent = normalizeWorkflowStatus(currentStatus);

  return (
    <div className="mb-4">
      <h6 className="font-weight-bold mb-3 pb-2 border-bottom">
        Submission Workflow Progress
      </h6>

      <div className="mb-3">
        <span className="font-weight-bold mr-2">Current Status:</span>
        <span className="badge badge-primary px-3 py-2">
          {normalizedCurrent.replace(/_/g, " ").toUpperCase()}
        </span>
      </div>

      <div className="d-flex flex-wrap align-items-center">
        {WORKFLOW_STAGES.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <React.Fragment key={stage.key}>
              <div className="d-flex flex-column align-items-center mb-3" style={{ minWidth: 110 }}>
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center font-weight-bold ${
                    isCurrent
                      ? "bg-primary text-white"
                      : isCompleted
                      ? "bg-success text-white"
                      : "bg-light text-muted border"
                  }`}
                  style={{
                    width: 42,
                    height: 42,
                    fontSize: 14,
                    border: isCurrent || isCompleted ? "none" : "1px solid #dee2e6",
                  }}
                >
                  {isCompleted ? "✓" : index + 1}
                </div>

                <div
                  className={`small text-center mt-2 ${
                    isCurrent
                      ? "text-primary font-weight-bold"
                      : isCompleted
                      ? "text-success font-weight-bold"
                      : "text-muted"
                  }`}
                  style={{ lineHeight: 1.2 }}
                >
                  {stage.label}
                </div>
              </div>

              {index < WORKFLOW_STAGES.length - 1 && (
                <div
                  className={`mb-3 ${
                    index < currentIndex ? "bg-success" : "bg-light"
                  }`}
                  style={{
                    height: 4,
                    width: 40,
                    borderRadius: 999,
                    marginTop: 19,
                    marginLeft: 4,
                    marginRight: 4,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function ModalShell({ title, subtitle, onClose, children, footer, size = "xl" }) {
  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      role="dialog"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
    >
      <div className={`modal-dialog modal-${size} modal-dialog-scrollable`} role="document">
        <div className="modal-content shadow-lg">
          <div className="modal-header bg-light border-bottom-0">
            <div>
              <h5 className="modal-title font-weight-bold mb-1">{title}</h5>
              {subtitle ? <div className="text-muted small">{subtitle}</div> : null}
            </div>
            <button
              type="button"
              className="close"
              onClick={onClose}
              aria-label="Close"
              style={{ fontSize: "1.5rem" }}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body py-4">{children}</div>
          {footer ? <div className="modal-footer bg-light border-top-0">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}

function AssignmentSummaryTable({ row, detail }) {
  const source = detail || row || {};

  const InfoRow = ({ label, value }) => (
    <tr>
      <th style={{ width: "200px", backgroundColor: "#f8f9fa" }}>{label}</th>
      <td className="text-break">{value || "—"}</td>
    </tr>
  );

  return (
    <div className="mb-4">
      <h6 className="font-weight-bold mb-3 pb-2 border-bottom">Submission Information</h6>
      <div className="table-responsive">
        <table className="table table-bordered table-sm">
          <tbody>
            <InfoRow label="Title" value={source.title} />
            <InfoRow label="Author" value={source.author_name} />
            <InfoRow label="Assigned Date" value={formatDate(source.assigned_at)} />
            <InfoRow label="Due Date" value={formatDate(source.due_date)} />
            <InfoRow label="Status" value={<StatusBadge value={getStatusForBadge(source)} />} />
            <InfoRow
              label="Submission Status"
              value={
                source.submission_status
                  ? String(source.submission_status).replace(/_/g, " ")
                  : "—"
              }
            />
            <InfoRow
              label="Keywords"
              value={
                Array.isArray(source.keywords) && source.keywords.length
                  ? source.keywords.join(", ")
                  : null
              }
            />
            <InfoRow label="Abstract" value={source.abstract} />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function buildFileUrl(filePath) {
  if (!filePath) return "#";
  if (/^https?:\/\//i.test(filePath)) return filePath;

  const normalizedPath = String(filePath).startsWith("/")
    ? filePath
    : `/${filePath}`;

  return `${API_BASE_URL}${normalizedPath}`;
}

function FilesBlock({ files, title = "Files" }) {
  const manuscriptFiles = files?.manuscript_files || files?.rows || [];
  const reviewAttachments = files?.review_attachments || [];

  const FileItem = ({ file, type }) => {
    const downloadUrl = buildFileUrl(file.file_path || file.url || file.path);

    return (
      <div className="border rounded p-3 mb-2 hover-shadow transition">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <div className="font-weight-bold text-primary">{file.original_name}</div>
            <div className="small text-muted mt-1">
              {type === "manuscript" ? (
                <>
                  <span className="badge badge-light mr-2">Manuscript</span>
                  {file.file_role?.replace(/_/g, " ")}
                </>
              ) : (
                <>
                  <span className="badge badge-info mr-2">Review</span>
                  Uploaded {formatDate(file.created_at)}
                </>
              )}
            </div>
          </div>
          <a
            className="btn btn-sm btn-outline-primary"
            href={downloadUrl}
            target="_blank"
            rel="noreferrer"
            download
          >
            <i className="fas fa-download mr-1"></i>
            Download
          </a>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h6 className="font-weight-bold mb-3 pb-2 border-bottom">{title}</h6>
      <div className="row">
        <div className="col-md-6 mb-4">
          <h6 className="mb-3 text-secondary">Manuscript Files</h6>
          {!manuscriptFiles.length ? (
            <div className="text-muted text-center py-4 bg-light rounded">
              <i className="fas fa-file-alt mr-2"></i>
              No manuscript files available
            </div>
          ) : (
            manuscriptFiles.map((file) => (
              <FileItem key={file.file_id} file={file} type="manuscript" />
            ))
          )}
        </div>

        <div className="col-md-6 mb-4">
          <h6 className="mb-3 text-secondary">Review Attachments</h6>
          {!reviewAttachments.length ? (
            <div className="text-muted text-center py-4 bg-light rounded">
              <i className="fas fa-paperclip mr-2"></i>
              No review attachments uploaded
            </div>
          ) : (
            reviewAttachments.map((file) => (
              <FileItem key={file.file_id} file={file} type="review" />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function DetailModal({ row, detail, files, loading, onClose }) {
  return (
    <ModalShell
      title={detail?.title || row?.title || "Submission Details"}
      subtitle={`Review Assignment • ${detail?.author_name || row?.author_name || "Author Information"}`}
      onClose={onClose}
      footer={
        <button type="button" className="btn btn-secondary px-4" onClick={onClose}>
          Close
        </button>
      }
    >
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading assignment details...</p>
        </div>
      ) : (
        <>
          <WorkflowTracker currentStatus={detail?.submission_status || row?.submission_status} />

          <AssignmentSummaryTable row={row} detail={detail} />

          {detail?.review && (
            <div className="mb-4">
              <h6 className="font-weight-bold mb-3 pb-2 border-bottom">Review Information</h6>
              <div className="table-responsive">
                <table className="table table-bordered table-sm">
                  <tbody>
                    <tr>
                      <th style={{ width: "200px", backgroundColor: "#f8f9fa" }}>
                        Recommendation
                      </th>
                      <td>
                        <span className="badge badge-primary px-3 py-2">
                          {detail.review.recommendation?.replace(/_/g, " ").toUpperCase()}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <th style={{ backgroundColor: "#f8f9fa" }}>Comments for Author</th>
                      <td className="text-pre-wrap">{detail.review.comments_for_author || "—"}</td>
                    </tr>
                    <tr>
                      <th style={{ backgroundColor: "#f8f9fa" }}>Confidential Comments</th>
                      <td className="text-pre-wrap">{detail.review.confidential_comments || "—"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <FilesBlock files={files} />
        </>
      )}
    </ModalShell>
  );
}

function ReviewFormModal({
  row,
  detail,
  files,
  form,
  template,
  loading,
  busy,
  onChange,
  onClose,
  onSubmit,
}) {
  const selectedAttachments = Array.isArray(form?.attachments) ? form.attachments : [];
  const criteria = template?.criteria || template?.fields || [];
  const recommendations =
    template?.recommendations ||
    template?.recommendation_options?.map((value) => ({
      value,
      label: String(value).replace(/_/g, " "),
    })) || [
      { value: "accept", label: "Accept" },
      { value: "minor_revision", label: "Minor Revision" },
      { value: "major_revision", label: "Major Revision" },
      { value: "reject", label: "Reject" },
    ];

  const ScoreInput = ({ criterion }) => (
    <div className="form-group">
      <label className="font-weight-bold">{criterion.label}</label>
      <select
        className="form-control"
        value={form[criterion.key] ?? 3}
        onChange={(e) => onChange({ [criterion.key]: Number(e.target.value) })}
      >
        {[1, 2, 3, 4, 5].map((score) => (
          <option key={score} value={score}>
            {score} - {score === 1 ? "Poor" : score === 2 ? "Fair" : score === 3 ? "Average" : score === 4 ? "Good" : "Excellent"}
          </option>
        ))}
      </select>
      {criterion.help && <small className="form-text text-muted">{criterion.help}</small>}
    </div>
  );

  return (
    <ModalShell
      title="Peer Review Form"
      subtitle="Provide your expert evaluation and recommendation"
      onClose={onClose}
      size="xl"
      footer={
        <div className="d-flex justify-content-between w-100">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary px-4"
            disabled={busy || loading}
            onClick={onSubmit}
          >
            {busy ? (
              <>
                <span className="spinner-border spinner-border-sm mr-2" role="status" />
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </button>
        </div>
      }
    >
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading review form...</p>
        </div>
      ) : (
        <>
          <AssignmentSummaryTable row={row} detail={detail} />

          <div className="mb-4">
            <h6 className="font-weight-bold mb-3 pb-2 border-bottom">Evaluation Criteria</h6>
            <div className="row">
              {criteria.map((criterion) => (
                <div className="col-md-4" key={criterion.key}>
                  <ScoreInput criterion={criterion} />
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h6 className="font-weight-bold mb-3 pb-2 border-bottom">Recommendation</h6>
            <div className="form-group">
              <select
                className="form-control form-control-lg"
                value={form.recommendation}
                onChange={(e) => onChange({ recommendation: e.target.value })}
              >
                {recommendations.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <h6 className="font-weight-bold mb-3 pb-2 border-bottom">Comments</h6>
            <div className="form-group">
              <label className="font-weight-bold">Comments for Author</label>
              <textarea
                className="form-control"
                rows="5"
                placeholder="Provide constructive feedback to the author..."
                value={form.comments_for_author}
                onChange={(e) => onChange({ comments_for_author: e.target.value })}
              />
              <small className="form-text text-muted">
                These comments will be shared with the author
              </small>
            </div>

            <div className="form-group">
              <label className="font-weight-bold">Confidential Comments to Editor</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Add confidential notes for the editor only..."
                value={form.confidential_comments}
                onChange={(e) => onChange({ confidential_comments: e.target.value })}
              />
              <small className="form-text text-muted">
                These comments will remain confidential and only visible to editors
              </small>
            </div>
          </div>

          <div className="mb-4">
            <h6 className="font-weight-bold mb-3 pb-2 border-bottom">Supporting Documents</h6>
            <div className="form-group">
              <label className="font-weight-bold">Upload Review Attachments</label>
              <input
                type="file"
                multiple
                className="form-control-file"
                onChange={(e) => onChange({ attachments: Array.from(e.target.files || []) })}
              />
              <small className="form-text text-muted">
                Upload annotated manuscripts, checklists, or any supporting review files
              </small>

              {selectedAttachments.length > 0 && (
                <div className="mt-3">
                  <label className="font-weight-bold small">Selected Files:</label>
                  <div className="d-flex flex-wrap">
                    {selectedAttachments.map((file, index) => (
                      <span
                        key={`${file.name}-${index}`}
                        className="badge badge-secondary mr-2 mb-2 px-3 py-2"
                      >
                        <i className="fas fa-paperclip mr-1"></i>
                        {file.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <FilesBlock files={files} title="Existing Review Materials" />
        </>
      )}
    </ModalShell>
  );
}

export default function EbookReviewerPage({ filter = "all" }) {
  const page = PAGE_CONFIG[filter] || PAGE_CONFIG.all;

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [forms, setForms] = useState({});
  const [template, setTemplate] = useState({ criteria: [], recommendations: [] });
  const [menuId, setMenuId] = useState(null);
  const [modalState, setModalState] = useState({ type: null, row: null });
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailMap, setDetailMap] = useState({});
  const [filesMap, setFilesMap] = useState({});
  const menuRef = useRef(null);

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await ebookApi.getReviewerDashboard();
      setRows(result?.assignments || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load reviewer assignments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const close = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuId(null);
      }
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const baseFilteredRows = useMemo(
    () => getFilteredRows(rows, filter),
    [rows, filter]
  );

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();

    const searched = !term
      ? baseFilteredRows
      : baseFilteredRows.filter((row) =>
          [row.title, row.author_name, row.status]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(term))
        );

    return [...searched].sort((a, b) => {
      const overdueA = isOverdue(a) ? 1 : 0;
      const overdueB = isOverdue(b) ? 1 : 0;
      if (overdueA !== overdueB) return overdueB - overdueA;

      const dueA = a?.due_date
        ? new Date(a.due_date).getTime()
        : Number.MAX_SAFE_INTEGER;
      const dueB = b?.due_date
        ? new Date(b.due_date).getTime()
        : Number.MAX_SAFE_INTEGER;

      return dueA - dueB;
    });
  }, [baseFilteredRows, search]);

  const counts = useMemo(() => getReviewerCounts(rows), [rows]);
  const titleWithCount = `${page.title} (${counts[filter] ?? 0})`;

  const changeForm = (assignmentId, patch) => {
    setForms((prev) => ({
      ...prev,
      [assignmentId]: { ...(prev[assignmentId] || DEFAULT_FORM), ...patch },
    }));
  };

  const ensureReviewSupportData = async () => {
    if ((template?.criteria || []).length || (template?.recommendations || []).length) {
      return;
    }

    const templateRes = await ebookApi.getReviewTemplate();

    const normalized = {
      criteria:
        templateRes?.criteria ||
        templateRes?.fields?.filter((f) =>
          ["originality_score", "quality_score", "relevance_score"].includes(f.key)
        ) ||
        [],
      recommendations:
        templateRes?.recommendations ||
        templateRes?.recommendation_options?.map((value) => ({
          value,
          label: String(value).replace(/_/g, " "),
        })) ||
        [],
    };

    setTemplate(normalized);
  };

  const ensureDetailData = async (assignmentId) => {
    if (detailMap[assignmentId] && filesMap[assignmentId]) {
      return {
        detail: detailMap[assignmentId],
        files: filesMap[assignmentId],
      };
    }

    const [detailRes, filesRes] = await Promise.all([
      detailMap[assignmentId]
        ? Promise.resolve(detailMap[assignmentId])
        : ebookApi.getReviewAssignmentDetail(assignmentId),
      filesMap[assignmentId]
        ? Promise.resolve(filesMap[assignmentId])
        : ebookApi.getReviewAssignmentFiles(assignmentId),
    ]);

    setDetailMap((prev) => ({ ...prev, [assignmentId]: detailRes }));
    setFilesMap((prev) => ({
      ...prev,
      [assignmentId]: filesRes || { manuscript_files: [], review_attachments: [] },
    }));

    return {
      detail: detailRes,
      files: filesRes || { manuscript_files: [], review_attachments: [] },
    };
  };

  const openModal = async (type, row) => {
    setMenuId(null);
    setModalState({ type, row });
    setDetailLoading(true);
    setError("");

    try {
      const [{ detail }] = await Promise.all([
        ensureDetailData(row.assignment_id),
        type === "review" ? ensureReviewSupportData() : Promise.resolve(),
      ]);

      if (type === "review") {
        setForms((prev) => ({
          ...prev,
          [row.assignment_id]:
            prev[row.assignment_id] || buildReviewForm(detail),
        }));
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load assignment details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => setModalState({ type: null, row: null });

  const respond = async (assignmentId, status) => {
    setBusy(true);
    setError("");
    setNotice("");
    setMenuId(null);

    try {
      await ebookApi.respondAssignment(assignmentId, { status });
      setNotice(
        status === "accepted"
          ? "Assignment accepted successfully. You can now begin your review."
          : "Assignment rejected successfully."
      );
      closeModal();
      await load();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to update assignment response."
      );
    } finally {
      setBusy(false);
    }
  };

  const submitReview = async () => {
    const row = modalState.row;
    if (!row) return;

    setBusy(true);
    setError("");
    setNotice("");

    try {
      const currentForm = forms[row.assignment_id] || DEFAULT_FORM;
      const attachments = Array.isArray(currentForm.attachments)
        ? currentForm.attachments
        : [];

      for (const file of attachments) {
        await ebookApi.uploadReviewFile(row.assignment_id, file);
      }

      const reviewPayload = {
        originality_score:
          currentForm.originality_score !== "" && currentForm.originality_score !== null
            ? Number(currentForm.originality_score)
            : null,
        quality_score:
          currentForm.quality_score !== "" && currentForm.quality_score !== null
            ? Number(currentForm.quality_score)
            : null,
        relevance_score:
          currentForm.relevance_score !== "" && currentForm.relevance_score !== null
            ? Number(currentForm.relevance_score)
            : null,
        recommendation: String(currentForm.recommendation || "").trim(),
        comments_for_author: currentForm.comments_for_author || "",
        confidential_comments: currentForm.confidential_comments || "",
      };

      if (!reviewPayload.recommendation) {
        throw new Error("Recommendation is required.");
      }

      await ebookApi.submitReview(row.assignment_id, reviewPayload);

      setNotice("Review submitted successfully. Thank you for your contribution!");
      closeModal();

      setForms((prev) => ({
        ...prev,
        [row.assignment_id]: { ...DEFAULT_FORM },
      }));

      await load();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to submit review. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  const detail = modalState.row
    ? detailMap[modalState.row.assignment_id]
    : null;

  const files = modalState.row
    ? filesMap[modalState.row.assignment_id] || {
        manuscript_files: [],
        review_attachments: [],
      }
    : { manuscript_files: [], review_attachments: [] };

  const activeForm = modalState.row
    ? forms[modalState.row.assignment_id] || DEFAULT_FORM
    : DEFAULT_FORM;

  return (
    <MainLayout>
      <div className="container-fluid px-4 py-3">
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h1 className="h2 mb-2 font-weight-bold">{titleWithCount}</h1>
            <p className="text-muted mb-0">{page.subtitle}</p>
          </div>
          <div className="text-right">
            <div className="text-muted small">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
            <button type="button" className="close" onClick={() => setError("")}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        )}

        {notice && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <i className="fas fa-check-circle mr-2"></i>
            {notice}
            <button type="button" className="close" onClick={() => setNotice("")}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        )}

        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-end">
              <div className="form-group mb-0" style={{ minWidth: 320 }}>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text bg-white border-right-0">
                      <i className="fas fa-search text-muted"></i>
                    </span>
                  </div>
                  <input
                    type="text"
                    className="form-control border-left-0"
                    placeholder="Search by title, author, or status..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <div className="input-group-append">
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setSearch("")}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div
              className="table-responsive"
              style={{
                maxHeight: "calc(100vh - 320px)",
                minHeight: "400px",
                overflowY: "auto"
              }}
            >
              <table className="table table-hover mb-0">
                <thead className="bg-light sticky-top">
                  <tr>
                    <th style={{ width: 60 }} className="border-0">#</th>
                    <th className="border-0">Title</th>
                    <th className="border-0">Author</th>
                    <th className="border-0">Assigned Date</th>
                    <th className="border-0">Due Date</th>
                    <th className="border-0">Status</th>
                    <th style={{ width: 80 }} className="border-0 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="sr-only">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Loading assignments...</p>
                      </td>
                    </tr>
                  ) : !filteredRows.length ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5">
                        <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                        <p className="text-muted mb-0">{page.empty}</p>
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row, index) => {
                      const actionItems = getActionItems(row, filter);
                      const menuOpen = menuId === row.assignment_id;
                      const isOverdueRow = isOverdue(row);

                      return (
                        <tr key={row.assignment_id} className={isOverdueRow ? "table-warning" : ""}>
                          <td className="align-middle">{index + 1}</td>
                          <td className="align-middle font-weight-medium">{row.title || "—"}</td>
                          <td className="align-middle">{row.author_name || "—"}</td>
                          <td className="align-middle">{formatDate(row.assigned_at)}</td>
                          <td className="align-middle">
                            <span className={isOverdueRow ? "text-danger font-weight-bold" : ""}>
                              {formatDate(row.due_date)}
                              {isOverdueRow && " ⚠️"}
                            </span>
                          </td>
                          <td className="align-middle">
                            <StatusBadge value={getStatusForBadge(row)} />
                          </td>
                          <td className="align-middle text-center" style={{ position: "relative" }}>
                            <div ref={menuOpen ? menuRef : null} className="d-inline-block">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() =>
                                  setMenuId((prev) =>
                                    prev === row.assignment_id ? null : row.assignment_id
                                  )
                                }
                                aria-label="Open actions"
                              >
                                <i className="fas fa-ellipsis-v"></i>
                              </button>

                              {menuOpen && (
                                <div
                                  className="bg-white border rounded shadow-sm py-2"
                                  style={{
                                    position: "absolute",
                                    right: 0,
                                    top: 38,
                                    minWidth: 200,
                                    zIndex: 1000,
                                  }}
                                >
                                  {actionItems.map((item) => (
                                    <button
                                      key={item.key}
                                      type="button"
                                      className={`dropdown-item d-flex align-items-center ${
                                        item.variant === "success" ? "text-success" : ""
                                      } ${item.variant === "danger" ? "text-danger" : ""}`}
                                      onClick={() => {
                                        if (item.key === "detail") openModal("detail", row);
                                        if (item.key === "review") openModal("review", row);
                                        if (item.key === "accept") respond(row.assignment_id, "accepted");
                                        if (item.key === "reject") respond(row.assignment_id, "declined");
                                      }}
                                    >
                                      <span className="mr-2">{item.icon}</span>
                                      {item.label}
                                    </button>
                                  ))}
                                </div>
                              )}
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
        </div>

        {modalState.type === "detail" && modalState.row && (
          <DetailModal
            row={modalState.row}
            detail={detail}
            files={files}
            loading={detailLoading}
            onClose={closeModal}
          />
        )}

        {modalState.type === "review" && modalState.row && (
          <ReviewFormModal
            row={modalState.row}
            detail={detail}
            files={files}
            form={activeForm}
            template={template}
            loading={detailLoading}
            busy={busy}
            onChange={(patch) => changeForm(modalState.row.assignment_id, patch)}
            onClose={closeModal}
            onSubmit={submitReview}
          />
        )}
      </div>
    </MainLayout>
  );
}