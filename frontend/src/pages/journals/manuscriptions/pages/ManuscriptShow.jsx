import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";
import MainLayout from "../../../../components/layout/MainLayout";
import { getManuscripts } from "../../../../api/manuscript.api";

/* 🔑 BACKEND BASE URL */
const API_BASE = "http://localhost:5000";

/* 🔑 FILE URL HELPER */
const fileUrl = (path) => {
  if (!path) return "";
  return path.startsWith("http") ? path : `${API_BASE}${path}`;
};

export default function ManuscriptShow() {
  const { id } = useParams();

  const [manuscript, setManuscript] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- Helpers ---------------- */
  const getFileName = (path) => {
    if (!path || typeof path !== "string") return "";
    return path.split("/").pop();
  };

  const isPdf = (path) => {
    if (!path) return false;
    return path.toLowerCase().endsWith(".pdf");
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  /* ---------------- Load Data ---------------- */
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await getManuscripts();
        const found = res.data.find((m) => String(m.id) === String(id));
        setManuscript(found || null);
      } catch (err) {
        Swal.fire("Error", "Failed to load manuscript", "error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  /* ---------------- Preview PDF ---------------- */
  const previewFile = (filePath) => {
    const url = fileUrl(filePath);
    if (!url) return;

    Swal.fire({
      title: "PDF Preview",
      html: `
        <iframe 
          src="${url}" 
          width="100%" 
          height="600px" 
          style="border:none;"
        ></iframe>
      `,
      width: "80%",
      showCloseButton: true,
      showConfirmButton: false,
    });
  };

  /* ---------------- Loading ---------------- */
  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-5">
          <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
          <p className="mt-2">Loading manuscript...</p>
        </div>
      </MainLayout>
    );
  }

  /* ---------------- Not Found ---------------- */
  if (!manuscript) {
    return (
      <MainLayout>
        <div className="text-center py-5">
          <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
          <h4>Manuscript not found</h4>
          <Link to="/journal/manuscripts" className="btn btn-secondary mt-3">
            Back to list
          </Link>
        </div>
      </MainLayout>
    );
  }

  /* ---------------- View ---------------- */
  return (
    <MainLayout>
      <section className="content-header">
        <div className="container-fluid">
          <h1>Manuscript Details</h1>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          <div className="row">

            {/* LEFT COLUMN */}
            <div className="col-md-8">

              {/* Manuscript Info */}
              <div className="card card-primary">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-file-alt mr-2"></i>
                    {manuscript.title}
                  </h3>
                </div>

                <div className="card-body">
                  <p><strong>Abstract</strong></p>
                  <p className="text-muted">
                    {manuscript.abstract || "No abstract provided"}
                  </p>

                  <hr />

                  <p><strong>Keywords</strong></p>
                  <p>{manuscript.keywords || "-"}</p>
                </div>

                <div className="card-footer text-right">
                  <Link to="/journal/manuscripts" className="btn btn-secondary mr-2">
                    <i className="fas fa-arrow-left"></i> Back
                  </Link>
                  <Link
                    to={`/journal/manuscripts/edit/${manuscript.id}`}
                    className="btn btn-warning"
                  >
                    <i className="fas fa-edit"></i> Edit
                  </Link>
                </div>
              </div>

              {/* Uploaded File */}
              <div className="card card-success">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-paperclip mr-2"></i>
                    Uploaded File
                  </h3>
                </div>

                <div className="card-body">
                  {manuscript.manuscript_files ? (
                    <>
                      <p>
                        <i className="fas fa-file-pdf text-danger mr-2"></i>
                        <strong>{getFileName(manuscript.manuscript_files)}</strong>
                      </p>

                      <div className="btn-group">
                        <a
                          href={fileUrl(manuscript.manuscript_files)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-primary"
                        >
                          <i className="fas fa-download mr-1"></i>
                          Download
                        </a>

                        {isPdf(manuscript.manuscript_files) && (
                          <button
                            type="button"
                            onClick={() =>
                              previewFile(manuscript.manuscript_files)
                            }
                            className="btn btn-sm btn-outline-secondary"
                          >
                            <i className="fas fa-eye mr-1"></i>
                            Preview
                          </button>
                        )}
                      </div>

                      <hr />

                      <small className="text-muted">
                        Uploaded on {formatDate(manuscript.created_at)}
                      </small>
                    </>
                  ) : (
                    <div className="text-center text-muted">
                      <i className="fas fa-folder-open fa-2x mb-2"></i>
                      <p>No file uploaded</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="col-md-4">
              <div className="card card-info">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-info-circle mr-2"></i> Info
                  </h3>
                </div>

                <div className="card-body">
                  <p><strong>Journal:</strong> {manuscript.journal_title}</p>
                  <p><strong>Section:</strong> {manuscript.section_name || "-"}</p>
                  <p><strong>Language:</strong> {manuscript.language}</p>
                  <p><strong>Article Type:</strong> {manuscript.article_type}</p>

                  <hr />

                  <p>
                    <strong>Status:</strong>{" "}
                    <span className="badge badge-info">
                      {manuscript.status_label}
                    </span>
                  </p>

                  <p>
                    <strong>Current Version:</strong>{" "}
                    v{manuscript.current_version ?? 1}
                  </p>

                  <p>
                    <strong>Submitted:</strong>{" "}
                    {formatDate(manuscript.created_at)}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </MainLayout>
  );
}
