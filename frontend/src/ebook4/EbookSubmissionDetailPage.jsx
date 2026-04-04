import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout.jsx";
import ebookApi from "../../api/ebook.api";
import StatusBadge from "./components/StatusBadge.jsx";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.REACT_APP_API_URL ||
  "http://localhost:5000";

const ROLE_GROUPS = {
  author: ["EBOOK_AUTHOR"],
  editor: ["EBOOK_EDITOR", "BOOK_EDITOR"],
  reviewer: ["EBOOK_REVIEWER", "PEER_REVIEWER"],
  finance: ["EBOOK_FINANCE", "FINANCE_OFFICER"],
  production: ["EBOOK_PRODUCTION", "DIGITAL_CONTENT_MANAGER", "CONTENT_MANAGER"],
  admin: ["EBOOK_ADMIN", "ADMIN", "SUPER_ADMIN"],
};

const normalizeRoleName = (value) =>
  (value || "").toString().trim().toUpperCase().replace(/\s+/g, "_");

const normalizeStatus = (value) =>
  (value || "").toString().trim().toLowerCase().replace(/\s+/g, "_");

const roleNamesFromUser = (user) =>
  user?.roles?.map((r) => normalizeRoleName(r?.role_name || r?.name || r?.code || r)) || [];

const hasRole = (user, names = []) => {
  const userRoles = roleNamesFromUser(user);
  return names.some((name) => userRoles.includes(normalizeRoleName(name)));
};

const detectViewRole = (user) => {
  if (!user) return "author";
  if (hasRole(user, ROLE_GROUPS.admin)) return "admin";
  if (hasRole(user, ROLE_GROUPS.editor)) return "editor";
  if (hasRole(user, ROLE_GROUPS.reviewer)) return "reviewer";
  if (hasRole(user, ROLE_GROUPS.finance)) return "finance";
  if (hasRole(user, ROLE_GROUPS.production)) return "production";
  if (hasRole(user, ROLE_GROUPS.author)) return "author";
  return "author";
};

const backRouteByRole = {
  author: "/ebook/my-submissions",
  editor: "/ebook/editor/screening",
  reviewer: "/ebook/reviewer",
  finance: "/ebook/finance",
  production: "/ebook/production",
  admin: "/ebook/admin",
};

const titleByRole = {
  author: "Author Submission Detail",
  editor: "Editor Submission Detail",
  reviewer: "Reviewer Submission Detail",
  finance: "Finance Submission Detail",
  production: "Production Submission Detail",
  admin: "Admin Submission Detail",
};

const subtitleByRole = {
  author: "Track, continue, and manage your manuscript submission.",
  editor: "Screen, assign, and decide on the submission from one workspace.",
  reviewer: "Review only the assigned manuscript and submit your evaluation.",
  finance: "Verify billing, BPC, invoices, waivers, and payment readiness.",
  production: "Handle accepted content, publication files, and release metadata.",
  admin: "Full oversight across workflow, files, decisions, and audit history.",
};

const getFileName = (file) =>
  file?.original_name || file?.name || file?.stored_name || "Unnamed file";

const getFileUrl = (file) => {
  if (file?.download_url) return file.download_url;
  if (file?.view_url) return file.view_url;
  if (file?.url) return file.url;
  if (file?.file_path) return `${API_BASE}/${String(file.file_path).replace(/^\/+/, "")}`;
  if (file?.stored_name) return `${API_BASE}/uploads/ebooks/${file.stored_name}`;
  return "#";
};

const getExtension = (name = "") => {
  const parts = String(name).split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
};

const isReadableFile = (file) => {
  const name = getFileName(file);
  const mime = String(file?.mime_type || "").toLowerCase();
  const ext = getExtension(name);
  return (
    mime.includes("pdf") ||
    mime.startsWith("text/") ||
    mime.startsWith("image/") ||
    ["pdf", "txt", "md", "png", "jpg", "jpeg", "gif", "webp"].includes(ext)
  );
};

const isPdfFile = (file) => {
  const name = getFileName(file);
  const mime = String(file?.mime_type || "").toLowerCase();
  const ext = getExtension(name);
  return mime.includes("pdf") || ext === "pdf";
};

