// src/api/associateEditor.api.js
import axios from "axios";

/* ==============================
   AXIOS INSTANCE
============================== */
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/manuscriptions/ae" || "http://localhost:5000/api/manuscriptions/ae",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ==============================
   HELPER FUNCTIONS
============================== */
const handleResponse = (res) => res.data;
const handleError = (err) => {
  console.error(err);
  throw err.response?.data || err.message || "API request failed";
};

/* ==============================
   AE ASSIGNMENTS & SCREENING
============================== */
export const getAEAssignedManuscriptsAPI = async () => {
  try {
    const res = await API.get("/assigned-manuscripts");
    return handleResponse(res);
  } catch (err) {
    handleError(err);
  }
};

export const startScreeningAPI = async (uuid) => {
  if (!uuid) throw new Error("Manuscript UUID is required");
  try {
    const res = await API.put(`/screening/${uuid}/start`);
    return handleResponse(res);
  } catch (err) {
    handleError(err);
  }
};

export const completeScreeningAPI = async (uuid) => {
  if (!uuid) throw new Error("Manuscript UUID is required");
  try {
    const res = await API.put(`/screening/${uuid}/complete`);
    return handleResponse(res);
  } catch (err) {
    handleError(err);
  }
};

// Deprecated old screening
export const screeningAPI = async (uuid) => {
  if (!uuid) throw new Error("Manuscript UUID is required");
  try {
    const res = await API.put(`/screening/${uuid}`);
    return handleResponse(res);
  } catch (err) {
    handleError(err);
  }
};

// Fetch manuscripts in initial screening stage
export const fetchInitialScreeningManuscripts = async () => {
  try {
    const res = await API.get("/screening");
    return handleResponse(res);
  } catch (err) {
    handleError(err);
  }
};

/* ==============================
   REVIEWER MANAGEMENT
============================== */
export const getReviewersByRoleAPI = async (roleId) => {
  if (!roleId) throw new Error("Role ID is required");
  try {
    const res = await API.get(`/reviewers/role/${roleId}`);
    return handleResponse(res);
  } catch (err) {
    handleError(err);
  }
};

export const fetchReviewersAPI = async () => {
  try {
    const res = await API.get("/reviewers");
    return handleResponse(res);
  } catch (err) {
    handleError(err);
  }
};

export const assignReviewerAPI = async (uuid, reviewers) => {
  if (!uuid) throw new Error("Manuscript UUID is required");
  if (!reviewers || !Array.isArray(reviewers))
    throw new Error("Reviewers array is required");
  try {
    const res = await API.post(`/assign-reviewer/${uuid}`, { reviewers });
    return handleResponse(res);
  } catch (err) {
    handleError(err);
  }
};

export const assignReviewersAPI = assignReviewerAPI; // alias for backward compatibility

/* ==============================
   DECISIONS
============================== */
export const recommendAPI = async (uuid, decision) => {
  if (!uuid) throw new Error("Manuscript UUID is required");
  if (!decision) throw new Error("Decision is required");
  try {
    const res = await API.put(`/recommend/${uuid}`, { decision });
    return handleResponse(res);
  } catch (err) {
    handleError(err);
  }
};

export const rejectManuscriptAPI = async (uuid, comment) => {
  if (!uuid) throw new Error("Manuscript UUID is required");
  if (!comment) throw new Error("Rejection comment is required");
  try {
    const res = await API.put(`/reject/${uuid}`, { comment });
    return handleResponse(res);
  } catch (err) {
    handleError(err);
  }
};

/* ==============================
   DEFAULT EXPORT
============================== */
const associateEditorAPI = {
  getAEAssignedManuscriptsAPI,
  startScreeningAPI,
  completeScreeningAPI,
  screeningAPI,
  fetchInitialScreeningManuscripts,
  getReviewersByRoleAPI,
  fetchReviewersAPI,
  assignReviewerAPI,
  assignReviewersAPI, // alias
  recommendAPI,
  rejectManuscriptAPI,
};

export default associateEditorAPI;