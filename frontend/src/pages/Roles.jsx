import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import MainLayout from "../components/layout/MainLayout.jsx";

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
  const [apiErrors, setApiErrors] = useState({});

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
    if (!res) return [];
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    if (res?.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
      // Handle case where data is an object with results property
      if (Array.isArray(res.data.results)) return res.data.results;
      if (Array.isArray(res.data.roles)) return res.data.roles;
      if (Array.isArray(res.data.permissions)) return res.data.permissions;
      if (Array.isArray(res.data.modules)) return res.data.modules;
    }
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
      setApiErrors(prev => ({ ...prev, roles: null }));
    } catch (err) {
      console.error("Error fetching roles:", err);
      setApiErrors(prev => ({ ...prev, roles: err.response?.status }));
      
      if (err.response?.status === 404) {
        Swal.fire({
          icon: 'warning',
          title: 'API Endpoint Not Found',
          text: 'The roles API endpoint is not configured. Please check your backend routes.',
          footer: 'Make sure the route "/api/roles" exists in your backend',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.response?.data?.message || 'Failed to fetch roles',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const res = await getModules();
      setModules(normalizeResponseArray(res));
      setApiErrors(prev => ({ ...prev, modules: null }));
    } catch (err) {
      console.error("Error fetching modules:", err);
      setApiErrors(prev => ({ ...prev, modules: err.response?.status }));
      
      if (err.response?.status === 404) {
        Swal.fire({
          icon: 'warning',
          title: 'API Endpoint Not Found',
          text: 'The modules API endpoint is not configured.',
          timer: 3000,
        });
      }
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await getPermissions();
      setPermissions(normalizeResponseArray(res));
      setApiErrors(prev => ({ ...prev, permissions: null }));
    } catch (err) {
      console.error("Error fetching permissions:", err);
      setApiErrors(prev => ({ ...prev, permissions: err.response?.status }));
      
      if (err.response?.status === 404) {
        Swal.fire({
          icon: 'warning',
          title: 'API Endpoint Not Found',
          text: 'The permissions API endpoint is not configured.',
          timer: 3000,
        });
      }
    }
  };

  const fetchRolePermissions = async (roleId) => {
    try {
      const res = await getRolePermissions(roleId);
      const perms = normalizeResponseArray(res);
      setRolePerms(perms);
      setApiErrors(prev => ({ ...prev, rolePerms: null }));
      return perms;
    } catch (err) {
      console.error("Error fetching role permissions:", err);
      setApiErrors(prev => ({ ...prev, rolePerms: err.response?.status }));
      
      if (err.response?.status === 404) {
        Swal.fire({
          icon: 'warning',
          title: 'API Endpoint Not Found',
          text: 'The role permissions API endpoint is not configured.',
        });
      }
      return [];
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
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Role name is required',
      });
      return;
    }

    try {
      if (editingRole) {
        await updateRole(editingRole.uuid, roleName, moduleId || null);
      } else {
        await createRole(roleName, moduleId || null);
      }

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Role saved successfully',
      });
      setShowModal(false);
      fetchRoles();
    } catch (err) {
      console.error(err);
      
      if (err.response?.status === 404) {
        Swal.fire({
          icon: 'warning',
          title: 'API Endpoint Not Found',
          text: 'The role create/update API endpoint is not configured.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.response?.data?.message || 'Failed to save role',
        });
      }
    }
  };

  const removeRole = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteRole(id);
        await fetchRoles();
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Role has been deleted.',
        });
      } catch (err) {
        console.error(err);
        
        if (err.response?.status === 404) {
          Swal.fire({
            icon: 'warning',
            title: 'API Endpoint Not Found',
            text: 'The role delete API endpoint is not configured.',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.response?.data?.message || 'Failed to delete role',
          });
        }
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
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Permission ${isAssigned ? 'removed' : 'assigned'} successfully`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      
      if (err.response?.status === 404) {
        Swal.fire({
          icon: 'warning',
          title: 'API Endpoint Not Found',
          text: 'The permission assignment API endpoint is not configured.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.response?.data?.message || 'Failed to update permission',
        });
      }
    } finally {
      setSavingPerms(false);
    }
  };

  const assignManyPermissions = async (permIds = []) => {
    if (!selectedRole || !permIds.length) return;

    setSavingPerms(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const permId of permIds) {
        if (!assignedPermissionIds.has(permId)) {
          try {
            await assignPermission(selectedRole.uuid, permId);
            successCount++;
          } catch (err) {
            console.error(`Failed to assign permission ${permId}:`, err);
            failCount++;
          }
        }
      }
      
      await fetchRolePermissions(selectedRole.uuid);
      
      if (failCount > 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Partial Success',
          text: `${successCount} permissions assigned, ${failCount} failed`,
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `${successCount} permissions assigned successfully`,
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Failed to assign permissions',
      });
    } finally {
      setSavingPerms(false);
    }
  };

  const removeManyPermissions = async (permIds = []) => {
    if (!selectedRole || !permIds.length) return;

    setSavingPerms(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const permId of permIds) {
        if (assignedPermissionIds.has(permId)) {
          try {
            await removePermission(selectedRole.uuid, permId);
            successCount++;
          } catch (err) {
            console.error(`Failed to remove permission ${permId}:`, err);
            failCount++;
          }
        }
      }
      
      await fetchRolePermissions(selectedRole.uuid);
      
      if (failCount > 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Partial Success',
          text: `${successCount} permissions removed, ${failCount} failed`,
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `${successCount} permissions removed successfully`,
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Failed to remove permissions',
      });
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

          {/* API Status Warnings */}
          {Object.keys(apiErrors).length > 0 && (
            <div className="alert alert-warning alert-dismissible fade show" role="alert">
              <strong>API Configuration Issues:</strong>
              <ul className="mb-0 mt-1">
                {apiErrors.roles === 404 && <li>Roles API endpoint (GET /api/roles) not found</li>}
                {apiErrors.modules === 404 && <li>Modules API endpoint (GET /api/modules) not found</li>}
                {apiErrors.permissions === 404 && <li>Permissions API endpoint (GET /api/permissions) not found</li>}
              </ul>
            </div>
          )}

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
                        <div className="spinner-border text-primary" role="status">
                          <span className="sr-only">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : Object.keys(groupedRoles).length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-4">
                        {apiErrors.roles === 404 
                          ? "Roles API not configured. Please check backend."
                          : "No roles found"}
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
                                title="Edit Role"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-danger mr-1"
                                onClick={() => removeRole(r.uuid)}
                                title="Delete Role"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-info"
                                onClick={() => openPermissionModal(r)}
                                title="Manage Permissions"
                                disabled={apiErrors.permissions === 404}
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
              <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
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
                          placeholder="Enter role name"
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
                        {apiErrors.modules === 404 && (
                          <small className="text-warning">
                            Modules API not configured
                          </small>
                        )}
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
            </>
          )}

          {/* PERMISSION MODAL */}
          {showPermModal && selectedRole && (
            <>
              <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
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
                            disabled={savingPerms || !filteredPermissions.length || apiErrors.permissions === 404}
                          >
                            <i className="fas fa-check-square mr-1"></i>
                            Select All Visible
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={handleUnselectAllVisible}
                            disabled={savingPerms || !filteredPermissions.length || apiErrors.permissions === 404}
                          >
                            <i className="fas fa-minus-square mr-1"></i>
                            Unselect All Visible
                          </button>
                        </div>
                      </div>

                      {apiErrors.permissions === 404 && (
                        <div className="mt-2 alert alert-warning py-1">
                          <small>Permissions API not configured. Permission management is disabled.</small>
                        </div>
                      )}

                      {filteredPermissions.length > 0 && !apiErrors.permissions && (
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
                      {apiErrors.permissions === 404 ? (
                        <div className="text-center text-warning py-4">
                          <i className="fas fa-exclamation-triangle fa-3x mb-3"></i>
                          <h5>Permissions API Not Configured</h5>
                          <p>Please ensure the permissions API endpoint is available in your backend.</p>
                        </div>
                      ) : Object.keys(groupedPermissions).length === 0 ? (
                        <div className="text-center text-muted py-4">
                          {permSearch ? "No permissions match your search" : "No permissions found"}
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
            </>
          )}
        </div>
      </section>
    </MainLayout>
  );
}