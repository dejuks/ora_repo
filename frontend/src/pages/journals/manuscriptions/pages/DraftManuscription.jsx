import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

export default function DraftManuscription() {
  const [manuscripts, setManuscripts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- Helpers ---------------- */
  const isPdf = (path) =>
    path && path.toLowerCase().endsWith(".pdf");

  const getFileName = (path) =>
    path ? path.split("/").pop() : "-";

  /* ---------------- Load Draft Manuscripts ---------------- */
  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    try {
      const res = await getManuscripts();

      // ✅ ONLY DRAFT manuscripts
      const drafts = res.data.filter(
        (m) =>
          m.status_label?.toLowerCase() === "draft" ||
          m.status?.toLowerCase() === "draft"
      );

      setManuscripts(drafts);
    } catch (err) {
      Swal.fire("Error", "Failed to load draft manuscripts", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- PDF Preview Popup ---------------- */
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

  /* ---------------- UI ---------------- */
  return (
    <MainLayout>
      <section className="content-header">
        <div className="container-fluid">
          <h1>
            <i className="fas fa-file-alt mr-2"></i>
            Draft Manuscripts
          </h1>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">

          {loading ? (
            <div className="text-center py-5">
              <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
              <p className="mt-2">Loading drafts...</p>
            </div>
          ) : manuscripts.length === 0 ? (
            <div className="alert alert-info text-center">
              No draft manuscripts found
            </div>
          ) : (
            <div className="card card-primary">
              <div className="card-body table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="thead-light">
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>File</th>
                      <th>Status</th>
                      <th style={{ width: "220px" }}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {manuscripts.map((m, i) => (
                      <tr key={m.id}>
                        <td>{i + 1}</td>

                        <td>{m.title}</td>

                        <td>
                          {m.manuscript_files ? (
                            <>
                              <i className="fas fa-file-pdf text-danger mr-1"></i>
                              {getFileName(m.manuscript_files)}
                            </>
                          ) : (
                            "-"
                          )}
                        </td>

                        <td>
                          <span className="badge badge-warning">
                            Draft
                          </span>
                        </td>

                        <td>
                          {/* VIEW */}
                          <Link
                            to={`/journal/manuscripts/show/${m.id}`}
                            className="btn btn-sm btn-info mr-1"
                            title="View"
                          >
                            <i className="fas fa-eye"></i>
                          </Link>

                          {/* EDIT */}
                          <Link
                            to={`/journal/manuscripts/edit/${m.id}`}
                            className="btn btn-sm btn-warning mr-1"
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </Link>

                          {/* DOWNLOAD */}
                          {m.manuscript_files && (
                            <a
                              href={fileUrl(m.manuscript_files)}
                              download
                              className="btn btn-sm btn-success mr-1"
                              title="Download"
                            >
                              <i className="fas fa-download"></i>
                            </a>
                          )}

                          {/* PREVIEW */}
                          {isPdf(m.manuscript_files) && (
                            <button
                              type="button"
                              onClick={() =>
                                previewFile(m.manuscript_files)
                              }
                              className="btn btn-sm btn-secondary"
                              title="Preview PDF"
                            >
                              <i className="fas fa-file-pdf"></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            </div>
          )}

        </div>
      </section>
    </MainLayout>
  );
}
