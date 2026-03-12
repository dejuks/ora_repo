import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import MainLayout from "../components/layout/MainLayout";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../api/user.api.js";
import UserForm from "../components/UserForm.jsx";
import { getRoles } from "../api/role.api.js";
import { fetchUserRoles, assignRolesToUser } from "../api/userRole.api.js";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [roleModalUser, setRoleModalUser] = useState(null);
  const [allRoles, setAllRoles] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [savingRoles, setSavingRoles] = useState(false);

  const normalizeResponseArray = (res) => {
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    return [];
  };

  const loadUsers = async () => {
    try {
      const res = await getUsers();
      const data = normalizeResponseArray(res);
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch users", "error");
    }
  };

  const loadRoles = async () => {
    try {
      const res = await getRoles();
      setAllRoles(normalizeResponseArray(res));
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch roles", "error");
    }
  };

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  // Search functionality
  useEffect(() => {
    const filtered = users.filter((user) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.full_name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.phone?.toLowerCase().includes(searchLower) ||
        user.gender?.toLowerCase().includes(searchLower)
      );
    });
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, users]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Group roles by module
  const groupedRoles = useMemo(() => {
    const grouped = allRoles.reduce((acc, role) => {
      const key = role.module_id || "no-module";
      if (!acc[key]) {
        acc[key] = {
          module_name: role.module_name || "No Module",
          roles: [],
        };
      }
      acc[key].roles.push(role);
      return acc;
    }, {});

    Object.keys(grouped).forEach((key) => {
      grouped[key].roles.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    });

    return grouped;
  }, [allRoles]);

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // UserForm modal
  const openCreate = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const saveUser = async (data) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.uuid, data);
        Swal.fire("Success", "User updated successfully", "success");
      } else {
        await createUser(data);
        Swal.fire("Success", "User created successfully", "success");
      }
      closeModal();
      loadUsers();
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error",
        err.response?.data?.message || err.response?.data?.error || "Operation failed",
        "error"
      );
    }
  };

  const removeUser = async (uuid) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This user will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });

    if (result.isConfirmed) {
      try {
        await deleteUser(uuid);
        Swal.fire("Deleted!", "User has been deleted.", "success");
        loadUsers();
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to delete user", "error");
      }
    }
  };

  const closeModal = () => setShowModal(false);

  // Role modal
  const openRoleModal = async (user) => {
    setRoleModalUser(user);
    try {
      const res = await fetchUserRoles(user.uuid);
      const roles = normalizeResponseArray(res);
      setUserRoles(roles.map((r) => r.uuid));
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load user roles", "error");
    }
  };

  const toggleRole = (roleId) => {
    setUserRoles((prev) =>
      prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]
    );
  };

  const handleSelectAllRoles = () => {
    setUserRoles(allRoles.map((r) => r.uuid));
  };

  const handleClearAllRoles = () => {
    setUserRoles([]);
  };

  const handleSelectAllModuleRoles = (moduleRoles) => {
    const ids = moduleRoles.map((r) => r.uuid);
    setUserRoles((prev) => [...new Set([...prev, ...ids])]);
  };

  const handleClearModuleRoles = (moduleRoles) => {
    const ids = moduleRoles.map((r) => r.uuid);
    setUserRoles((prev) => prev.filter((id) => !ids.includes(id)));
  };

  const isModuleFullySelected = (moduleRoles) => {
    const ids = moduleRoles.map((r) => r.uuid);
    return ids.length > 0 && ids.every((id) => userRoles.includes(id));
  };

  const saveRoles = async () => {
    if (!roleModalUser) return;
    setSavingRoles(true);
    try {
      await assignRolesToUser(roleModalUser.uuid, userRoles);
      Swal.fire("Success", "Roles updated successfully", "success");
      setRoleModalUser(null);
      await loadUsers();
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to update roles",
        "error"
      );
    } finally {
      setSavingRoles(false);
    }
  };

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid">
          {/* HEADER */}
          <div className="row mb-2 align-items-center">
            <div className="col-sm-6">
              <h1>User Management</h1>
            </div>

            <div className="col-sm-6 text-right">
              <button className="btn btn-primary" onClick={openCreate}>
                <i className="fas fa-plus mr-1"></i>
                Add User
              </button>
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="row mb-3">
            <div className="col-md-6">
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text">
                    <i className="fas fa-search"></i>
                  </span>
                </div>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, email, phone, or gender..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <div className="input-group-append">
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setSearchTerm("")}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="col-md-6 text-right">
              <span className="text-muted">
                Showing {filteredUsers.length ? indexOfFirstItem + 1 : 0} to{" "}
                {Math.min(indexOfLastItem, filteredUsers.length)} of{" "}
                {filteredUsers.length} entries
              </span>
            </div>
          </div>

          {/* USERS TABLE */}
          <div className="card card-outline card-primary">
            <div className="card-body table-responsive p-0">
              <table className="table table-hover text-nowrap">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Gender</th>
                    <th>DOB</th>
                    <th width="150">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((u, i) => (
                    <tr key={u.uuid}>
                      <td>{indexOfFirstItem + i + 1}</td>
                      <td>{u.full_name}</td>
                      <td>{u.email}</td>
                      <td>{u.phone}</td>
                      <td>{u.gender}</td>
                      <td>{u.dob?.slice(0, 10)}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning mr-1"
                          onClick={() => openEdit(u)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-info mr-1"
                          onClick={() => openRoleModal(u)}
                        >
                          <i className="fas fa-user-tag"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => removeUser(u.uuid)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center text-muted">
                        {searchTerm
                          ? "No users found matching your search"
                          : "No users found"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* PAGINATION */}
          {filteredUsers.length > 0 && (
            <div className="row">
              <div className="col-sm-12">
                <nav aria-label="Page navigation">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                      >
                        <i className="fas fa-chevron-left"></i> Previous
                      </button>
                    </li>

                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 2 &&
                          pageNumber <= currentPage + 2)
                      ) {
                        return (
                          <li
                            key={pageNumber}
                            className={`page-item ${
                              currentPage === pageNumber ? "active" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => goToPage(pageNumber)}
                            >
                              {pageNumber}
                            </button>
                          </li>
                        );
                      } else if (
                        pageNumber === currentPage - 3 ||
                        pageNumber === currentPage + 3
                      ) {
                        return (
                          <li key={pageNumber} className="page-item disabled">
                            <span className="page-link">...</span>
                          </li>
                        );
                      }
                      return null;
                    })}

                    <li
                      className={`page-item ${
                        currentPage === totalPages ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                      >
                        Next <i className="fas fa-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          )}

          {/* USER FORM MODAL */}
          {showModal && (
            <>
              <div
                className="modal fade show"
                style={{ display: "block", pointerEvents: "auto" }}
              >
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">
                        {editingUser ? "Edit User" : "Create User"}
                      </h5>
                      <button className="close" onClick={closeModal}>
                        <span>&times;</span>
                      </button>
                    </div>

                    <UserForm
                      onSubmit={saveUser}
                      onCancel={closeModal}
                      initialData={editingUser || {}}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-backdrop fade show"></div>
            </>
          )}

          {/* ROLE ASSIGNMENT MODAL */}
          {roleModalUser && (
            <>
              <div className="modal fade show" style={{ display: "block" }}>
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <div>
                        <h5 className="modal-title mb-0">
                          {roleModalUser.full_name} Roles
                        </h5>
                        <small className="text-muted">
                          Selected: {userRoles.length} / {allRoles.length}
                        </small>
                      </div>

                      <button
                        type="button"
                        className="close"
                        onClick={() => setRoleModalUser(null)}
                      >
                        <span>&times;</span>
                      </button>
                    </div>

                    <div className="modal-body">
                      <div className="d-flex justify-content-end mb-3">
                        <button
                          className="btn btn-sm btn-success mr-2"
                          onClick={handleSelectAllRoles}
                          disabled={savingRoles || !allRoles.length}
                        >
                          <i className="fas fa-check-square mr-1"></i>
                          Select All
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={handleClearAllRoles}
                          disabled={savingRoles || !userRoles.length}
                        >
                          <i className="fas fa-minus-square mr-1"></i>
                          Clear All
                        </button>
                      </div>

                      <div style={{ maxHeight: 420, overflowY: "auto" }}>
                        {Object.keys(groupedRoles).length === 0 ? (
                          <div className="text-center text-muted py-3">
                            No roles found
                          </div>
                        ) : (
                          Object.entries(groupedRoles).map(([moduleKey, group]) => (
                            <div className="card card-outline card-primary mb-3" key={moduleKey}>
                              <div className="card-header d-flex justify-content-between align-items-center flex-wrap">
                                <div>
                                  <strong>{group.module_name}</strong>
                                  <div>
                                    <small className="text-muted">
                                      {
                                        group.roles.filter((r) =>
                                          userRoles.includes(r.uuid)
                                        ).length
                                      }{" "}
                                      / {group.roles.length} selected
                                    </small>
                                  </div>
                                </div>

                                <div className="mt-2 mt-md-0">
                                  <button
                                    className="btn btn-xs btn-success mr-2"
                                    onClick={() => handleSelectAllModuleRoles(group.roles)}
                                    disabled={savingRoles || !group.roles.length}
                                  >
                                    Select All
                                  </button>

                                  <button
                                    className="btn btn-xs btn-outline-danger"
                                    onClick={() => handleClearModuleRoles(group.roles)}
                                    disabled={savingRoles || !group.roles.length}
                                  >
                                    Clear
                                  </button>
                                </div>
                              </div>

                              <div className="card-body">
                                {isModuleFullySelected(group.roles) && (
                                  <div className="mb-2">
                                    <span className="badge badge-success">
                                      All roles selected in this module
                                    </span>
                                  </div>
                                )}

                                <div className="row">
                                  {group.roles.map((r) => (
                                    <div className="col-md-6 mb-2" key={r.uuid}>
                                      <div className="form-check border rounded px-3 py-2 h-100">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          id={`role-${r.uuid}`}
                                          checked={userRoles.includes(r.uuid)}
                                          onChange={() => toggleRole(r.uuid)}
                                          disabled={savingRoles}
                                        />
                                        <label
                                          className="form-check-label"
                                          htmlFor={`role-${r.uuid}`}
                                          style={{ marginLeft: "8px" }}
                                        >
                                          <strong>{r.name}</strong>
                                          <br />
                                          <small className="text-muted">
                                            {r.module_name || "No Module"}
                                          </small>
                                        </label>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="modal-footer">
                      <button
                        className="btn btn-secondary"
                        onClick={() => setRoleModalUser(null)}
                        disabled={savingRoles}
                      >
                        Close
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={saveRoles}
                        disabled={savingRoles}
                      >
                        {savingRoles ? "Saving..." : "Save Roles"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-backdrop fade show"></div>
            </>
          )}
        </div>
      </section>
    </MainLayout>
  );
}