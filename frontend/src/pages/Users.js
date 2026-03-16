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

  const [roleModalUser, setRoleModalUser] = useState(null);
  const [allRoles, setAllRoles] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [savingRoles, setSavingRoles] = useState(false);

  const loadUsers = async () => {
    const res = await getUsers();
    setUsers(res.data);
  };

  const loadRoles = async () => {
    try {
      const res = await getRoles();
      setAllRoles(res.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch roles", "error");
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
        Swal.fire("Success", "User updated successfully", "success");
      } else {
        await createUser(data);
        Swal.fire("Success", "User created successfully", "success");
      }
      closeModal();
      loadUsers();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.response?.data?.error || "Operation failed");
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

    // ✅ FIX HERE
    const roles = res.data?.data || [];

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

  const saveRoles = async () => {
    if (!roleModalUser) return;
    setSavingRoles(true);
    try {
      await assignRolesToUser(roleModalUser.uuid, userRoles);
      Swal.fire("Success", "Roles updated successfully", "success");
      setRoleModalUser(null);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.response?.data?.message || "Failed to update roles", "error");
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
                  <th width="150">Actions</th>
                </tr>
              </thead>
              <tbody>
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

                {(!users || users.length === 0) && (
                  <tr>
                    <td colSpan="7" className="text-center text-muted">
                      No users found
                    </td>
                  </tr>
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
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{roleModalUser.full_name} Roles</h5>
                    <button
                      type="button"
                      className="close"
                      onClick={() => setRoleModalUser(null)}
                    >
                      <span>&times;</span>
                    </button>
                  </div>

                  <div className="modal-body">
                    <ul className="list-unstyled mb-0" style={{ maxHeight: 300, overflowY: "auto" }}>
                      {allRoles.map((r) => (
                        <li key={r.uuid}>
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
                              {r.name}
                            </label>
                          </div>
                        </li>
                      ))}
                    </ul>
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
