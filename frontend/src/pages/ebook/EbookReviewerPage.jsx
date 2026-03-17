import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout.jsx";
import ebookApi from "../../api/ebook.api";
import StatusBadge from "./components/StatusBadge.jsx";

const PAGE_CONFIG = {
  all: {
    title: "My Assigned Submissions",
    subtitle: "View all reviewer assignments in one shared workspace.",
    empty: "No reviewer assignments found.",
  },
  pending: {
    title: "Pending Assignments",
    subtitle: "Assignments waiting for your response.",
    empty: "No pending assignments found.",
  },
  accepted: {
    title: "Accepted Submission List",
    subtitle: "Open the popup review form and submit your recommendation.",
    empty: "No accepted assignments found.",
  },
  rejected: {
    title: "Rejected Assignment List",
    subtitle: "Assignments you declined. Detail view only.",
    empty: "No rejected assignments found.",
  },
  completed: {
    title: "Completed Review List",
    subtitle: "Already reviewed assignments. Detail view only.",
    empty: "No completed reviews found.",
  },
  overdue: {
    title: "Overdue Assignments",
    subtitle: "Assignments past the due date that still need action.",
    empty: "No overdue assignments found.",
  },
};


const STATUS_TABS = [
  { key: "all", label: "My Assigned", path: "/ebook/reviewer/assignments" },
  { key: "pending", label: "Pending", path: "/ebook/reviewer/assignments/pending" },
  { key: "accepted", label: "Accepted", path: "/ebook/reviewer/assignments/accepted" },
  { key: "rejected", label: "Rejected", path: "/ebook/reviewer/assignments/rejected" },
  { key: "completed", label: "Completed", path: "/ebook/reviewer/assignments/completed" },
  { key: "overdue", label: "Overdue", path: "/ebook/reviewer/assignments/overdue" },
];

const DEFAULT_FORM = {
  originality_score: 3,
  quality_score: 3,
  relevance_score: 3,
  recommendation: "accept",
  comments_for_author: "",
  confidential_comments: "",
  attachments: [],
};

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
}

function isOverdue(row) {
  if (!row?.due_date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(row.due_date);
  due.setHours(0, 0, 0, 0);
  return due < today && ["assigned", "accepted"].includes(String(row.status || "").toLowerCase());
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
    items.push({ key: "detail", label: "View detail" });
    items.push({ key: "accept", label: "Accept assignment" });
    items.push({ key: "reject", label: "Reject assignment" });
    return items;
  }

  if (status === "accepted") {
    if (filter === "accepted") {
      items.push({ key: "review", label: "Open review form" });
    } else {
      items.push({ key: "detail", label: "View detail" });
      items.push({ key: "review", label: "Open review form" });
    }
    return items;
  }

  items.push({ key: "detail", label: "View detail" });
  return items;
}

