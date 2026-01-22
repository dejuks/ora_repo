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
import {
  getRolePermissions,
  assignPermission,
  removePermission,
} from "../api/rolePermission.api";

import { getModules } from "../api/module.api";

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

  /* =============================
     FETCH DATA
  ============================== */

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRoles();
      setRoles(res.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const res = await getModules();
      setModules(res.data || []);
    } catch {
      Swal.fire("Error", "Failed to fetch modules", "error");
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await getPermissions();
      setPermissions(res.data || []);
    } catch {
      Swal.fire("Error", "Failed to fetch permissions", "error");
    }
  };

  const fetchRolePermissions = async (roleId) => {
    if (!roleId) return;
    try {
      const res = await getRolePermissions(roleId);
      setRolePerms(res.data || []);
    } catch {
      Swal.fire("Error", "Failed to fetch role permissions", "error");
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchModules();
    fetchPermissions();
  }, []);

  /* =============================
     GROUP ROLES BY MODULE
  ============================== */

  const groupedRoles = roles.reduce((acc, role) => {
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

  /* =============================
     MODALS
  ============================== */

  const openCreate = () => {
    setEditingRole(null);
    setRoleName("");
    setModuleId("");
    setShowModal(true);
  };

  const openEdit = (role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setModuleId(role.module_id || "");
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  /* =============================
     SAVE ROLE
  ============================== */

  const saveRole = async () => {
    if (!roleName.trim()) return;

    const moduleToSend = moduleId === "" ? null : moduleId;

    try {
      if (editingRole) {
        await updateRole(editingRole.uuid, roleName, moduleToSend);
      } else {
        await createRole(roleName, moduleToSend);
      }

      Swal.fire("Success", "Role saved successfully", "success");
      closeModal();
      fetchRoles();
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to save role",
        "error"
      );
    }
  };

  /* =============================
     DELETE ROLE
  ============================== */

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
        Swal.fire("Deleted", "Role deleted successfully", "success");
        fetchRoles();
      } catch {
        Swal.fire("Error", "Failed to delete role", "error");
      }
    }
  };

  /* =============================
     PERMISSIONS
  ============================== */

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
      const assigned = rolePerms.find((rp) => rp.uuid === permId);

      if (assigned)
        await removePermission(selectedRole.uuid, permId);
      else
        await assignPermission(selectedRole.uuid, permId);

      fetchRolePermissions(selectedRole.uuid);
    } catch {
      Swal.fire("Error", "Failed to update permission", "error");
    } finally {
      setSavingPerms(false);
    }
  };

  /* =============================
     RENDER
  ============================== */

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Roles Management</h1>
            </div>
            <div className="col-sm-6 text-right">
              <button className="btn btn-primary" onClick={openCreate}>
                <i className="fas fa-plus mr-1"></i> Add Role
              </button>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {/* ROLES TABLE */}
          <div className="card card-outline card-primary">
            <div className="card-body table-responsive p-0">
              <table className="table table-hover text-nowrap">
                <thead>
                  <tr>
                    <th width="5%">#</th>
                    <th>Name</th>
                    <th>Module</th>
                    <th width="25%">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : Object.keys(groupedRoles).length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center text-muted">
                        No roles found
                      </td>
                    </tr>
                  ) : (
                    Object.values(groupedRoles).map((group, gi) => (
                      <React.Fragment key={gi}>
                        {/* MODULE HEADER */}
                        <tr className="bg-light font-weight-bold">
                          <td colSpan="4">
                            <i className="fas fa-layer-group mr-2"></i>
                            {group.module_name}
                          </td>
                        </tr>

                        {/* ROLES */}
                        {group.roles.map((r, i) => (
                          <tr key={r.uuid}>
                            <td>{i + 1}</td>
                            <td>{r.name}</td>
                            <td>{r.module_name || "-"}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-warning mr-1"
                                onClick={() => openEdit(r)}
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-danger mr-1"
                                onClick={() => removeRole(r.uuid)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-info"
                                onClick={() => openPermissionModal(r)}
                              >
                                <i className="fas fa-key"></i> Permissions
                              </button>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* CREATE / EDIT MODAL */}
          {showModal && (
            <>
              <div className="modal fade show" style={{ display: "block" }}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">
                        {editingRole ? "Edit Role" : "Add Role"}
                      </h5>
                      <button className="close" onClick={closeModal}>
                        <span>&times;</span>
                      </button>
                    </div>

                    <div className="modal-body">
                      <div className="form-group">
                        <label>Role Name</label>
                        <input
                          className="form-control"
                          value={roleName}
                          onChange={(e) => setRoleName(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Module</label>
                        <select
                          className="form-control"
                          value={moduleId}
                          onChange={(e) => setModuleId(e.target.value)}
                        >
                          <option value="">-- None --</option>
                          {modules.map((m) => (
                            <option key={m.uuid} value={m.uuid}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="modal-footer">
                      <button
                        className="btn btn-secondary"
                        onClick={closeModal}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={saveRole}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-backdrop fade show"></div>
            </>
          )}

          {/* PERMISSIONS MODAL */}
          {showPermModal && selectedRole && (
            <div className="modal fade show" style={{ display: "block" }}>
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      Permissions for {selectedRole.name}
                    </h5>
                    <button className="close" onClick={closePermModal}>
                      <span>&times;</span>
                    </button>
                  </div>

                  <div className="modal-body table-responsive p-0">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Name</th>
                          <th>Assigned</th>
                        </tr>
                      </thead>
                      <tbody>
                        {permissions.map((p, i) => {
                          const assigned = rolePerms.find(
                            (rp) => rp.uuid === p.uuid
                          );
                          return (
                            <tr key={p.uuid}>
                              <td>{i + 1}</td>
                              <td>{p.name}</td>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={!!assigned}
                                  disabled={savingPerms}
                                  onChange={() => togglePermission(p.uuid)}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      onClick={closePermModal}
                      disabled={savingPerms}
                    >
                      Close
                    </button>
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
