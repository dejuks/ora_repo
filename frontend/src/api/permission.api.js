import api from "./axios";

// Permissions
export const getPermissions = () => api.get("/permissions");
export const createPermission = (name) => api.post("/permissions", { name });
export const deletePermission = (id) => api.delete(`/permissions/${id}`);
