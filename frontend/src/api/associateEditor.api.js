import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/manuscriptions/ae",
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

// Start screening (submitted → screening) - NEW
export const startScreeningAPI = (uuid) =>
  API.put(`/screening/${uuid}/start`);

// Complete screening (screening → screened) - NEW
export const completeScreeningAPI = (uuid) =>
  API.put(`/screening/${uuid}/complete`);

// DEPRECATED: Old screening function - kept for backward compatibility
export const screeningAPI = (uuid) =>
  API.put(`/screening/${uuid}`);

// Get reviewers
export const getReviewersByRoleAPI = () =>
  API.get("/reviewers");

// Assign reviewer
export const assignReviewerAPI = (uuid, reviewers) =>
  API.post(`/assign-reviewer/${uuid}`, { reviewers });

// Recommend decision
export const recommendAPI = (uuid, decision) =>
  API.put(`/recommend/${uuid}`, { decision });

// Get initial screening manuscripts
export const fetchInitialScreeningManuscripts = async () => {
  const response = await API.get("/screening");
  return response.data;
};

// Reject a manuscript with comment
export const rejectManuscriptAPI = (uuid, comment) =>
  API.put(`/reject/${uuid}`, { comment });

// Fetch reviewers
export const fetchReviewersAPI = async () => {
  const response = await API.get("/reviewers");
  return response.data;
};

// Assign reviewers to manuscript
export const assignReviewersAPI = (uuid, reviewers) =>
  API.post(`/assign-reviewer/${uuid}`, { reviewers });