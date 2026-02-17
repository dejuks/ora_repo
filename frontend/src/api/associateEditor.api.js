import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/manuscripts/ae",
});

// Attach JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ============================= */
/* AE API FUNCTIONS */
/* ============================= */

// Get assigned manuscripts
export const getAEAssignedManuscriptsAPI = () =>
  API.get("/assigned-manuscripts");

// Screening manuscript
export const screeningAPI = (uuid) =>
  API.put(`/screening/${uuid}`);

// Get reviewers
export const getReviewersByRoleAPI = () =>
  API.get("/reviewers");

// Assign reviewer
export const assignReviewerAPI = (uuid, reviewers) =>
  API.post(`/assign-reviewer/${uuid}`, { reviewers });

export const recommendAPI = (uuid, data) =>
  API.put(`/manuscripts/ae/recommend/${uuid}`, data);