function ModalShell({ title, subtitle, onClose, children, footer }) {
  return (
    <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.45)" }}>
      <div className="modal-dialog modal-xl modal-dialog-scrollable" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <div>
              <h5 className="modal-title mb-1">{title}</h5>
              {subtitle ? <div className="text-muted small">{subtitle}</div> : null}
            </div>
            <button type="button" className="close" onClick={onClose} aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">{children}</div>
          {footer ? <div className="modal-footer">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}

function AssignmentSummaryTable({ row, detail }) {
  const source = detail || row || {};
  return (
    <div className="table-responsive mb-4">
      <table className="table table-bordered table-sm mb-0">
        <tbody>
          <tr><th style={{ width: 220 }}>Title</th><td>{source.title || "—"}</td></tr>
          <tr><th>Author</th><td>{source.author_name || "—"}</td></tr>
          <tr><th>Assigned Date</th><td>{formatDate(source.assigned_at)}</td></tr>
          <tr><th>Due Date</th><td>{formatDate(source.due_date)}</td></tr>
          <tr><th>Status</th><td><StatusBadge value={getStatusForBadge(source)} /></td></tr>
          <tr><th>Submission Status</th><td>{source.submission_status || "—"}</td></tr>
          <tr><th>Keywords</th><td>{Array.isArray(source.keywords) && source.keywords.length ? source.keywords.join(", ") : "—"}</td></tr>
          <tr><th>Abstract</th><td>{source.abstract || "—"}</td></tr>
        </tbody>
      </table>
    </div>
  );
}

function FilesBlock({ files }) {
  const manuscriptFiles = files?.manuscript_files || [];
  const reviewAttachments = files?.review_attachments || [];

  return (
    <div className="row">
      <div className="col-md-6 mb-3">
        <h6 className="mb-2">Manuscript Files</h6>
        {!manuscriptFiles.length ? (
          <div className="text-muted small">No manuscript files available.</div>
        ) : (
          manuscriptFiles.map((file) => (
            <div key={file.file_id} className="border rounded p-2 mb-2">
              <div className="font-weight-bold">{file.original_name}</div>
              <div className="small text-muted text-capitalize">{String(file.file_role || "").replace(/_/g, " ")}</div>
              <a className="small" href={`/${file.file_path}`} target="_blank" rel="noreferrer">Open file</a>
            </div>
          ))
        )}
      </div>
      <div className="col-md-6 mb-3">
        <h6 className="mb-2">Review Attachments</h6>
        {!reviewAttachments.length ? (
          <div className="text-muted small">No review attachments uploaded yet.</div>
        ) : (
          reviewAttachments.map((file) => (
            <div key={file.file_id} className="border rounded p-2 mb-2">
              <div className="font-weight-bold">{file.original_name}</div>
              <div className="small text-muted">Uploaded {formatDate(file.created_at)}</div>
              <a className="small" href={`/${file.file_path}`} target="_blank" rel="noreferrer">Open attachment</a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function DetailModal({ row, detail, files, loading, onClose }) {
  return (
    <ModalShell
      title={detail?.title || row?.title || "Submission detail"}
      subtitle={detail?.author_name || row?.author_name || "Reviewer assignment detail"}
      onClose={onClose}
      footer={<button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>}
    >
      {loading ? (
        <div className="text-center py-4">Loading…</div>
      ) : (
        <>
          <AssignmentSummaryTable row={row} detail={detail} />
          {detail?.review ? (
            <div className="table-responsive mb-4">
              <table className="table table-bordered table-sm mb-0">
                <tbody>
                  <tr><th style={{ width: 220 }}>Recommendation</th><td>{detail.review.recommendation || "—"}</td></tr>
                  <tr><th>Comments for author</th><td>{detail.review.comments_for_author || "—"}</td></tr>
                  <tr><th>Confidential comments</th><td>{detail.review.confidential_comments || "—"}</td></tr>
                </tbody>
              </table>
            </div>
          ) : null}
          <FilesBlock files={files} />
        </>
      )}
    </ModalShell>
  );
}

function ReviewFormModal({ row, detail, files, form, template, loading, busy, onChange, onClose, onSubmit }) {
  const selectedAttachments = Array.isArray(form?.attachments) ? form.attachments : [];
  return (
    <ModalShell
      title={detail?.title || row?.title || "Review form"}
      subtitle="Provide recommendation and comments, then submit the review."
      onClose={onClose}
      footer={(
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
          <button type="button" className="btn btn-primary" disabled={busy || loading} onClick={onSubmit}>
            {busy ? "Submitting…" : "Submit review"}
          </button>
        </>
      )}
    >
      {loading ? (
        <div className="text-center py-4">Loading…</div>
      ) : (
        <>
          <AssignmentSummaryTable row={row} detail={detail} />
          <div className="row">
            {(template?.criteria || []).map((criterion) => (
              <div className="col-md-4" key={criterion.key}>
                <div className="form-group">
                  <label>{criterion.label}</label>
                  <select
                    className="form-control"
                    value={form[criterion.key] ?? 3}
                    onChange={(e) => onChange({ [criterion.key]: Number(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5].map((score) => (
                      <option key={score} value={score}>{score}</option>
                    ))}
                  </select>
                  <small className="form-text text-muted">{criterion.help}</small>
                </div>
              </div>
            ))}
          </div>

          <div className="form-group">
            <label>Recommendation</label>
            <select className="form-control" value={form.recommendation} onChange={(e) => onChange({ recommendation: e.target.value })}>
              {(template?.recommendations || [
                { value: "accept", label: "Accept" },
                { value: "minor_revision", label: "Minor revision" },
                { value: "major_revision", label: "Major revision" },
                { value: "reject", label: "Reject" },
              ]).map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Comments for author</label>
            <textarea className="form-control" rows="5" value={form.comments_for_author} onChange={(e) => onChange({ comments_for_author: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Confidential comments</label>
            <textarea className="form-control" rows="5" value={form.confidential_comments} onChange={(e) => onChange({ confidential_comments: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Review attachments</label>
            <input
              type="file"
              multiple
              className="form-control"
              onChange={(e) => onChange({ attachments: Array.from(e.target.files || []) })}
            />
            <small className="form-text text-muted">You can attach annotated manuscripts, checklists, or supporting review files.</small>
            {selectedAttachments.length ? (
              <div className="mt-2">
                {selectedAttachments.map((file, index) => (
                  <span key={`${file.name}-${index}`} className="badge badge-light border mr-2 mb-2">
                    {file.name}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <FilesBlock files={files} />
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
      setError(err?.response?.data?.message || "Failed to load reviewer assignments.");
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

  const baseFilteredRows = useMemo(() => getFilteredRows(rows, filter), [rows, filter]);
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
      const dueA = a?.due_date ? new Date(a.due_date).getTime() : Number.MAX_SAFE_INTEGER;
      const dueB = b?.due_date ? new Date(b.due_date).getTime() : Number.MAX_SAFE_INTEGER;
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
    if ((template?.criteria || []).length || (template?.recommendations || []).length) return;
    const templateRes = await ebookApi.getReviewTemplate();
    setTemplate(templateRes || { criteria: [], recommendations: [] });
  };

  const ensureDetailData = async (assignmentId) => {
    if (detailMap[assignmentId] && filesMap[assignmentId]) {
      return { detail: detailMap[assignmentId], files: filesMap[assignmentId] };
    }

    const [detailRes, filesRes] = await Promise.all([
      detailMap[assignmentId] ? Promise.resolve(detailMap[assignmentId]) : ebookApi.getReviewAssignment(assignmentId),
      filesMap[assignmentId] ? Promise.resolve(filesMap[assignmentId]) : ebookApi.getReviewAssignmentFiles(assignmentId),
    ]);

    setDetailMap((prev) => ({ ...prev, [assignmentId]: detailRes }));
    setFilesMap((prev) => ({ ...prev, [assignmentId]: filesRes || { manuscript_files: [], review_attachments: [] } }));

    return { detail: detailRes, files: filesRes || { manuscript_files: [], review_attachments: [] } };
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
          [row.assignment_id]: prev[row.assignment_id] || buildReviewForm(detail),
        }));
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load assignment detail.");
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
      setNotice(status === "accepted" ? "Assignment accepted successfully." : "Assignment rejected successfully.");
      closeModal();
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update assignment response.");
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
      await ebookApi.submitReview(row.assignment_id, forms[row.assignment_id] || DEFAULT_FORM);
      setNotice("Review submitted successfully.");
      closeModal();
      setForms((prev) => ({
        ...prev,
        [row.assignment_id]: { ...DEFAULT_FORM },
      }));
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit review.");
    } finally {
      setBusy(false);
    }
  };

  const detail = modalState.row ? detailMap[modalState.row.assignment_id] : null;
  const files = modalState.row ? filesMap[modalState.row.assignment_id] : { manuscript_files: [], review_attachments: [] };
  const activeForm = modalState.row ? (forms[modalState.row.assignment_id] || DEFAULT_FORM) : DEFAULT_FORM;

  return (
    <MainLayout>
      <section className="content-header mb-3">
        <h1>{titleWithCount}</h1>
        <p className="text-muted mb-0">{page.subtitle}</p>
      </section>

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {notice ? <div className="alert alert-success">{notice}</div> : null}

      <div className="card card-outline card-primary mb-3">
        <div className="card-body pb-2">
          <div className="d-flex flex-wrap align-items-center justify-content-between">
            <div className="nav nav-pills mb-2">
              {STATUS_TABS.map((tab) => {
                const active = tab.key === filter;
                return (
                  <Link
                    key={tab.key}
                    to={tab.path}
                    className={`nav-link mr-2 mb-2 ${active ? "active" : ""}`}
                  >
                    {tab.label} <span className="badge badge-light ml-1">{counts[tab.key] ?? 0}</span>
                  </Link>
                );
              })}
            </div>
            <div className="form-group mb-2" style={{ minWidth: 280 }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search title, author, or status"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card card-outline card-primary">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-bordered table-hover mb-0">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>#</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Assigned Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th style={{ width: 90 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-4">Loading…</td></tr>
                ) : !filteredRows.length ? (
                  <tr><td colSpan="7" className="text-center text-muted py-4">{page.empty}</td></tr>
                ) : filteredRows.map((row, index) => {
                  const actionItems = getActionItems(row, filter);
                  const menuOpen = menuId === row.assignment_id;
                  return (
                    <tr key={row.assignment_id}>
                      <td>{index + 1}</td>
                      <td>{row.title || "—"}</td>
                      <td>{row.author_name || "—"}</td>
                      <td>{formatDate(row.assigned_at)}</td>
                      <td>{formatDate(row.due_date)}</td>
                      <td><StatusBadge value={getStatusForBadge(row)} /></td>
                      <td className="text-center" style={{ position: "relative" }}>
                        <div ref={menuOpen ? menuRef : null} className="d-inline-block text-left">
                          <button
                            type="button"
                            className="btn btn-sm btn-light border"
                            onClick={() => setMenuId((prev) => (prev === row.assignment_id ? null : row.assignment_id))}
                            aria-label="Open actions"
                          >
                            &#8942;
                          </button>
                          {menuOpen ? (
                            <div
                              className="bg-white border rounded shadow-sm py-1"
                              style={{ position: "absolute", right: 0, top: 34, minWidth: 190, zIndex: 20 }}
                            >
                              {actionItems.map((item) => (
                                <button
                                  key={item.key}
                                  type="button"
                                  className="dropdown-item"
                                  onClick={() => {
                                    if (item.key === "detail") openModal("detail", row);
                                    if (item.key === "review") openModal("review", row);
                                    if (item.key === "accept") respond(row.assignment_id, "accepted");
                                    if (item.key === "reject") respond(row.assignment_id, "declined");
                                  }}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalState.type === "detail" && modalState.row ? (
        <DetailModal
          row={modalState.row}
          detail={detail}
          files={files}
          loading={detailLoading}
          onClose={closeModal}
        />
      ) : null}

      {modalState.type === "review" && modalState.row ? (
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
      ) : null}
    </MainLayout>
  );
}
