import React, { useEffect, useState } from "react";
import MainLayout from "../../../../components/layout/MainLayout";
import Swal from "sweetalert2";
import {
  getManuscripts,
  deleteManuscript,
} from "../../../../api/manuscript.api.js";
import { Link } from "react-router-dom";

export default function ManuscriptList() {
  const [manuscripts, setManuscripts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  // Load manuscripts
  const loadManuscripts = async () => {
    setLoading(true);
    try {
      const res = await getManuscripts();
      setManuscripts(res.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load manuscripts", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManuscripts();
  }, []);

  // Filter
  const filtered = manuscripts.filter(
    (m) =>
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.journal_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentData = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / perPage);

  // Delete
  const remove = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This manuscript will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await deleteManuscript(id);
        Swal.fire("Deleted!", "Manuscript removed.", "success");
        loadManuscripts();
      } catch (err) {
        Swal.fire("Error", "Delete failed", "error");
      }
    }
  };

  return (
    <MainLayout>
      {/* Header */}
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2 align-items-center">
            <div className="col-sm-6">
              <h1>Manuscript Management</h1>
            </div>
            <div className="col-sm-6 text-right">
              <Link to={`/journal/manuscraipts/create`} className="btn btn-primary">
                <i className="fas fa-plus mr-1"></i> Add Manuscript
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="content">
        <div className="container-fluid">
          <div className="card card-primary">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="card-title">
                <i className="fas fa-file-alt mr-2"></i> Manuscripts
              </h3>

              <div className="input-group input-group-sm" style={{ width: "250px" }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search title / journal..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <div className="input-group-append">
                  <span className="input-group-text">
                    <i className="fas fa-search"></i>
                  </span>
                </div>
              </div>
            </div>

            <div className="card-body table-responsive p-0">
              {loading ? (
                <div className="text-center py-5">
                  <i className="fas fa-spinner fa-spin fa-2x text-primary mb-2"></i>
                  <p>Loading manuscripts...</p>
                </div>
              ) : currentData.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-file-alt fa-3x text-muted mb-3"></i>
                  <h4>No Manuscripts Found</h4>
                </div>
              ) : (
                <table className="table table-hover table-bordered table-striped text-nowrap">
                  <thead className="thead-light">
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>Journal</th>
                      <th>Section</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((m, i) => (
                      <tr key={m.id}>
                        <td>{indexOfFirst + i + 1}</td>
                        <td>{m.title}</td>
                        <td>{m.journal_title}</td>
                        <td>{m.section_name || "-"}</td>
                        
                        <td>
                          {new Date(m.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="btn-group">
                            <a
                              href={`/journal/manuscripts/edit/${m.id}`}
                              className="btn btn-warning btn-sm"
                            >
                              <i className="fas fa-edit"></i>
                            </a>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => remove(m.id)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                            <Link to={`/journal/manuscripts/show/${m.id}`} className="btn btn-sm btn-info"><i className="fa fa-eye"></i></Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="card-footer clearfix">
                <ul className="pagination pagination-sm m-0 float-right">
                  {Array.from({ length: totalPages }, (_, idx) => (
                    <li
                      key={idx}
                      className={`page-item ${
                        currentPage === idx + 1 ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(idx + 1)}
                      >
                        {idx + 1}
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
