import React, { useEffect, useMemo, useState } from "react";
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

  /* ROLE MODAL */
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleName, setRoleName] = useState("");
  const [moduleId, setModuleId] = useState("");

  /* PERMISSION MODAL */
  const [showPermModal, setShowPermModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [savingPerms, setSavingPerms] = useState(false);
  const [permSearch, setPermSearch] = useState("");

  /* =============================
     HELPERS
  ============================== */

  const normalizeResponseArray = (res) => {
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    return [];
  };

  const prettifyText = (value = "") =>
    String(value)
      .replace(/\./g, " ")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  /* =============================
     FETCH DATA
  ============================== */

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await getRoles();
      setRoles(normalizeResponseArray(res));
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch roles", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const res = await getModules();
      setModules(normalizeResponseArray(res));
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch modules", "error");
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await getPermissions();
      setPermissions(normalizeResponseArray(res));
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch permissions", "error");
    }
  };

  const fetchRolePermissions = async (roleId) => {
    try {
      const res = await getRolePermissions(roleId);
      setRolePerms(normalizeResponseArray(res));
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

  /* =============================
     GROUP ROLES BY MODULE
  ============================== */

  const groupedRoles = useMemo(() => {
    return roles.reduce((acc, role) => {
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
  }, [roles]);

  /* =============================
     ROLE CRUD
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

  const saveRole = async () => {
    if (!roleName.trim()) {
      Swal.fire("Error", "Role name is required", "error");
      return;
    }

    try {
      if (editingRole) {
        await updateRole(editingRole.uuid, roleName, moduleId || null);
      } else {
        await createRole(roleName, moduleId || null);
      }

      Swal.fire("Success", "Role saved successfully", "success");
      setShowModal(false);
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

  const removeRole = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
    });

    if (result.isConfirmed) {
      try {
        await deleteRole(id);
        await fetchRoles();
        Swal.fire("Deleted", "Role deleted", "success");
      } catch (err) {
        console.error(err);
        Swal.fire(
          "Error",
          err.response?.data?.message || "Failed to delete role",
          "error"
        );
      }
    }
  };

  /* =============================
     PERMISSIONS
  ============================== */

  const openPermissionModal = async (role) => {
    setSelectedRole(role);
    setPermSearch("");
    setShowPermModal(true);
    await fetchRolePermissions(role.uuid);
  };

  const assignedPermissionIds = useMemo(
    () => new Set(rolePerms.map((rp) => rp.uuid)),
    [rolePerms]
  );

  const filteredPermissions = useMemo(() => {
    const q = permSearch.trim().toLowerCase();
    if (!q) return permissions;

    return permissions.filter((p) => {
      const group = (p.module_group || "System Wide").toLowerCase();
      const permName = (p.name || "").toLowerCase();
      const description = (p.description || "").toLowerCase();
      return (
        permName.includes(q) ||
        group.includes(q) ||
        description.includes(q)
      );
    });
  }, [permissions, permSearch]);

  // Group: module_group -> resource -> permissions
  const groupedPermissions = useMemo(() => {
    return filteredPermissions.reduce((acc, perm) => {
      const moduleGroup = perm.module_group || "System Wide";

      const parts = String(perm.name || "").split(".");
      const action = parts.pop() || perm.name;

      let resource = parts.join(".");
      if (!resource) resource = "general";

      if (!acc[moduleGroup]) {
        acc[moduleGroup] = {
          module_group: moduleGroup,
          resources: {},
        };
      }

      if (!acc[moduleGroup].resources[resource]) {
        acc[moduleGroup].resources[resource] = [];
      }

      acc[moduleGroup].resources[resource].push({
        ...perm,
        action,
        resource,
      });

      return acc;
    }, {});
  }, [filteredPermissions]);

  const togglePermission = async (permId) => {
    if (!selectedRole) return;

    setSavingPerms(true);
    const isAssigned = assignedPermissionIds.has(permId);

    try {
      if (isAssigned) {
        await removePermission(selectedRole.uuid, permId);
      } else {
        await assignPermission(selectedRole.uuid, permId);
      }
      await fetchRolePermissions(selectedRole.uuid);
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to update permission",
        "error"
      );
    } finally {
      setSavingPerms(false);
    }
  };

  const assignManyPermissions = async (permIds = []) => {
    if (!selectedRole || !permIds.length) return;

    setSavingPerms(true);
    try {
      for (const permId of permIds) {
        if (!assignedPermissionIds.has(permId)) {
          await assignPermission(selectedRole.uuid, permId);
        }
      }
      await fetchRolePermissions(selectedRole.uuid);
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to assign permissions",
        "error"
      );
    } finally {
      setSavingPerms(false);
    }
  };

  const removeManyPermissions = async (permIds = []) => {
    if (!selectedRole || !permIds.length) return;

    setSavingPerms(true);
    try {
      for (const permId of permIds) {
        if (assignedPermissionIds.has(permId)) {
          await removePermission(selectedRole.uuid, permId);
        }
      }
      await fetchRolePermissions(selectedRole.uuid);
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to remove permissions",
        "error"
      );
    } finally {
      setSavingPerms(false);
    }
  };

  const handleSelectAllVisible = async () => {
    await assignManyPermissions(filteredPermissions.map((p) => p.uuid));
  };

  const handleUnselectAllVisible = async () => {
    await removeManyPermissions(filteredPermissions.map((p) => p.uuid));
  };

  const getGroupPermissionList = (groupBlock) =>
    Object.values(groupBlock.resources).flat();

  const getResourcePermissionList = (resourceGroup) => resourceGroup;

  const allVisibleSelected =
    filteredPermissions.length > 0 &&
    filteredPermissions.every((p) => assignedPermissionIds.has(p.uuid));

  /* =============================
     RENDER
  ============================== */

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid">
          <div className="d-flex justify-content-between mb-3">
            <h1>Roles Management</h1>
            <button className="btn btn-primary" onClick={openCreate}>
              <i className="fas fa-plus mr-1"></i> Add Role
            </button>
          </div>

          <div className="card">
            <div className="card-body table-responsive p-0">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Role</th>
                    <th>Module</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4">
                        Loading...
                      </td>
                    </tr>
                  ) : Object.keys(groupedRoles).length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-4">
                        No roles found
                      </td>
                    </tr>
                  ) : (
                    Object.values(groupedRoles).map((group, gi) => (
                      <React.Fragment key={gi}>
                        <tr className="bg-light font-weight-bold">
                          <td colSpan="4">{group.module_name}</td>
                        </tr>
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
                                <i className="fas fa-key"></i>
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

          {/* ROLE MODAL */}
          {showModal && (
            <>
              <div className="modal fade show" style={{ display: "block" }}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">
                        {editingRole ? "Edit Role" : "Add Role"}
                      </h5>
                      <button
                        className="close"
                        onClick={() => setShowModal(false)}
                      >
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
                          <option value="">No Module</option>
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
                        onClick={() => setShowModal(false)}
                      >
                        Cancel
                      </button>
                      <button className="btn btn-primary" onClick={saveRole}>
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-backdrop fade show"></div>
            </>
          )}

          {/* PERMISSION MODAL */}
                  {/* PERMISSION MODAL */}
          {showPermModal && selectedRole && (
            <>
              <div className="modal fade show" style={{ display: "block" }}>
                <div className="modal-dialog modal-xl">
                  <div className="modal-content">
                    <div className="modal-header">
                      <div>
                        <h5 className="mb-0">Permissions – {selectedRole.name}</h5>
                        <small className="text-muted">
                          Assigned: {rolePerms.length} | Visible: {filteredPermissions.length}
                        </small>
                      </div>
                      <button
                        className="close"
                        onClick={() => setShowPermModal(false)}
                      >
                        <span>&times;</span>
                      </button>
                    </div>

                    <div className="p-3 border-bottom bg-light">
                      <div className="row">
                        <div className="col-md-6 mb-2 mb-md-0">
                          <input
                            className="form-control"
                            placeholder="Search permission, module group, or description..."
                            value={permSearch}
                            onChange={(e) => setPermSearch(e.target.value)}
                          />
                        </div>

                        <div className="col-md-6 text-md-right">
                          <button
                            className="btn btn-sm btn-success mr-2"
                            onClick={handleSelectAllVisible}
                            disabled={savingPerms || !filteredPermissions.length}
                          >
                            <i className="fas fa-check-square mr-1"></i>
                            Select All Visible
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={handleUnselectAllVisible}
                            disabled={savingPerms || !filteredPermissions.length}
                          >
                            <i className="fas fa-minus-square mr-1"></i>
                            Unselect All Visible
                          </button>
                        </div>
                      </div>

                      {filteredPermissions.length > 0 && (
                        <div className="mt-2">
                          <span
                            className={`badge ${
                              allVisibleSelected
                                ? "badge-success"
                                : "badge-secondary"
                            }`}
                          >
                            {allVisibleSelected
                              ? "All visible permissions selected"
                              : "Not all visible permissions selected"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div
                      className="modal-body"
                      style={{ maxHeight: "68vh", overflowY: "auto" }}
                    >
                      {Object.keys(groupedPermissions).length === 0 ? (
                        <div className="text-center text-muted py-4">
                          No permissions found
                        </div>
                      ) : (
                        Object.entries(groupedPermissions).map(
                          ([groupKey, groupBlock]) => {
                            const groupPerms = Object.values(groupBlock.resources)
                              .flat()
                              .sort((a, b) => a.name.localeCompare(b.name));

                            const groupAssignedCount = groupPerms.filter((p) =>
                              assignedPermissionIds.has(p.uuid)
                            ).length;

                            const groupAllSelected =
                              groupPerms.length > 0 &&
                              groupPerms.every((p) =>
                                assignedPermissionIds.has(p.uuid)
                              );

                            return (
                              <div
                                className="card card-outline card-primary mb-3"
                                key={groupKey}
                              >
                                <div className="card-header">
                                  <div className="d-flex justify-content-between align-items-center flex-wrap">
                                    <div>
                                      <h5 className="mb-0">
                                        {groupBlock.module_group}
                                      </h5>
                                      <small className="text-muted">
                                        {groupAssignedCount} / {groupPerms.length} selected
                                      </small>
                                    </div>

                                    <div className="mt-2 mt-md-0">
                                      <button
                                        className="btn btn-sm btn-success mr-2"
                                        disabled={savingPerms || !groupPerms.length}
                                        onClick={() =>
                                          assignManyPermissions(
                                            groupPerms.map((p) => p.uuid)
                                          )
                                        }
                                      >
                                        Select All in Group
                                      </button>

                                      <button
                                        className="btn btn-sm btn-outline-danger"
                                        disabled={savingPerms || !groupPerms.length}
                                        onClick={() =>
                                          removeManyPermissions(
                                            groupPerms.map((p) => p.uuid)
                                          )
                                        }
                                      >
                                        Unselect All in Group
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                <div className="card-body">
                                  {groupAllSelected && (
                                    <div className="mb-3">
                                      <span className="badge badge-info">
                                        Group Complete
                                      </span>
                                    </div>
                                  )}

                                  <div className="row">
                                    {groupPerms.map((p) => {
                                      const assigned = assignedPermissionIds.has(p.uuid);

                                      return (
                                        <div
                                          className="col-md-4 col-sm-6 mb-2"
                                          key={p.uuid}
                                        >
                                          <div className="border rounded px-2 py-2 h-100 d-flex align-items-start">
                                            <input
                                              type="checkbox"
                                              className="mt-1 mr-2"
                                              checked={assigned}
                                              disabled={savingPerms}
                                              onChange={() =>
                                                togglePermission(p.uuid)
                                              }
                                            />
                                            <div>
                                              <div className="font-weight-bold">
                                                {prettifyText(p.name)}
                                              </div>
                                              <small className="text-muted d-block">
                                                {p.name}
                                              </small>
                                              {p.description && (
                                                <small className="text-muted d-block">
                                                  {p.description}
                                                </small>
                                              )}
                                              <span
                                                className={`badge mt-1 ${
                                                  assigned
                                                    ? "badge-success"
                                                    : "badge-secondary"
                                                }`}
                                              >
                                                {assigned
                                                  ? "Assigned"
                                                  : "Not Assigned"}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        )
                      )}
                    </div>

                    <div className="modal-footer">
                      <button
                        className="btn btn-secondary"
                        onClick={() => setShowPermModal(false)}
                        disabled={savingPerms}
                      >
                        Close
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