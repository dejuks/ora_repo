import React, { useEffect, useState } from "react";
import MainLayout from "../../../../components/layout/MainLayout";
import { getUsers, deleteUser, createUser, updateUser } from "../../../../api/user.api";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import UserForm from "../../../../components/UserForm.jsx"; // Assuming you have this component
import { getRoles } from "../../../../api/role.api.js";
import { fetchUserRoles, assignRolesToUser } from "../../../../api/userRole.api.js";

export default function UserList({ adminModuleId }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggedUserModuleId, setLoggedUserModuleId] = useState("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Role modal states
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [allRoles, setAllRoles] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [savingRoles, setSavingRoles] = useState(false);

  // Get logged user's module ID from localStorage
  useEffect(() => {
    const getLoggedUserModule = () => {
      try {
        // Check common localStorage keys for user data
        const userDataKeys = ['user', 'authUser', 'currentUser', 'loggedUser', 'auth_user'];
        
        for (const key of userDataKeys) {
          const storedData = localStorage.getItem(key);
          if (storedData) {
            const userData = JSON.parse(storedData);
            if (userData.module_id) {
              setLoggedUserModuleId(userData.module_id);
              return userData.module_id;
            } else if (userData.module?.uuid) {
              setLoggedUserModuleId(userData.module.uuid);
              return userData.module.uuid;
            } else if (userData.module) {
              setLoggedUserModuleId(userData.module);
              return userData.module;
            }
          }
        }
        
        console.warn("Logged user module not found in localStorage");
        return null;
      } catch (error) {
        console.error("Error getting logged user module:", error);
        return null;
      }
    };

    getLoggedUserModule();
  }, []);

  // Load all roles
  const loadRoles = async () => {
    try {
      const res = await getRoles();
      setAllRoles(res.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch roles", "error");
    }
  };

  // Load users - only from logged user's module
  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      let allUsers = res.data || [];
      
      // First priority: Use logged user's module ID
      if (loggedUserModuleId) {
        allUsers = allUsers.filter((u) => u.module_id === loggedUserModuleId);
      } 
      // Fallback: Use adminModuleId prop
      else if (adminModuleId) {
        allUsers = allUsers.filter((u) => u.module_id === adminModuleId);
      }
      // If no module filter is available, show empty
      else {
        allUsers = [];
        Swal.fire({
          title: "Permission Required",
          text: "Unable to determine your module. Please contact administrator.",
          icon: "warning"
        });
      }

      setUsers(allUsers);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loggedUserModuleId || adminModuleId) {
      loadUsers();
      loadRoles();
    }
  }, [loggedUserModuleId, adminModuleId]);

  // User Form Modal Functions
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
      // Ensure user is created in the logged user's module
      const userData = {
        ...data,
        module_id: loggedUserModuleId || adminModuleId || data.module_id
      };

      if (editingUser) {
        await updateUser(editingUser.uuid, userData);
        Swal.fire("Success", "User updated successfully", "success");
      } else {
        await createUser(userData);
        Swal.fire("Success", "User created successfully", "success");
      }
      closeModal();
      loadUsers();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.response?.data?.error || "Operation failed", "error");
    }
  };

  const closeModal = () => setShowModal(false);

  // Delete user
  const handleDelete = async (uuid) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This user will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, keep it",
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await deleteUser(uuid);
        Swal.fire("Deleted!", "User has been deleted.", "success");
        loadUsers();
      } catch (err) {
        console.error(err);
        Swal.fire("Error", err.response?.data?.error || "Failed to delete user", "error");
      }
    }
  };

  // Role Assignment Modal Functions
  const openRoleModal = async (user) => {
    setRoleModalUser(user);
    try {
      const res = await fetchUserRoles(user.uuid);
      setUserRoles(res.data.map((r) => r.uuid));
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

  // Get module name for display
  const getModuleName = (moduleId) => {
    if (!moduleId) return "-";
    return `Module: ${moduleId.substring(0, 8)}...`;
  };

  return (
    <MainLayout>
      {/* PAGE HEADER */}
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2 align-items-center">
            <div className="col-sm-6">
              <h1>User Management</h1>
              {loggedUserModuleId && (
                <small className="text-muted">
                  Showing users from your module only
                </small>
              )}
            </div>
            <div className="col-sm-6 text-right">
              <Link to={'/module/users/add'} className="btn btn-primary">
                <i className="fas fa-plus mr-1"></i>
                Add User
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            {/* Info Card */}
            <div className="col-md-12 mb-3">
              <div className="card card-info">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-info-circle mr-2"></i>
                    Module Information
                  </h3>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <p>
                        <strong>Your Module:</strong> 
                        <span className="ml-2 badge badge-primary">
                          {loggedUserModuleId ? 
                            `ID: ${loggedUserModuleId.substring(0, 8)}...` : 
                            'Not detected'}
                        </span>
                      </p>
                      <p>
                        <strong>Total Users in Your Module:</strong> 
                        <span className="ml-2 badge badge-success">
                          {users.length} user{users.length !== 1 ? 's' : ''}
                        </span>
                      </p>
                    </div>
                    <div className="col-md-6">
                      <div className="alert alert-light">
                        <small>
                          <i className="fas fa-exclamation-triangle mr-1"></i>
                          You can only view and manage users from your own module. 
                          This restriction ensures proper access control and data isolation.
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Users Table Card */}
            <div className="col-md-12">
              <div className="card card-primary">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-users mr-2"></i>
                    Users in Your Module
                  </h3>
                  <div className="card-tools">
                    <button 
                      type="button" 
                      className="btn btn-tool" 
                      onClick={loadUsers}
                      disabled={loading}
                    >
                      <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i>
                    </button>
                  </div>
                </div>

                <div className="card-body">
                  {loading ? (
                    <div className="text-center py-5">
                      <i className="fas fa-spinner fa-spin fa-2x text-primary mb-3"></i>
                      <p className="text-muted">Loading users from your module...</p>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="fas fa-users-slash fa-3x text-muted mb-3"></i>
                      <h4 className="text-muted">No Users Found</h4>
                      <p className="text-muted">
                        No users found in your module. 
                        {loggedUserModuleId ? " Start by adding a new user." : " Unable to detect your module."}
                      </p>
                      {loggedUserModuleId && (
                        <button
                          className="btn btn-primary mt-2"
                          onClick={openCreate}
                        >
                          <i className="fas fa-plus mr-1"></i> Add First User
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="thead-light">
                          <tr>
                            <th>#</th>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Gender</th>
                            <th>DOB</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((u, index) => (
                            <tr key={u.uuid}>
                              <td>{index + 1}</td>
                              <td>
                                <strong>{u.full_name}</strong>
                              </td>
                              <td>
                                <a href={`mailto:${u.email}`} className="text-primary">
                                  {u.email}
                                </a>
                              </td>
                              <td>
                                {u.phone ? (
                                  <a href={`tel:${u.phone}`} className="text-info">
                                    {u.phone}
                                  </a>
                                ) : "-"}
                              </td>
                              <td>
                                <span className={`badge ${
                                  u.gender === 'Male' ? 'badge-info' : 
                                  u.gender === 'Female' ? 'badge-pink' : 'badge-secondary'
                                }`}>
                                  {u.gender || "-"}
                                </span>
                              </td>
                              <td>{u.dob ? new Date(u.dob).toLocaleDateString() : "-"}</td>
                              <td>
                                <div className="btn-group">
                                  <button
                                    className="btn btn-sm btn-outline-warning mr-1"
                                    onClick={() => openEdit(u)}
                                    title="Edit User"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-info mr-1"
                                    onClick={() => openRoleModal(u)}
                                    title="Assign Roles"
                                  >
                                    <i className="fas fa-user-tag"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDelete(u.uuid)}
                                    title="Delete User"
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                
                {/* Card Footer */}
                {!loading && users.length > 0 && (
                  <div className="card-footer">
                    <div className="row">
                      <div className="col-md-6">
                        <small className="text-muted">
                          Showing {users.length} user{users.length !== 1 ? 's' : ''} from your module
                        </small>
                      </div>
                      <div className="col-md-6 text-right">
                        <small className="text-muted">
                          Last updated: {new Date().toLocaleTimeString()}
                        </small>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* USER FORM MODAL */}
      {showModal && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block", pointerEvents: "auto", zIndex: 1050 }}
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
                  loggedUserModuleId={loggedUserModuleId}
                />
              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
        </>
      )}

      {/* ROLE ASSIGNMENT MODAL */}
      {roleModalUser && (
        <>
          <div className="modal fade show" style={{ display: "block", zIndex: 1060 }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="fas fa-user-tag mr-2"></i>
                    Assign Roles to {roleModalUser.full_name}
                  </h5>
                  <button
                    type="button"
                    className="close"
                    onClick={() => setRoleModalUser(null)}
                    disabled={savingRoles}
                  >
                    <span>&times;</span>
                  </button>
                </div>

                <div className="modal-body">
                  <p className="text-muted mb-3">
                    Select roles to assign to this user:
                  </p>
                  
                  <div style={{ maxHeight: 300, overflowY: "auto" }}>
                    {allRoles.length === 0 ? (
                      <div className="text-center py-3">
                        <i className="fas fa-info-circle fa-2x text-muted mb-2"></i>
                        <p className="text-muted">No roles available</p>
                      </div>
                    ) : (
                      <div className="list-group">
                        {allRoles.map((r) => (
                          <div key={r.uuid} className="list-group-item list-group-item-action">
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="form-check mb-0">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`role-${r.uuid}`}
                                  checked={userRoles.includes(r.uuid)}
                                  onChange={() => toggleRole(r.uuid)}
                                  disabled={savingRoles}
                                />
                                <label className="form-check-label ml-2" htmlFor={`role-${r.uuid}`}>
                                  <strong>{r.name}</strong>
                                </label>
                              </div>
                              <span className="badge badge-light">{r.code || r.role_code}</span>
                            </div>
                            {r.description && (
                              <small className="text-muted d-block mt-1 pl-4">
                                {r.description}
                              </small>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    <small className="text-muted">
                      <i className="fas fa-info-circle mr-1"></i>
                      {userRoles.length} role{userRoles.length !== 1 ? 's' : ''} selected
                    </small>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setRoleModalUser(null)}
                    disabled={savingRoles}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={saveRoles}
                    disabled={savingRoles || allRoles.length === 0}
                  >
                    {savingRoles ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Saving...
                      </>
                    ) : (
                      'Save Roles'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
        </>
      )}
    </MainLayout>
  );
}