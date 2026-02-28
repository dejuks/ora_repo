import axios from "axios";

/* =========================================
   AXIOS INSTANCE
========================================= */

const api = axios.create({
  baseURL: "http://localhost:5000/api", // change if needed
  headers: {
    "Content-Type": "application/json",
  },
});


/* =========================================
   PERMISSIONS API
========================================= */

// Get all permissions
export const getPermissions = () =>
  api.get("/permissions").then(res => res.data);

// Create new permission
export const createPermission = (data) =>
  api.post("/permissions", data).then(res => res.data);

// Delete permission
export const deletePermission = (id) =>
  api.delete(`/permissions/${id}`).then(res => res.data);


/* =========================================
   REVIEWERS (Existing Functions You Had)
========================================= */

export const getReviewersAPI = () =>
  api.get("/reviewers").then(res => res.data);

export const getReviewersByRoleAPI = (roleId) =>
  api.get(`/reviewers/role/${roleId}`).then(res => res.data);

export const assignReviewersAPI = (data) =>
  api.post("/reviewers/assign", data).then(res => res.data);