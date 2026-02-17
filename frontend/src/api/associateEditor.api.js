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

// Recommend decision
export const recommendAPI = (uuid, decision) =>
  API.put(`/recommend/${uuid}`, { decision });

/* ============================= */
/* NEW: Initial Screening & Reject */
/* ============================= */


// Reject a manuscript
export const rejectManuscriptAPI = (uuid) =>
  API.put(`/reject/${uuid}`);
export const fetchInitialScreeningManuscripts = async () => {
  const res = await API.get("/screening");
  return res.data;
};



export const fetchReviewersAPI = async () => {
  const res = await API.get("/reviewers");
  return res.data;
};

export const assignReviewersAPI = (id, reviewers) =>
  API.post(`/manuscripts/${id}/assign-reviewers`, { reviewers });