const isImageFile = (file) => {
  const name = getFileName(file);
  const mime = String(file?.mime_type || "").toLowerCase();
  const ext = getExtension(name);
  return mime.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp"].includes(ext);
};

const isTextFile = (file) => {
  const name = getFileName(file);
  const mime = String(file?.mime_type || "").toLowerCase();
  const ext = getExtension(name);
  return mime.startsWith("text/") || ["txt", "md"].includes(ext);
};

const formatDate = (dateString, withTime = true) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    });
  } catch {
    return dateString;
  }
};

const toKeywordArray = (keywords) => {
  if (Array.isArray(keywords)) return keywords.filter(Boolean);
  if (typeof keywords === "string") {
    return keywords
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const InfoTable = ({ rows }) => (
  <div className="table-responsive">
    <table className="table table-striped table-hover mb-0">
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <th style={{ width: "220px", backgroundColor: "#f8f9fa" }}>{row.label}</th>
            <td>{row.value ?? "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const CardSection = ({ title, icon, children, right }) => (
  <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "16px", overflow: "hidden" }}>
    <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center flex-wrap">
      <h3 className="h5 mb-0 font-weight-bold">
        <i className={`fas ${icon} text-primary mr-2`}></i>
        {title}
      </h3>
      {right || null}
    </div>
    <div className="card-body p-0">{children}</div>
  </div>
);

const EmptyState = ({ icon = "fa-folder-open", text = "No records available." }) => (
  <div className="text-center py-4">
    <i className={`fas ${icon} fa-3x text-muted mb-3`}></i>
    <p className="text-muted mb-0">{text}</p>
  </div>
);

const FileRow = ({ file, onRead }) => {
  const colorMap = {
    manuscript: "primary",
    revision: "warning",
    proof: "success",
    pdf: "danger",
    epub: "info",
    cover: "secondary",
    supplementary: "dark",
  };
  const color = colorMap[file.file_role] || "secondary";
  const fileUrl = getFileUrl(file);
  const readable = isReadableFile(file);

  return (
    <tr>
      <td>{getFileName(file)}</td>
      <td><span className="badge badge-light">{file.file_role || "file"}</span></td>
      <td>v{file.version_no || file.version || "1"}</td>
      <td>
        {file.file_size_bytes
          ? `${(file.file_size_bytes / 1024 / 1024).toFixed(2)} MB`
          : file.file_size
          ? `${(file.file_size / 1024 / 1024).toFixed(2)} MB`
          : file.size_bytes
          ? `${(file.size_bytes / 1024 / 1024).toFixed(2)} MB`
          : "—"}
      </td>
      <td>{formatDate(file.created_at || file.uploaded_at)}</td>
      <td>
        <div className="d-flex gap-2 flex-wrap">
          {readable ? (
            <button className="btn btn-sm btn-outline-primary mr-2" onClick={() => onRead(file)}>
              <i className="fas fa-book-open mr-1"></i>Read
            </button>
          ) : null}
          {fileUrl !== "#" ? (
            <a className={`btn btn-sm btn-outline-${color}`} href={fileUrl} target="_blank" rel="noopener noreferrer">
              <i className="fas fa-download mr-1"></i>Open
            </a>
          ) : (
            <span className="text-danger small">File unavailable</span>
          )}
        </div>
      </td>
    </tr>
  );
};

const HistoryTimeline = ({ history }) => {
  if (!history?.length) return <EmptyState icon="fa-history" text="No workflow history available." />;
  return (
    <div className="timeline p-3">
      {history.map((item, index) => (
        <div key={item.history_id || item.id || index} className="timeline-item pb-4">
          <div className="d-flex">
            <div className="timeline-marker mr-3">
              <div className="rounded-circle bg-primary" style={{ width: "12px", height: "12px" }}></div>
            </div>
            <div className="timeline-content flex-grow-1">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                <h6 className="font-weight-bold mb-1">{item.action || "Workflow update"}</h6>
                <small className="text-muted">{formatDate(item.created_at)}</small>
              </div>
              <p className="small text-muted mb-1">
                <i className="fas fa-user mr-1"></i>
                {item.actor_name || item.actor_email || item.actor_id || "System"}
              </p>
              <div className="d-flex align-items-center mb-2 flex-wrap">
                <span className="badge badge-light mr-2">{item.from_status || "—"}</span>
                <i className="fas fa-arrow-right text-muted mx-2"></i>
                <span className="badge badge-light">{item.to_status || "—"}</span>
              </div>
              {item.note ? <div className="p-2 bg-light rounded small">{item.note}</div> : null}
            </div>
          </div>
          {index < history.length - 1 ? (
            <div className="timeline-line" style={{ position: "relative", left: "6px", width: "2px", height: "20px", backgroundColor: "#e0e0e0", marginLeft: "23px" }}></div>
          ) : null}
        </div>
      ))}
    </div>
  );
};

const ReviewTable = ({ reviews, showReviewer = true, showConfidential = false }) => {
  if (!reviews?.length) return <EmptyState icon="fa-star" text="No reviews available." />;
  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover mb-0">
        <thead className="bg-light">
          <tr>
            {showReviewer ? <th>Reviewer</th> : null}
            <th>Recommendation</th>
            <th>Comments</th>
            {showConfidential ? <th>Confidential</th> : null}
            <th>Submitted</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review.review_id || review.id}>
              {showReviewer ? <td className="font-weight-bold">{review.reviewer_name || "Reviewer"}</td> : null}
              <td><span className="badge badge-primary">{review.recommendation || "pending"}</span></td>
              <td>{review.comments_for_author || review.comments || "No comments provided."}</td>
              {showConfidential ? <td>{review.confidential_comments || "—"}</td> : null}
              <td>{formatDate(review.submitted_at || review.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AssignmentTable = ({ assignments }) => {
  if (!assignments?.length) return <EmptyState icon="fa-user-check" text="No reviewer assignments found." />;
  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover mb-0">
        <thead className="bg-light">
          <tr>
            <th>Reviewer</th>
            <th>Status</th>
            <th>Assigned</th>
            <th>Due Date</th>
            <th>Recommendation</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((item) => (
            <tr key={item.assignment_id || item.id}>
              <td>{item.reviewer_name || item.reviewer_email || item.reviewer_id || "—"}</td>
              <td><StatusBadge value={item.status || "assigned"} /></td>
              <td>{formatDate(item.assigned_at)}</td>
              <td>{formatDate(item.due_date, false)}</td>
              <td>{item.recommendation || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const FinanceSummary = ({ submission, finance }) => {
  const rows = [
    { label: "Requires BPC", value: submission?.requires_bpc ? "Yes" : "No" },
    { label: "BPC Amount", value: submission?.bpc_amount ?? finance?.bpc_amount ?? "—" },
    { label: "Invoice Status", value: finance?.invoice_status || submission?.invoice_status || "—" },
    { label: "Payment Status", value: finance?.payment_status || submission?.payment_status || "—" },
    { label: "Waiver Status", value: finance?.waiver_status || submission?.waiver_status || "—" },
    { label: "Verified By", value: finance?.verified_by_name || finance?.verified_by || "—" },
  ];
  return <InfoTable rows={rows} />;
};

const ProductionSummary = ({ submission, publication }) => {
  const rows = [
    { label: "Production Status", value: publication?.status || submission?.production_status || "—" },
    { label: "Publication Status", value: submission?.publication_status || publication?.publication_status || "—" },
    { label: "DOI", value: submission?.doi || publication?.doi || "—" },
    { label: "ISBN", value: submission?.isbn || publication?.isbn || "—" },
    { label: "Cover File", value: publication?.cover_file_name || publication?.cover_image || "—" },
    { label: "Published At", value: formatDate(publication?.published_at || submission?.published_at) },
  ];
  return <InfoTable rows={rows} />;
};

const RoleHighlights = ({ role }) => {
  const items = {
    author: ["See only your own submission, versions, and shareable feedback.", "Continue draft or resubmit when revision is requested.", "Track workflow history without confidential reviewer notes."],
    editor: ["See screening, reviewer assignments, recommendations, and decision context.", "Use this page before assign-reviewer and decision actions.", "Confidential review notes are visible to editor and admin only."],
    reviewer: ["See only the manuscript and review-safe metadata.", "Other reviewer identities and editorial private notes stay hidden.", "Use the dedicated review page to respond and submit review."],
    finance: ["Focus on BPC, invoice, waiver, and payment verification.", "Editorial-only confidential comments are not shown here.", "Use finance pages for payment actions; this page is detail context."],
    production: ["Available after acceptance / handoff.", "Shows identifiers, publication readiness, and production files.", "Use production page to upload final assets and publish."],
    admin: ["Full audit visibility across all workflow stages.", "Can inspect confidential notes, assignments, files, and identifiers.", "Best page for troubleshooting workflow mismatches."],
  };

  return (
    <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: "16px", overflow: "hidden" }}>
      <div className="card-header bg-white border-0 py-3 px-4">
        <h3 className="h6 mb-0 font-weight-bold">
          <i className="fas fa-eye text-primary mr-2"></i>
          Role Visibility
        </h3>
      </div>
      <div className="card-body">
        <ul className="mb-0 pl-3">
          {(items[role] || []).map((item) => (
            <li key={item} className="mb-2">{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default function EbookSubmissionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [data, setData] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) setUser(JSON.parse(userStr));
    } catch (err) {
      console.error("Error parsing user:", err);
    }
  }, []);

  const viewRole = useMemo(() => detectViewRole(user), [user]);
  const submission = data?.submission || null;
  const submissionStatus = normalizeStatus(submission?.status);
  const canContinueSubmit = viewRole === "author" && submissionStatus === "draft";
  const readableFiles = useMemo(() => (data?.files || []).filter(isReadableFile), [data]);
  const keywordList = useMemo(() => toKeywordArray(submission?.keywords), [submission]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await ebookApi.getWorkflow(id);
      setData(result);
      const firstReadable = (result?.files || []).find(isReadableFile);
      setPreviewFile(firstReadable || null);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to load submission detail."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) load();
  }, [id]);

  const renderPreview = () => {
    if (!previewFile) return <EmptyState icon="fa-book-open" text="Select a readable file to preview." />;
    const fileUrl = getFileUrl(previewFile);
    if (!fileUrl || fileUrl === "#") return <EmptyState icon="fa-exclamation-circle" text="File URL is unavailable." />;
    if (isPdfFile(previewFile)) return <iframe title={getFileName(previewFile)} src={fileUrl} style={{ width: "100%", height: "700px", border: 0 }} />;
    if (isImageFile(previewFile)) {
      return <div className="text-center p-3"><img src={fileUrl} alt={getFileName(previewFile)} style={{ maxWidth: "100%", maxHeight: "700px", borderRadius: "8px" }} /></div>;
    }
    if (isTextFile(previewFile)) return <iframe title={getFileName(previewFile)} src={fileUrl} style={{ width: "100%", height: "500px", border: 0 }} />;
    return <EmptyState icon="fa-file" text="This file cannot be previewed inline." />;
  };

  const baseRows = [
    { label: "Title", value: submission?.title || "—" },
    { label: "Subtitle", value: submission?.subtitle || "—" },
    { label: "Abstract", value: submission?.abstract || "—" },
    { label: "Category", value: submission?.category || "—" },
    { label: "Language", value: submission?.language || "—" },
    { label: "Publication Year", value: submission?.publication_year || "—" },
    { label: "Current Status", value: <StatusBadge value={submission?.status || "draft"} /> },
    {
      label: "Keywords",
      value: keywordList.length ? keywordList.map((keyword) => <span key={keyword} className="badge badge-light mr-2 mb-2 px-3 py-2">{keyword}</span>) : "—",
    },
    { label: "Created", value: formatDate(submission?.created_at) },
    { label: "Last Updated", value: formatDate(submission?.updated_at) },
  ];

  const roleRows = {
    author: [
      { label: "Submission ID", value: submission?.submission_id || submission?.id || id },
      { label: "Version No", value: submission?.current_version_no || submission?.version_no || "1" },
      { label: "Final Decision", value: submission?.final_decision || "Pending" },
      { label: "Author", value: submission?.author_name || "—" },
    ],
    editor: [
      { label: "Submission ID", value: submission?.submission_id || submission?.id || id },
      { label: "Author", value: submission?.author_name || "—" },
      { label: "Assigned Editor", value: submission?.editor_name || "—" },
      { label: "Assigned Reviewer Count", value: submission?.assigned_reviewer_count ?? data?.assignments?.length ?? 0 },
      { label: "Final Decision", value: submission?.final_decision || "Pending" },
    ],
    reviewer: [
      { label: "Submission ID", value: submission?.submission_id || submission?.id || id },
      { label: "Assigned Editor", value: submission?.editor_name || "—" },
      { label: "Review Deadline", value: formatDate(data?.current_assignment?.due_date || data?.assignment?.due_date, false) },
      { label: "Review Status", value: data?.current_assignment?.status || data?.assignment?.status || "assigned" },
    ],
    finance: [
      { label: "Submission ID", value: submission?.submission_id || submission?.id || id },
      { label: "Author", value: submission?.author_name || "—" },
      { label: "Decision", value: submission?.final_decision || "Pending" },
      { label: "Payment Status", value: submission?.payment_status || data?.finance?.payment_status || "—" },
    ],
    production: [
      { label: "Submission ID", value: submission?.submission_id || submission?.id || id },
      { label: "Author", value: submission?.author_name || "—" },
      { label: "Decision", value: submission?.final_decision || "Pending" },
      { label: "Publication Status", value: submission?.publication_status || data?.publication?.status || "—" },
    ],
    admin: [
      { label: "Submission ID", value: submission?.submission_id || submission?.id || id },
      { label: "Author", value: submission?.author_name || "—" },
      { label: "Editor", value: submission?.editor_name || "—" },
      { label: "Decision", value: submission?.final_decision || "Pending" },
      { label: "Deleted", value: submission?.is_deleted ? "Yes" : "No" },
    ],
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "70vh" }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" style={{ width: "3rem", height: "3rem" }} role="status"><span className="sr-only">Loading...</span></div>
            <h5 className="text-muted">Loading submission details...</h5>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!submission) {
    return (
      <MainLayout>
        <div className="text-center py-5">
          <i className="fas fa-exclamation-circle fa-4x text-warning mb-3"></i>
          <h3 className="mb-2">Submission Not Found</h3>
          <p className="text-muted mb-4">The requested submission could not be found.</p>
          <Link to={backRouteByRole[viewRole] || "/ebook/submissions"} className="btn btn-primary px-4 py-2 rounded-pill">
            <i className="fas fa-arrow-left mr-2"></i>Go Back
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="content-header mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h1 className="display-5 mb-2 font-weight-bold" style={{ color: "#2d3748" }}>
              <i className="fas fa-file-alt mr-3 text-primary"></i>
              {titleByRole[viewRole] || "Submission Detail"}
            </h1>
            <p className="text-muted mb-0">{subtitleByRole[viewRole] || "Submission detail workspace."}</p>
          </div>
          <div className="d-flex align-items-center flex-wrap">
            {canContinueSubmit ? (
              <button className="btn btn-primary btn-lg rounded-pill px-4 shadow-sm mr-2" onClick={() => navigate(`/ebook/submissions/${id}/edit`)}>
                <i className="fas fa-edit mr-2"></i>Continue to Submit
              </button>
            ) : null}
            <Link className="btn btn-light btn-lg rounded-pill px-4 shadow-sm" to={backRouteByRole[viewRole] || "/ebook/submissions"}>
              <i className="fas fa-arrow-left mr-2"></i>Back
            </Link>
          </div>
        </div>
      </div>

      {error ? <div className="alert alert-danger rounded-lg shadow-sm mb-4">{error}</div> : null}
      {notice ? <div className="alert alert-success rounded-lg shadow-sm mb-4">{notice}</div> : null}

      <div className="mb-4 d-flex align-items-center flex-wrap">
        <StatusBadge value={submission.status} size="lg" />
        {submission.final_decision ? (
          <span className="ml-3"><span className="text-muted">Final Decision:</span><span className="ml-2 font-weight-bold text-primary">{submission.final_decision}</span></span>
        ) : null}
        {submissionStatus === "draft" && viewRole === "author" ? <span className="badge badge-warning ml-3 px-3 py-2">Draft can still be submitted</span> : null}
        <span className="badge badge-info ml-3 px-3 py-2 text-uppercase">{viewRole}</span>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <CardSection title="Submission Information" icon="fa-info-circle">
            <InfoTable rows={[...baseRows, ...(roleRows[viewRole] || [])]} />
          </CardSection>

          {(viewRole === "author" || viewRole === "editor" || viewRole === "admin") && data?.reviews?.length ? (
            <CardSection title={viewRole === "author" ? "Author Feedback" : "Reviews"} icon="fa-star">
              <ReviewTable reviews={data.reviews} showReviewer={viewRole !== "author"} showConfidential={viewRole === "editor" || viewRole === "admin"} />
            </CardSection>
          ) : null}

          {(viewRole === "editor" || viewRole === "admin") ? (
            <CardSection title="Reviewer Assignments" icon="fa-user-check">
              <AssignmentTable assignments={data?.assignments || data?.review_assignments || []} />
            </CardSection>
          ) : null}

          {(viewRole === "finance" || viewRole === "admin") ? (
            <CardSection title="Finance Summary" icon="fa-money-check-alt">
              <FinanceSummary submission={submission} finance={data?.finance || data?.payment || {}} />
            </CardSection>
          ) : null}

          {(viewRole === "production" || viewRole === "admin") ? (
            <CardSection title="Production & Publication" icon="fa-book">
              <ProductionSummary submission={submission} publication={data?.publication || data?.production || {}} />
            </CardSection>
          ) : null}

          <CardSection
            title="File Reader"
            icon="fa-book-reader"
            right={previewFile && getFileUrl(previewFile) !== "#" ? <a className="btn btn-sm btn-outline-secondary" href={getFileUrl(previewFile)} target="_blank" rel="noopener noreferrer"><i className="fas fa-external-link-alt mr-1"></i>Open in New Tab</a> : null}
          >
            {renderPreview()}
          </CardSection>

          <CardSection title="Files" icon="fa-file">
            {!data?.files?.length ? (
              <EmptyState icon="fa-file-upload" text="No files uploaded yet." />
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>File Name</th>
                      <th>Type</th>
                      <th>Version</th>
                      <th>Size</th>
                      <th>Uploaded</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.files.map((file) => <FileRow key={file.file_id || file.id} file={file} onRead={setPreviewFile} />)}
                  </tbody>
                </table>
              </div>
            )}
          </CardSection>
        </div>

        <div className="col-lg-4">
          <RoleHighlights role={viewRole} />

          {readableFiles.length > 0 ? (
            <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: "16px", overflow: "hidden" }}>
              <div className="card-header bg-white border-0 py-3 px-4">
                <h3 className="h6 mb-0 font-weight-bold"><i className="fas fa-list text-primary mr-2"></i>Readable Files</h3>
              </div>
              <div className="card-body">
                {readableFiles.map((file) => (
                  <button
                    key={file.file_id || file.id}
                    type="button"
                    className={`btn btn-block text-left mb-2 ${previewFile && (previewFile.file_id || previewFile.id) === (file.file_id || file.id) ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setPreviewFile(file)}
                  >
                    <i className="fas fa-book-open mr-2"></i>{getFileName(file)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="card border-0 shadow-sm" style={{ borderRadius: "16px", overflow: "hidden" }}>
            <div className="card-header bg-white border-0 py-3 px-4">
              <h3 className="h5 mb-0 font-weight-bold"><i className="fas fa-history text-primary mr-2"></i>Workflow History</h3>
            </div>
            <div className="card-body p-0" style={{ maxHeight: "500px", overflowY: "auto" }}>
              <HistoryTimeline history={data?.history || []} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

const styleId = "ebook-submission-detail-styles";
if (typeof document !== "undefined" && !document.getElementById(styleId)) {
  const styleSheet = document.createElement("style");
  styleSheet.id = styleId;
  styleSheet.textContent = `
    .table th { font-weight: 600; color: #495057; }
    .table td { vertical-align: middle; }
  `;
  document.head.appendChild(styleSheet);
}
