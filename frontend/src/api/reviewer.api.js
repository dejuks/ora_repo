import axios from "axios";

/* ==============================
   AXIOS INSTANCE
============================== */
const API = axios.create({
  baseURL: "http://localhost:5000/api/manuscripts/reviewer",
});

/* 🔐 AUTO ATTACH TOKEN */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ==============================
   REVIEWER ASSIGNMENTS
============================== */

// Get all assigned reviews
export const getReviewerAssignedAPI = async () => {
  const res = await API.get("/assigned");
  return res.data;
};

// Get reviewer workspace
export const getReviewerWorkspaceAPI = async () => {
  const res = await API.get("/workspace");
  return res.data;
};

// Get assignment details by ID
export const getAssignmentDetailsAPI = async (id) => {
  const res = await API.get(`/assignment/${id}`);
  return res.data;
};

/* ==============================
   INVITATIONS
============================== */

// Respond to invitation (accept or decline)
export const respondInvitationAPI = async (id, status) => {
  const res = await API.post(`/invitation/${id}/respond`, { status });
  return res.data;
};

/* ==============================
   REVIEW MANAGEMENT
============================== */

// Start review for an assignment
export const startReviewAPI = async (id) => {
  const res = await API.post(`/start-review/${id}`);
  return res.data;
};

// Submit review for an assignment
export const submitReviewAPI = async (id, reviewData) => {
  const res = await API.put(`/submit/${id}`, reviewData);
  return res.data;
};
