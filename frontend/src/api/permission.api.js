import api from "./axios";

export const getPermissions = () => api.get("/permissions");
export const createPermission = (data) => api.post("/permissions", data);
export const updatePermission = (uuid, data) =>
  api.put(`/permissions/${uuid}`, data);
export const deletePermission = (uuid) => api.delete(`/permissions/${uuid}`);