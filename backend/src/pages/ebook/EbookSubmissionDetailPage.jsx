import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout.jsx";
import ebookApi from "../../api/ebook.api";
import StatusBadge from "./components/StatusBadge.jsx";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.REACT_APP_API_URL ||
  "http://localhost:5000";

const normalizeRoleName = (value) =>
  (value || "").toString().trim().toUpperCase().replace(/\s+/g, "_");

const normalizeStatus = (value) =>
  (value || "").toString().trim().toLowerCase().replace(/\s+/g, "_");

const hasRole = (user, names = []) => {
  if (!user) return false;
  const userRoles =
    user?.roles?.map((r) =>
      normalizeRoleName(r.role_name || r.name || r.code || r)
    ) || [];
  return names.some((name) => userRoles.includes(normalizeRoleName(name)));
};

const getFileName = (file) =>
  file?.original_name || file?.name || file?.stored_name || "Unnamed file";

const getFileUrl = (file) => {
  if (file?.download_url) return file.download_url;
  if (file?.view_url) return file.view_url;
  if (file?.url) return file.url;

  if (file?.file_path) {
    return `${API_BASE}/${String(file.file_path).replace(/^\/+/, "")}`;
  }

  if (file?.stored_name) {
    return `${API_BASE}/uploads/ebooks/${file.stored_name}`;
  }

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
  return (
    mime.startsWith("image/") ||
    ["png", "jpg", "jpeg", "gif", "webp"].includes(ext)
  );
};

const isTextFile = (file) => {
  const name = getFileName(file);
  const mime = String(file?.mime_type || "").toLowerCase();
  const ext = getExtension(name);
  return mime.startsWith("text/") || ["txt", "md"].includes(ext);
};

