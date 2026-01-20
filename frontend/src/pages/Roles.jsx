import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import MainLayout from "../components/layout/MainLayout";

import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} from "../api/role.api";
import { getPermissions } from "../api/permission.api";
import { getRolePermissions, assignPermission, removePermission } from "../api/rolePermission.api";
import { getModules } from "../api/module.api"; // fetch modules

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [rolePerms, setRolePerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [editingRole, setEditingRole] = useState(null);

  const [showPermModal, setShowPermModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [savingPerms, setSavingPerms] = useState(false);

  // Fetch roles
  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRoles();
      setRoles(res.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch roles.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch modules
  const fetchModules = async () => {
    try {
      const res = await getModules();
      setModules(res.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch modules", "error");
    }
  };

  // Fetch permissions
  const fetchPermissions = async () => {
    try {
      const res = await getPermissions();
      setPermissions(res.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch permissions", "error");
    }
  };

  const fetchRolePermissions = async (roleId) => {
    if (!roleId) return;
    try {
      const res = await getRolePermissions(roleId);
      setRolePerms(res.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch role permissions", "error");
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchModules();
    fetchPermissions();
  }, []);

  // Open Create Role modal
  const openCreate = () => {
    setEditingRole(null);
    setRoleName("");
    setModuleId("");
    setShowModal(true);
  };

  // Open Edit Role modal
  const openEdit = (role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setModuleId(role.module_id || "");
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  // Save role
  // Save role
const saveRole = async () => {
  if (!roleName.trim()) return;

  // Convert empty string to null for module_id
  const moduleToSend = moduleId === "" ? null : moduleId;

  // Debug log
  console.log("[DEBUG] Saving role:", {
    editingRole,
    roleName,
    moduleId,
    moduleToSend
  });

  try {
    if (editingRole) {
      // Update role
      const res = await updateRole(editingRole.uuid, roleName, moduleToSend);
      console.log("[DEBUG] Update response:", res);
    } else {
      // Create role
      const res = await createRole(roleName, moduleToSend);
      console.log("[DEBUG] Create response:", res);
    }
    Swal.fire("Success", "Role saved successfully", "success");
    closeModal();
    fetchRoles();
  } catch (err) {
    console.error("[ERROR] saveRole:", err);
    Swal.fire("Error", err.response?.data?.message || "Failed to save role", "error");
  }
};


  // Delete role
  const removeRole = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This role will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });
    if (result.isConfirmed) {
      try {
        await deleteRole(id);
        Swal.fire("Deleted!", "Role has been deleted.", "success");
        fetchRoles();
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to delete role", "error");
      }
    }
  };

  // Permissions modal
  const openPermissionModal = (role) => {
    setSelectedRole(role);
    fetchRolePermissions(role.uuid);
    setShowPermModal(true);
  };

  const closePermModal = () => setShowPermModal(false);

  const togglePermission = async (permId) => {
    if (!selectedRole) return;
    setSavingPerms(true);
    try {
      const assigned = rolePerms.find(rp => rp.uuid === permId);
      if (assigned) await removePermission(selectedRole.uuid, permId);
      else await assignPermission(selectedRole.uuid, permId);
      fetchRolePermissions(selectedRole.uuid);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update permission", "error");
    } finally {
      setSavingPerms(false);
    }
  };

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6"><h1>Roles Management</h1></div>
            <div className="col-sm-6 text-right">
              <button className="btn btn-primary" onClick={openCreate}>
                <i className="fas fa-plus mr-1"></i> Add Role
              </button>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {/* Roles Table */}
          <div className="card card-outline card-primary">
            <div className="card-body table-responsive p-0">
              <table className="table table-hover text-nowrap">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Module</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="4" className="text-center">Loading...</td></tr>
                  ) : roles.length === 0 ? (
                    <tr><td colSpan="4" className="text-center text-muted">No roles found</td></tr>
                  ) : (
                    roles.map((r, i) => (
                      <tr key={r.uuid}>
                        <td>{i + 1}</td>
                        <td>{r.name}</td>
                        <td>{r.module_name || "-"}</td>
                        <td>
                          <button className="btn btn-sm btn-warning mr-1" onClick={() => openEdit(r)}>
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="btn btn-sm btn-danger mr-1" onClick={() => removeRole(r.uuid)}>
                            <i className="fas fa-trash"></i>
                          </button>
                          <button className="btn btn-sm btn-info" onClick={() => openPermissionModal(r)}>
                            <i className="fas fa-key"></i> Permissions
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Create/Edit Role Modal */}
          {showModal && (
            <>
              <div className="modal fade show" style={{ display: "block" }}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">{editingRole ? "Edit Role" : "Add Role"}</h5>
                      <button className="close" onClick={closeModal}><span>&times;</span></button>
                    </div>
                    <div className="modal-body">
                      <div className="form-group">
                        <label>Role Name</label>
                        <input type="text" className="form-control" value={roleName} onChange={e => setRoleName(e.target.value)} autoFocus />
                      </div>
                      <div className="form-group">
                        <label>Module</label>
                        <select className="form-control" value={moduleId} onChange={e => setModuleId(e.target.value)}>
                          <option value="">-- None --</option>
                          {modules.map(m => <option key={m.uuid} value={m.uuid}>{m.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                      <button className="btn btn-primary" onClick={saveRole}>Save</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-backdrop fade show"></div>
            </>
          )}

          {/* Role-Permissions Modal */}
          {showPermModal && selectedRole && (
            <div className="modal fade show" style={{ display: "block" }}>
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Permissions for {selectedRole.name}</h5>
                    <button className="close" onClick={closePermModal}><span>&times;</span></button>
                  </div>
                  <div className="modal-body table-responsive p-0">
                    <div className="mb-2 p-2">
                      <button className="btn btn-sm btn-primary mr-1" disabled={savingPerms} onClick={async () => {
                        setSavingPerms(true);
                        try {
                          const toAssign = permissions.filter(p => !rolePerms.find(rp => rp.uuid === p.uuid)).map(p => assignPermission(selectedRole.uuid, p.uuid));
                          await Promise.all(toAssign);
                          fetchRolePermissions(selectedRole.uuid);
                        } finally { setSavingPerms(false); }
                      }}>Select All</button>
                      <button className="btn btn-sm btn-secondary" disabled={savingPerms} onClick={async () => {
                        setSavingPerms(true);
                        try {
                          const toRemove = rolePerms.map(rp => removePermission(selectedRole.uuid, rp.uuid));
                          await Promise.all(toRemove);
                          fetchRolePermissions(selectedRole.uuid);
                        } finally { setSavingPerms(false); }
                      }}>Unselect All</button>
                    </div>

                    <table className="table table-hover text-nowrap">
                      <thead>
                        <tr><th>#</th><th>Name</th><th>Assigned</th></tr>
                      </thead>
                      <tbody>
                        {permissions.map((p, i) => {
                          const assigned = rolePerms.find(rp => rp.uuid === p.uuid);
                          return (
                            <tr key={p.uuid}>
                              <td>{i + 1}</td>
                              <td>{p.name}</td>
                              <td>
                                <input type="checkbox" checked={!!assigned} disabled={savingPerms} onChange={() => togglePermission(p.uuid)} />
                              </td>
                            </tr>
                          );
                        })}
                        {permissions.length === 0 && <tr><td colSpan="3" className="text-center text-muted">No permissions found</td></tr>}
                      </tbody>
                    </table>
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={closePermModal} disabled={savingPerms}>Close</button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>
    </MainLayout>
  );
}
