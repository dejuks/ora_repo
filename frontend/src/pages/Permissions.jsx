import React, { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import {
  getPermissions,
  createPermission,
  deletePermission,
} from "../api/permission.api";
import Swal from "sweetalert2";

export default function Permissions() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Pagination
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 10;

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [permName, setPermName] = useState("");

  /* ================= FETCH ================= */
  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const res = await getPermissions();
      setPermissions(res.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load permissions", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  /* ================= SEARCH ================= */
  const filteredPermissions = permissions.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredPermissions.length / PER_PAGE);
  const startIndex = (currentPage - 1) * PER_PAGE;
  const paginatedPermissions = filteredPermissions.slice(
    startIndex,
    startIndex + PER_PAGE
  );

  /* ================= HIGHLIGHT ================= */
  const highlightText = (text, keyword) => {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword})`, "gi");
    return text.replace(regex, `<mark>$1</mark>`);
  };

  /* ================= CRUD ================= */
  const openCreate = () => {
    setPermName("");
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const savePermission = async () => {
    if (!permName.trim()) return;
    try {
      await createPermission(permName);
      Swal.fire("Success", "Permission created", "success");
      closeModal();
      fetchPermissions();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to create permission", "error");
    }
  };

  const removePermission = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This permission will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });

    if (result.isConfirmed) {
      try {
        await deletePermission(id);
        Swal.fire("Deleted!", "Permission removed", "success");
        fetchPermissions();
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to delete permission", "error");
      }
    }
  };

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid">

          {/* HEADER */}
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Permissions Management</h1>
            </div>
            <div className="col-sm-6 text-right">
              <button className="btn btn-primary" onClick={openCreate}>
                <i className="fas fa-plus mr-1"></i> Add Permission
              </button>
            </div>
          </div>

          {/* SEARCH */}
          <div className="row mb-2">
            <div className="col-sm-12">
              <div
                className="input-group input-group-sm float-right"
                style={{ maxWidth: 250 }}
              >
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search permission..."
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
          </div>

          {/* TABLE */}
          <div className="card card-outline card-primary">
            <div className="card-body table-responsive p-0">
              <table className="table table-hover text-nowrap">
                <thead>
                  <tr>
                    <th width="60">#</th>
                    <th>Permission Name</th>
                    <th width="120">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="3" className="text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : paginatedPermissions.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center text-muted">
                        No permissions found
                      </td>
                    </tr>
                  ) : (
                    paginatedPermissions.map((p, i) => (
                      <tr key={p.uuid}>
                        <td>{startIndex + i + 1}</td>
                        <td
                          dangerouslySetInnerHTML={{
                            __html: highlightText(p.name, search),
                          }}
                        />
                        <td>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => removePermission(p.uuid)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="card-footer clearfix">
                <ul className="pagination pagination-sm m-0 float-right">

                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      &laquo;
                    </button>
                  </li>

                  {[...Array(totalPages)].map((_, i) => (
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

                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      &raquo;
                    </button>
                  </li>

                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CREATE MODAL */}
      {showModal && (
        <>
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog">
              <div className="modal-content">

                <div className="modal-header">
                  <h5 className="modal-title">Create Permission</h5>
                  <button className="close" onClick={closeModal}>
                    <span>&times;</span>
                  </button>
                </div>

                <div className="modal-body">
                  <div className="form-group">
                    <label>Permission Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={permName}
                      onChange={(e) => setPermName(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={savePermission}>
                    Save
                  </button>
                </div>

              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </MainLayout>
  );
}
