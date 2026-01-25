import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import MainLayout from "../../../../components/layout/MainLayout";
import { getManuscripts } from "../../../../api/manuscript.api";

const API_BASE = "http://localhost:5000";
const fileUrl = (path) => (path?.startsWith("http") ? path : `${API_BASE}${path}`);

export default function RevisionRequiredManuscription() {
  const [manuscripts, setManuscripts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  const isPdf = (path) => path && path.toLowerCase().endsWith(".pdf");
  const getFileName = (path) => (path ? path.split("/").pop() : "-");

  /* ---------------- Load Revision Required Manuscripts ---------------- */
  useEffect(() => {
    loadRevisions();
  }, []);

  const loadRevisions = async () => {
    try {
      const res = await getManuscripts();
      const revisions = res.data.filter((m) => {
        const status =
          m.status?.toLowerCase?.() ||
          m.status_label?.toLowerCase?.() ||
          m.status?.code?.toLowerCase?.() ||
          m.status?.label?.toLowerCase?.();
        return status === "revision_required" || status === "revision required";
      });

      setManuscripts(revisions);
      setFiltered(revisions);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load revision manuscripts", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Search Filter ---------------- */
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filteredData = manuscripts.filter((m) =>
      m.title.toLowerCase().includes(value)
    );
    setFiltered(filteredData);
    setCurrentPage(1);
  };

  /* ---------------- Pagination ---------------- */
  const totalPages = Math.ceil(filtered.length / perPage);
  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const pageData = filtered.slice(start, end);

  const goToPage = (num) => setCurrentPage(num);

  /* ---------------- PDF Preview ---------------- */
  const previewFile = (filePath) => {
    const url = fileUrl(filePath);
    if (!url) return;

    Swal.fire({
      title: "PDF Preview",
      html: `<iframe src="${url}" width="100%" height="600px" style="border:none;"></iframe>`,
      width: "80%",
      showCloseButton: true,
      showConfirmButton: false,
    });
  };

  return (
    <MainLayout>
      <section className="content-header mb-3">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <h1>
            <i className="fas fa-sync-alt mr-2"></i>
            Revision Required Manuscripts
          </h1>
          <input
            type="text"
            className="form-control w-auto"
            placeholder="Search by title..."
            value={search}
            onChange={handleSearch}
          />
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          {loading ? (
            <div className="text-center py-5">
              <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
              <p className="mt-2">Loading revisions...</p>
            </div>
          ) : pageData.length === 0 ? (
            <div className="alert alert-info text-center">
              No revision-required manuscripts found
            </div>
          ) : (
            <div className="card card-warning">
              <div className="card-body table-responsive p-0">
                <table className="table table-hover table-bordered mb-0">
                  <thead className="thead-light">
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>File</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageData.map((m, i) => (
                      <tr key={m.id}>
                        <td>{start + i + 1}</td>
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
                          <span className="badge badge-danger">
                            {m.status_label || m.status?.label || "Revision Required"}
                          </span>
                        </td>
                        <td>
                          <Link
                            to={`/journal/manuscripts/show/${m.id}`}
                            className="btn btn-sm btn-info mr-1"
                            title="View"
                          >
                            <i className="fas fa-eye"></i>
                          </Link>
                          <Link
                            to={`/journal/manuscripts/edit/${m.id}`}
                            className="btn btn-sm btn-warning mr-1"
                            title="Revise & Resubmit"
                          >
                            <i className="fas fa-edit"></i>
                          </Link>
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
                          {isPdf(m.manuscript_files) && (
                            <button
                              type="button"
                              onClick={() => previewFile(m.manuscript_files)}
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

              {/* Pagination */}
              <div className="card-footer d-flex justify-content-center">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => goToPage(i + 1)}
                    className={`btn btn-sm mx-1 ${
                      currentPage === i + 1 ? "btn-primary" : "btn-outline-primary"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
