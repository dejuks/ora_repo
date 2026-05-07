import api from "./axios";

export const fetchUserRoles = (userId) => api.get(`/user-roles/${userId}`);
export const assignRolesToUser = (userId, roles = []) =>
  api.post(`/user-roles/${userId}`, { roles });
