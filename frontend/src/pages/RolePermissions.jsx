import React, { useEffect, useState } from "react";
import { getRoles } from "../api/role.api";
import { getPermissions } from "../api/permission.api";
import { getRolePermissions, assignPermission, removePermission } from "../api/rolePermission.api";

export default function RolePermissions() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [rolePerms, setRolePerms] = useState([]);

  /* FETCH ROLES */
  const fetchRoles = async () => {
    const res = await getRoles();
    setRoles(res.data);
    if (res.data[0]) setSelectedRole(res.data[0].uuid);
  };

  /* FETCH PERMISSIONS */
  const fetchPermissions = async () => {
    const res = await getPermissions();
    setPermissions(res.data);
  };

  /* FETCH ROLE-PERMISSIONS */
  const fetchRolePermissions = async (roleId) => {
    if (!roleId) return;
    const res = await getRolePermissions(roleId);
    setRolePerms(res.data);
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  useEffect(() => {
    fetchRolePermissions(selectedRole);
  }, [selectedRole]);

  /* ASSIGN PERMISSION */
  const handleAssign = async (permId) => {
    await assignPermission(selectedRole, permId);
    fetchRolePermissions(selectedRole);
  };

  /* REMOVE PERMISSION */
  const handleRemove = async (permId) => {
    await removePermission(selectedRole, permId);
    fetchRolePermissions(selectedRole);
  };

  return (
    <section className="content">
      <div className="container-fluid">

        {/* HEADER */}
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1>Role-Permission Management</h1>
          </div>
        </div>

        {/* ROLE SELECT */}
        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label>Select Role</label>
              <select
                className="form-control"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                {roles.map((r) => (
                  <option key={r.uuid} value={r.uuid}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* PERMISSIONS TABLE */}
        <div className="card card-outline card-primary">
          <div className="card-header">
            <h3 className="card-title">Permissions</h3>
          </div>
          <div className="card-body table-responsive p-0">
            <table className="table table-hover text-nowrap">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Permission Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((p, i) => {
                  const assigned = rolePerms.find(rp => rp.uuid === p.uuid);
                  return (
                    <tr key={p.uuid}>
                      <td>{i + 1}</td>
                      <td>{p.name}</td>
                      <td>
                        {assigned ? (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleRemove(p.uuid)}
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleAssign(p.uuid)}
                          >
                            Assign
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {permissions.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center text-muted">
                      No permissions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}