const FileRow = ({ file, onRead }) => {
  const getFileIcon = () => {
    const icons = {
      manuscript: "fa-file-alt",
      revision: "fa-code-branch",
      proof: "fa-check-circle",
      pdf: "fa-file-pdf",
      epub: "fa-book",
      cover: "fa-image",
      supplementary: "fa-paperclip",
    };
    return icons[file.file_role] || "fa-file";
  };

  const getFileColor = () => {
    const colors = {
      manuscript: "primary",
      revision: "warning",
      proof: "success",
      pdf: "danger",
      epub: "info",
      cover: "secondary",
      supplementary: "dark",
    };
    return colors[file.file_role] || "secondary";
  };

  const color = getFileColor();
  const icon = getFileIcon();
  const fileUrl = getFileUrl(file);
  const readable = isReadableFile(file);

  return (
    <tr>
      <td>
        <div
          className={`icon-circle bg-soft-${color} text-${color}`}
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "8px",
          }}
        >
          <i className={`fas ${icon}`}></i>
        </div>
        {getFileName(file)}
      </td>
      <td>
        <span className="badge badge-light">{file.file_role || "file"}</span>
      </td>
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
      <td>
        {file.created_at
          ? new Date(file.created_at).toLocaleDateString()
          : file.uploaded_at
          ? new Date(file.uploaded_at).toLocaleDateString()
          : "N/A"}
      </td>
      <td>
        <div className="d-flex gap-2">
          {readable ? (
            <button
              className="btn btn-sm btn-outline-primary mr-2"
              onClick={() => onRead(file)}
              title="Read file"
            >
              <i className="fas fa-book-open mr-1"></i>
              Read
            </button>
          ) : null}

          {fileUrl !== "#" ? (
            <a
              className="btn btn-sm btn-outline-secondary"
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Download or open"
            >
              <i className="fas fa-download mr-1"></i>
              Open
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
  if (!history?.length) {
    return (
      <div className="text-center py-5">
        <div className="empty-state">
          <i className="fas fa-history fa-3x text-muted mb-3"></i>
          <p className="text-muted">No workflow history available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline p-3">
      {history.map((item, index) => (
        <div key={item.history_id || item.id || index} className="timeline-item pb-4">
          <div className="d-flex">
            <div className="timeline-marker mr-3">
              <div
                className="rounded-circle bg-primary"
                style={{ width: "12px", height: "12px" }}
              ></div>
            </div>
            <div className="timeline-content flex-grow-1">
              <div className="d-flex justify-content-between align-items-start">
                <h6 className="font-weight-bold mb-1">{item.action}</h6>
                <small className="text-muted">
                  {item.created_at ? new Date(item.created_at).toLocaleString() : ""}
                </small>
              </div>
              <p className="small text-muted mb-1">
                <i className="fas fa-user mr-1"></i>
                {item.actor_name || item.actor_email || item.actor_id || "System"}
              </p>
              <div className="d-flex align-items-center mb-2">
                <span className="badge badge-light mr-2">{item.from_status || "—"}</span>
                <i className="fas fa-arrow-right text-muted mx-2"></i>
                <span className="badge badge-light">{item.to_status || "—"}</span>
              </div>
              {item.note && (
                <div className="p-2 bg-light rounded small">
                  <i className="fas fa-quote-left text-muted mr-1"></i>
                  {item.note}
                </div>
              )}
            </div>
          </div>
          {index < history.length - 1 && (
            <div
              className="timeline-line"
              style={{
                position: "relative",
                left: "6px",
                width: "2px",
                height: "20px",
                backgroundColor: "#e0e0e0",
                marginLeft: "23px",
              }}
            ></div>
          )}
        </div>
      ))}
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
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
    } catch (err) {
      console.error("Error parsing user:", err);
    }
  }, []);

  const canAuthor = hasRole(user, ["EBOOK_AUTHOR", "EBOOK_ADMIN"]);
  const submissionStatus = normalizeStatus(data?.submission?.status);
  const isDraft = submissionStatus === "draft";
  const canContinueSubmit = canAuthor && isDraft;

  const readableFiles = useMemo(() => {
    return (data?.files || []).filter(isReadableFile);
  }, [data]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await ebookApi.getWorkflow(id);
      setData(result);

      if (result?.files?.length) {
        const firstReadable = result.files.find(isReadableFile);
        setPreviewFile(firstReadable || null);
      } else {
        setPreviewFile(null);
      }
    } catch (err) {
      console.error("Load error:", err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to load workflow."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) load();
  }, [id]);

  const handleContinueSubmission = () => {
    navigate(`/ebook/submissions/${id}/edit`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const renderPreview = () => {
    if (!previewFile) {
      return (
        <div className="text-center py-5">
          <i className="fas fa-book-open fa-3x text-muted mb-3"></i>
          <p className="text-muted mb-0">Select a readable file to preview.</p>
        </div>
      );
    }

    const fileUrl = getFileUrl(previewFile);

    if (!fileUrl || fileUrl === "#") {
      return (
        <div className="text-center py-5">
          <i className="fas fa-exclamation-circle fa-3x text-warning mb-3"></i>
          <p className="text-muted">File URL is unavailable.</p>
        </div>
      );
    }

    if (isPdfFile(previewFile)) {
      return (
        <iframe
          title={getFileName(previewFile)}
          src={fileUrl}
          style={{ width: "100%", height: "700px", border: "0" }}
        />
      );
    }

    if (isImageFile(previewFile)) {
      return (
        <div className="text-center p-3">
          <img
            src={fileUrl}
            alt={getFileName(previewFile)}
            style={{ maxWidth: "100%", maxHeight: "700px", borderRadius: "8px" }}
          />
        </div>
      );
    }

    if (isTextFile(previewFile)) {
      return (
        <iframe
          title={getFileName(previewFile)}
          src={fileUrl}
          style={{ width: "100%", height: "500px", border: "0" }}
        />
      );
    }

    return (
      <div className="text-center py-5">
        <i className="fas fa-file fa-3x text-muted mb-3"></i>
        <p className="text-muted">This file cannot be previewed inline.</p>
        <a
          className="btn btn-outline-primary"
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open File
        </a>
      </div>
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "70vh" }}>
          <div className="text-center">
            <div
              className="spinner-border text-primary mb-3"
              style={{ width: "3rem", height: "3rem" }}
              role="status"
            >
              <span className="sr-only">Loading...</span>
            </div>
            <h5 className="text-muted">Loading submission details...</h5>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!data?.submission) {
    return (
      <MainLayout>
        <div className="text-center py-5">
          <i className="fas fa-exclamation-circle fa-4x text-warning mb-3"></i>
          <h3 className="mb-2">Submission Not Found</h3>
          <p className="text-muted mb-4">The requested submission could not be found.</p>
          <Link to="/ebook/submissions" className="btn btn-primary px-4 py-2 rounded-pill">
            <i className="fas fa-arrow-left mr-2"></i>
            Go to My Submissions
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="content-header mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h1 className="display-5 mb-2 font-weight-bold" style={{ color: "#2d3748" }}>
              <i className="fas fa-file-alt mr-3 text-primary"></i>
              Submission Details
            </h1>
            <p className="text-muted mb-0">
              View your manuscript submission information and files
            </p>
          </div>
          <div className="d-flex align-items-center">
            {canContinueSubmit ? (
              <button
                className="btn btn-primary btn-lg rounded-pill px-4 shadow-sm mr-2"
                onClick={handleContinueSubmission}
              >
                <i className="fas fa-edit mr-2"></i>
                Continue to Submit
              </button>
            ) : null}

            <Link
              className="btn btn-light btn-lg rounded-pill px-4 shadow-sm"
              to="/ebook/submissions"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Submissions
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show rounded-lg shadow-sm mb-4" role="alert">
          <div className="d-flex align-items-center">
            <i className="fas fa-exclamation-circle mr-3 fa-lg"></i>
            <div className="flex-grow-1">{error}</div>
            <button type="button" className="close" onClick={() => setError("")}>
              <span>&times;</span>
            </button>
          </div>
        </div>
      )}

      {notice && (
        <div className="alert alert-success alert-dismissible fade show rounded-lg shadow-sm mb-4" role="alert">
          <div className="d-flex align-items-center">
            <i className="fas fa-check-circle mr-3 fa-lg"></i>
            <div className="flex-grow-1">{notice}</div>
            <button type="button" className="close" onClick={() => setNotice("")}>
              <span>&times;</span>
            </button>
          </div>
        </div>
      )}

      <div className="mb-4 d-flex align-items-center flex-wrap">
        <StatusBadge value={data.submission.status} size="lg" />
        {data.submission.final_decision && (
          <span className="ml-3">
            <span className="text-muted">Final Decision:</span>
            <span className="ml-2 font-weight-bold text-primary">{data.submission.final_decision}</span>
          </span>
        )}
        {isDraft ? (
          <span className="badge badge-warning ml-3 px-3 py-2">Draft can still be submitted</span>
        ) : null}
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "16px", overflow: "hidden" }}>
            <div className="card-header bg-white border-0 py-3 px-4">
              <h3 className="h5 mb-0 font-weight-bold">
                <i className="fas fa-info-circle text-primary mr-2"></i>
                Submission Information
              </h3>
            </div>
            <div className="card-body p-0">
              <table className="table table-striped table-hover mb-0">
                <tbody>
                  <tr>
                    <th style={{ width: "200px", backgroundColor: "#f8f9fa" }}>Title</th>
                    <td>{data.submission.title || "—"}</td>
                  </tr>
                  <tr>
                    <th style={{ backgroundColor: "#f8f9fa" }}>Subtitle</th>
                    <td>{data.submission.subtitle || "—"}</td>
                  </tr>
                  <tr>
                    <th style={{ backgroundColor: "#f8f9fa" }}>Abstract</th>
                    <td>{data.submission.abstract || "—"}</td>
                  </tr>
                  <tr>
                    <th style={{ backgroundColor: "#f8f9fa" }}>Author</th>
                    <td className="font-weight-bold">{data.submission.author_name || "—"}</td>
                  </tr>
                  <tr>
                    <th style={{ backgroundColor: "#f8f9fa" }}>Editor</th>
                    <td>{data.submission.editor_name || "—"}</td>
                  </tr>
                  <tr>
                    <th style={{ backgroundColor: "#f8f9fa" }}>Language</th>
                    <td>{data.submission.language || "—"}</td>
                  </tr>
                  <tr>
                    <th style={{ backgroundColor: "#f8f9fa" }}>Publication Year</th>
                    <td>{data.submission.publication_year || "—"}</td>
                  </tr>
                  <tr>
                    <th style={{ backgroundColor: "#f8f9fa" }}>Category</th>
                    <td>{data.submission.category || "—"}</td>
                  </tr>
                  <tr>
                    <th style={{ backgroundColor: "#f8f9fa" }}>Keywords</th>
                    <td>
                      {Array.isArray(data.submission.keywords)
                        ? data.submission.keywords.map((keyword, i) => (
                            <span key={i} className="badge badge-light mr-2 mb-2 px-3 py-2">
                              {keyword}
                            </span>
                          ))
                        : data.submission.keywords?.split(",").map((keyword, i) => (
                            <span key={i} className="badge badge-light mr-2 mb-2 px-3 py-2">
                              {keyword.trim()}
                            </span>
                          )) || "—"}
                    </td>
                  </tr>
                  <tr>
                    <th style={{ backgroundColor: "#f8f9fa" }}>Created</th>
                    <td>{formatDate(data.submission.created_at)}</td>
                  </tr>
                  <tr>
                    <th style={{ backgroundColor: "#f8f9fa" }}>Last Updated</th>
                    <td>{formatDate(data.submission.updated_at)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "16px", overflow: "hidden" }}>
            <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
              <h3 className="h5 mb-0 font-weight-bold">
                <i className="fas fa-book-reader text-primary mr-2"></i>
                File Reader
              </h3>
              {previewFile && getFileUrl(previewFile) !== "#" ? (
                <a
                  className="btn btn-sm btn-outline-secondary"
                  href={getFileUrl(previewFile)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fas fa-external-link-alt mr-1"></i>
                  Open in New Tab
                </a>
              ) : null}
            </div>
            <div className="card-body p-0">{renderPreview()}</div>
          </div>

          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "16px", overflow: "hidden" }}>
            <div className="card-header bg-white border-0 py-3 px-4">
              <h3 className="h5 mb-0 font-weight-bold">
                <i className="fas fa-file text-primary mr-2"></i>
                Files ({data.files?.length || 0})
              </h3>
            </div>
            <div className="card-body p-0">
              {!data.files?.length ? (
                <div className="text-center py-4">
                  <i className="fas fa-file-upload fa-3x text-muted mb-3"></i>
                  <p className="text-muted">No files uploaded yet.</p>
                </div>
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
                      {data.files.map((file) => (
                        <FileRow
                          key={file.file_id || file.id}
                          file={file}
                          onRead={setPreviewFile}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {data.reviews?.length > 0 && (
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "16px", overflow: "hidden" }}>
              <div className="card-header bg-white border-0 py-3 px-4">
                <h3 className="h5 mb-0 font-weight-bold">
                  <i className="fas fa-star text-primary mr-2"></i>
                  Reviews
                </h3>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-striped table-hover mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Reviewer</th>
                        <th>Recommendation</th>
                        <th>Comments</th>
                        <th>Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.reviews.map((review) => (
                        <tr key={review.review_id || review.id}>
                          <td className="font-weight-bold">{review.reviewer_name || "Reviewer"}</td>
                          <td>
                            <span className="badge badge-primary">{review.recommendation}</span>
                          </td>
                          <td>{review.comments_for_author || review.comments || "No comments provided."}</td>
                          <td>
                            {review.submitted_at
                              ? new Date(review.submitted_at).toLocaleDateString()
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="col-lg-4">
          {readableFiles.length > 0 && (
            <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: "16px", overflow: "hidden" }}>
              <div className="card-header bg-white border-0 py-3 px-4">
                <h3 className="h6 mb-0 font-weight-bold">
                  <i className="fas fa-list text-primary mr-2"></i>
                  Readable Files
                </h3>
              </div>
              <div className="card-body">
                {readableFiles.map((file) => (
                  <button
                    key={file.file_id || file.id}
                    type="button"
                    className={`btn btn-block text-left mb-2 ${
                      previewFile && (previewFile.file_id || previewFile.id) === (file.file_id || file.id)
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => setPreviewFile(file)}
                  >
                    <i className="fas fa-book-open mr-2"></i>
                    {getFileName(file)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="card border-0 shadow-sm" style={{ borderRadius: "16px", overflow: "hidden" }}>
            <div className="card-header bg-white border-0 py-3 px-4">
              <h3 className="h5 mb-0 font-weight-bold">
                <i className="fas fa-history text-primary mr-2"></i>
                Workflow History
              </h3>
            </div>
            <div className="card-body p-0" style={{ maxHeight: "500px", overflowY: "auto" }}>
              <HistoryTimeline history={data.history} />
            </div>
          </div>

          {(data.submission?.doi || data.submission?.isbn) && (
            <div className="card border-0 shadow-sm mt-3" style={{ borderRadius: "16px", overflow: "hidden" }}>
              <div className="card-body p-3">
                <h6 className="font-weight-bold mb-2">
                  <i className="fas fa-link text-primary mr-2"></i>
                  Identifiers
                </h6>
                {data.submission.doi && (
                  <div className="small mb-1">
                    <span className="text-muted">DOI:</span> {data.submission.doi}
                  </div>
                )}
                {data.submission.isbn && (
                  <div className="small">
                    <span className="text-muted">ISBN:</span> {data.submission.isbn}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

const styleId = "ebook-submission-detail-styles";
if (!document.getElementById(styleId)) {
  const styleSheet = document.createElement("style");
  styleSheet.id = styleId;
  styleSheet.textContent = `
    .bg-soft-primary { background-color: rgba(102, 126, 234, 0.1); }
    .bg-soft-success { background-color: rgba(72, 187, 120, 0.1); }
    .bg-soft-warning { background-color: rgba(237, 137, 54, 0.1); }
    .bg-soft-danger { background-color: rgba(245, 101, 101, 0.1); }
    .bg-soft-info { background-color: rgba(66, 153, 225, 0.1); }
    .bg-soft-dark { background-color: rgba(45, 55, 72, 0.1); }

    .table th {
      font-weight: 600;
      color: #495057;
    }

    .table td {
      vertical-align: middle;
    }
  `;
  document.head.appendChild(styleSheet);
}