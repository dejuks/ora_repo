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
     FETCH DATA
  ============================== */

  const fetchRoles = async () => {
    setLoading(true);
    const res = await getRoles();
    setRoles(res.data || []);
    setLoading(false);
  };

  const fetchModules = async () => {
    const res = await getModules();
    setModules(res.data || []);
  };

  const fetchPermissions = async () => {
    const res = await getPermissions();
    setPermissions(res.data || []);
  };

  const fetchRolePermissions = async (roleId) => {
    const res = await getRolePermissions(roleId);
    setRolePerms(res.data || []);
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
        await updateRole(editingRole.uuid, roleName, moduleId || null)

      } else {
       await createRole(roleName, moduleId || null);
      }

      Swal.fire("Success", "Role saved successfully", "success");
      setShowModal(false);
      fetchRoles();
    } catch (err) {
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
    });

    if (result.isConfirmed) {
      await deleteRole(id);
      fetchRoles();
      Swal.fire("Deleted", "Role deleted", "success");
    }
  };

  /* =============================
     PERMISSIONS
  ============================== */

  const openPermissionModal = (role) => {
    setSelectedRole(role);
    setPermSearch("");
    fetchRolePermissions(role.uuid);
    setShowPermModal(true);
  };

  const togglePermission = async (permId) => {
    setSavingPerms(true);
    const assigned = rolePerms.find((rp) => rp.uuid === permId);

    try {
      if (assigned) {
        await removePermission(selectedRole.uuid, permId);
      } else {
        await assignPermission(selectedRole.uuid, permId);
      }
      fetchRolePermissions(selectedRole.uuid);
    } finally {
      setSavingPerms(false);
    }
  };

  const filteredPermissions = permissions.filter((p) =>
    p.name.toLowerCase().includes(permSearch.toLowerCase())
  );

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
                  {Object.values(groupedRoles).map((group, gi) => (
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
                  ))}
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
                      <button className="close" onClick={() => setShowModal(false)}>
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

          {/* PERMISSION MODAL (unchanged, working) */}
          {showPermModal && selectedRole && (
            <>
              <div className="modal fade show" style={{ display: "block" }}>
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5>Permissions – {selectedRole.name}</h5>
                      <button className="close" onClick={() => setShowPermModal(false)}>
                        <span>&times;</span>
                      </button>
                    </div>

                    <div className="p-2 bg-light">
                      <input
                        className="form-control"
                        placeholder="Search permission..."
                        value={permSearch}
                        onChange={(e) => setPermSearch(e.target.value)}
                      />
                    </div>

                    <div className="modal-body p-0" style={{ maxHeight: "60vh", overflowY: "auto" }}>
                      <table className="table table-sm">
                        <tbody>
                          {filteredPermissions.map((p) => {
                            const assigned = rolePerms.find(rp => rp.uuid === p.uuid);
                            return (
                              <tr key={p.uuid}>
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
