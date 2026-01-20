import api from "./axios";

// Roles
export const getRoles = () => api.get("/roles");
export const createRole = (name) => api.post("/roles", { name });
export const updateRole = (id, name) => api.put(`/roles/${id}`, { name });
export const deleteRole = (id) => api.delete(`/roles/${id}`);
