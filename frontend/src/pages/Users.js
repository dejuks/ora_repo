import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { logout } from "../utils/auth";
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
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const [roleModalUser, setRoleModalUser] = useState(null);
  const [allRoles, setAllRoles] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [savingRoles, setSavingRoles] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      setUsers(res.data || []);
    } catch (err) {
      console.error("Error loading users:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Failed to load users',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const res = await getRoles();
      setAllRoles(res.data || []);
    } catch (err) {
      console.error("Error loading roles:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Failed to fetch roles',
      });
    }
  };

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

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
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'User updated successfully',
        });
      } else {
        await createUser(data);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'User created successfully',
        });
      }
      closeModal();
      loadUsers();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.error || err.response?.data?.message || 'Operation failed',
      });
    }
  };

  const removeUser = async (uuid) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This user will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteUser(uuid);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'User has been deleted.',
        });
        loadUsers();
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.response?.data?.message || 'Failed to delete user',
        });
      }
    }
  };

  const closeModal = () => setShowModal(false);

  // Role modal
  const openRoleModal = async (user) => {
    setRoleModalUser(user);
    setUserRoles([]); // Reset roles first
    
    try {
      const res = await fetchUserRoles(user.uuid);
      
      // Handle different response structures
      let roles = [];
      if (res.data?.data) {
        roles = res.data.data;
      } else if (Array.isArray(res.data)) {
        roles = res.data;
      } else if (res.data?.roles) {
        roles = res.data.roles;
      }

      setUserRoles(roles.map((r) => r.uuid || r.role_id || r.id));
    } catch (err) {
      console.error("Error loading user roles:", err);
      
      // Check if it's a 404 (endpoint not found)
      if (err.response?.status === 404) {
        Swal.fire({
          icon: 'warning',
          title: 'API Endpoint Not Found',
          text: 'The user roles API endpoint is not configured. Please check your backend routes.',
          footer: 'Make sure the route "/api/user-roles/:userId" exists in your backend',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.response?.data?.message || 'Failed to load user roles',
        });
      }
    }
  };

  const toggleRole = (roleId) => {
    setUserRoles((prev) =>
      prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]
    );
  };

  const saveRoles = async () => {
    if (!roleModalUser) return;
    setSavingRoles(true);
    try {
      await assignRolesToUser(roleModalUser.uuid, userRoles);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Roles updated successfully',
      });
      setRoleModalUser(null);
    } catch (err) {
      console.error(err);
      
      if (err.response?.status === 404) {
        Swal.fire({
          icon: 'warning',
          title: 'API Endpoint Not Found',
          text: 'The assign roles API endpoint is not configured.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.response?.data?.message || 'Failed to update roles',
        });
      }
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
                    <th width="180">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center">
                        <div className="spinner-border text-primary" role="status">
                          <span className="sr-only">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <>
                      {Array.isArray(users) && users.map((u, i) => (
                        <tr key={u.uuid}>
                          <td>{i + 1}</td>
                          <td>{u.full_name}</td>
                          <td>{u.email}</td>
                          <td>{u.phone}</td>
                          <td>{u.gender}</td>
                          <td>{u.dob?.slice(0, 10)}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-warning mr-1"
                              onClick={() => openEdit(u)}
                              title="Edit User"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-info mr-1"
                              onClick={() => openRoleModal(u)}
                              title="Assign Roles"
                            >
                              <i className="fas fa-user-tag"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => removeUser(u.uuid)}
                              title="Delete User"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}

                      {(!users || users.length === 0) && !loading && (
                        <tr>
                          <td colSpan="7" className="text-center text-muted">
                            No users found
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* USER FORM MODAL */}
          {showModal && (
            <>
              <div
                className="modal fade show"
                style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
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
            </>
          )}

          {/* ROLE ASSIGNMENT MODAL */}
          {roleModalUser && (
            <>
              <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">
                        Manage Roles - {roleModalUser.full_name}
                      </h5>
                      <button
                        type="button"
                        className="close"
                        onClick={() => setRoleModalUser(null)}
                      >
                        <span>&times;</span>
                      </button>
                    </div>

                    <div className="modal-body">
                      {allRoles.length === 0 ? (
                        <p className="text-muted text-center">No roles available</p>
                      ) : (
                        <ul className="list-unstyled mb-0" style={{ maxHeight: 300, overflowY: "auto" }}>
                          {allRoles.map((r) => (
                            <li key={r.uuid} className="mb-2">
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`role-${r.uuid}`}
                                  checked={userRoles.includes(r.uuid)}
                                  onChange={() => toggleRole(r.uuid)}
                                  disabled={savingRoles}
                                />
                                <label className="form-check-label" htmlFor={`role-${r.uuid}`}>
                                  <strong>{r.name}</strong>
                                  {r.description && (
                                    <small className="d-block text-muted">{r.description}</small>
                                  )}
                                </label>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
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
                        disabled={savingRoles || allRoles.length === 0}
                      >
                        {savingRoles ? (
                          <>
                            <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                            Saving...
                          </>
                        ) : (
                          "Save Roles"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </MainLayout>
  );
}