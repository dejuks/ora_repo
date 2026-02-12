import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const getAEAssignedManuscriptsAPI = async () =>
  (await API.get("/manuscripts/ae/assigned-manuscripts")).data;

export const screeningAPI = (uuid) =>
  API.put(`/manuscripts/ae/screening/${uuid}`);

export const getReviewersByRoleAPI = async () =>
  (await API.get("/manuscripts/ae/reviewers")).data;

export const assignReviewerAPI = (uuid, data) =>
  API.post(`/manuscripts/ae/assign-reviewer/${uuid}`, data);

export const recommendAPI = (uuid, data) =>
  API.put(`/manuscripts/ae/recommend/${uuid}`, data);
