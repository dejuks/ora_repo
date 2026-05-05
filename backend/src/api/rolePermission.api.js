import api from "./axios";

// Role ↔ Permission
export const getRolePermissions = (roleId) => api.get(`/role-permissions/${roleId}`);
export const assignPermission = (roleId, permissionId) =>
  api.post("/role-permissions/assign", { roleId, permissionId });
export const removePermission = (roleId, permissionId) =>
  api.post("/role-permissions/remove", { roleId, permissionId });
