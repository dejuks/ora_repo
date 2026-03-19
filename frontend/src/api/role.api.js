import api from "./axios";

// Roles
export const getRoles = () => api.get("/roles");

export const createRole = (name, module_id) =>
  api.post("/roles", { name, module_id });

export const updateRole = (id, name, module_id) =>
  api.put(`/roles/${id}`, { name, module_id });

export const deleteRole = (id) =>
  api.delete(`/roles/${id}`);

export const getLibraryRoles = () =>
  api.get("/roles?module=Library Management");
