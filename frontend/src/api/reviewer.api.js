import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// attach token if you use auth
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const getReviewerAssignedAPI = async () => {
  const res = await API.get("/manuscripts/reviewer/assigned");
  return res.data;
};
export const respondInvitationAPI = async (id, status) => {
  return API.post(`/manuscripts/reviewer/invitation/${id}/respond`, { status });
};
export const startReviewAPI = async (id) => {
  return API.post(`/manuscripts/reviewer/start-review/${id}`);
};

export const getReviewerWorkspaceAPI = async () => {
  return API.get("/manuscripts/reviewer/workspace");
};

export const acceptReviewAPI = async (id) => {
  return API.put(`/journal/reviewer/accept/${id}`);
};

export const declineReviewAPI = async (id) => {
  return API.put(`/journal/reviewer/decline/${id}`);
};
export const submitReviewAPI = async (id, data) => {
  return API.put(`/journal/reviewer/submit/${id}`, data);
};


