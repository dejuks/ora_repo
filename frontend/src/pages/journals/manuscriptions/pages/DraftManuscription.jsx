import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import MainLayout from "../../../../components/layout/MainLayout";
import { getManuscripts } from "../../../../api/odl_manuscript.api";

const API_BASE = "http://localhost:5000";

const fileUrl = (path) => (path?.startsWith("http") ? path : `${API_BASE}${path}`);
const isPdf = (path) => path?.toLowerCase().endsWith(".pdf");
const getFileName = (path) => path?.split("/").pop() || "-";

export default function DraftManuscription() {
  const [manuscripts, setManuscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(""); // 🔑 Search state

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    try {
      const res = await getManuscripts();
      const drafts = res.data.filter(
        (m) => m.status_label?.toLowerCase() === "draft"
      );
      setManuscripts(drafts);
    } catch (err) {
      Swal.fire("Error", "Failed to load draft manuscripts", "error");
    } finally {
      setLoading(false);
    }
  };

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

  // 🔑 Filter manuscripts based on search
  const filteredManuscripts = manuscripts.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <section className="content-header">
        <div className="container-fluid d-flex justify-content-between align-items-center mb-2">
          <h1>
            <i className="fas fa-file-alt mr-2 text-primary"></i> Draft Manuscripts
          </h1>
          <Link to="/journal/manuscripts/create" className="btn btn-success btn-sm">
            <i className="fas fa-plus mr-1"></i> New Manuscript
          </Link>
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
            <div className="card card-outline card-primary">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h3 className="card-title">
                  <i className="fas fa-copy mr-1"></i> Draft Manuscripts
                </h3>

                {/* 🔑 Search Input */}
                <div className="input-group input-group-sm" style={{ width: "250px" }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <div className="input-group-append">
                    <span className="input-group-text">
                      <i className="fas fa-search"></i>
                    </span>
                  </div>
                </div>
              </div>

              <div className="card-body table-responsive p-0">
                <table className="table table-hover table-striped table-bordered text-nowrap mb-0">
                  <thead className="thead-light">
                    <tr>
                      <th style={{ width: "50px" }}>#</th>
                      <th>Title</th>
                      <th style={{ width: "200px" }}>File</th>
                      <th style={{ width: "120px" }}>Status</th>
                      <th style={{ width: "250px" }}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredManuscripts.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center text-muted">
                          No manuscripts match your search
                        </td>
                      </tr>
                    ) : (
                      filteredManuscripts.map((m, i) => (
                        <tr key={m.id}>
                          <td>{i + 1}</td>
                          <td>{m.title}</td>
                          <td className="d-flex align-items-center">
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
                            <span className="badge badge-warning text-uppercase">Draft</span>
                          </td>
                          <td className="d-flex">
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
                              title="Edit"
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="card-footer">
                <small className="text-muted">
                  Showing {filteredManuscripts.length} draft manuscripts
                </small>
              </div>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
