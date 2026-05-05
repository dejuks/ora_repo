import api from "./axios";

export const getPermissions = () => api.get("/permissions");

export const createPermission = (name) =>
  api.post("/permissions", { name });

export const deletePermission = (uuid) =>
  api.delete(`/permissions/${uuid}`);
