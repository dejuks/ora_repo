import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import MainLayout from "../../../../components/layout/MainLayout";
import { getManuscripts, deleteManuscript } from "../../../../api/odl_manuscript.api";

export default function ManuscriptList() {
  const [manuscripts, setManuscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  const loadManuscripts = async () => {
    try {
      setLoading(true);
      const res = await getManuscripts();
      setManuscripts(res.data || []);
    } catch (err) {
      Swal.fire("Error", "Failed to load manuscripts", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManuscripts();
  }, []);

  const filtered = manuscripts.filter(
    (m) =>
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.journal_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentData = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / perPage);

  const remove = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete manuscript?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
    });
    if (!confirm.isConfirmed) return;

    await deleteManuscript(id);
    Swal.fire("Deleted", "", "success");
    loadManuscripts();
  };

  return (
    <MainLayout>
      <section className="content-header">
        <div className="container-fluid">
          <h1 className="fw-bold">Manuscript Management</h1>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">

          {/* ==================== PANEL CARD ==================== */}
          <div className="card card-outline card-warning shadow-lg">
            
            {/* Card Header */}
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="card-title fw-bold">Manuscripts List</h3>

              <div className="d-flex gap-2 align-items-center">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search manuscripts..."
                  style={{ width: 250 }}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <Link
                  to="/journal/manuscripts/create"
                  className="btn btn-sm btn-primary  shadow-sm"
                >
                  <i className="fas fa-plus me-1"></i> Create New
                </Link>
              </div>
            </div>

            {/* Card Body */}
            <div className="card-body p-0 table-responsive">
              {loading ? (
                <p className="text-center py-5 text-muted">Loading manuscripts...</p>
              ) : (
                <table className="table table-hover table-striped table-bordered text-nowrap mb-0">
                  <thead className="bg-secondary text-white">
                    <tr>
                      <th style={{ width: "40px" }}>#</th>
                      <th>Title</th>
                      <th>Journal</th>
                      <th>Section</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th style={{ width: "140px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center text-muted py-3">
                          No manuscripts found
                        </td>
                      </tr>
                    )}

                    {currentData.map((m, i) => (
                      <tr key={m.id}>
                        <td>{indexOfFirst + i + 1}</td>
                        <td>{m.title}</td>
                        <td>{m.journal_title}</td>
                        <td>{m.section_name || "-"}</td>
                        <td>
                          <span
                            className={`badge ${
                              m.status_label === "Draft"
                                ? "bg-secondary"
                                : m.status_label === "Submitted"
                                ? "bg-primary"
                                : m.status_label === "Accepted"
                                ? "bg-success"
                                : m.status_label === "Revision Required"
                                ? "bg-warning text-dark"
                                : "bg-info"
                            }`}
                            style={{
                              textTransform: "capitalize",
                              minWidth: 100,
                              display: "inline-block",
                              textAlign: "center",
                            }}
                          >
                            {m.status_label}
                          </span>
                        </td>
                        <td>{new Date(m.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="btn-group">
                            {(m.status_label === "Draft" ||
                              m.status_label === "Revision Required") && (
                              <Link
                                to={`/journal/manuscripts/edit/${m.id}`}
                                className="btn btn-warning btn-sm"
                                title="Edit"
                              >
                                <i className="fas fa-edit"></i>
                              </Link>
                            )}
                            <Link
                              to={`/journal/manuscripts/show/${m.id}`}
                              className="btn btn-info btn-sm"
                              title="View"
                            >
                              <i className="fas fa-eye"></i>
                            </Link>
                            {m.status_label === "Draft" && (
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => remove(m.id)}
                                title="Delete"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Card Footer / Pagination */}
            {totalPages > 1 && (
              <div className="card-footer d-flex justify-content-end">
                <ul className="pagination pagination-sm mb-0">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <li
                      key={i}
                      className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
