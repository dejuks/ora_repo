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

export const getManuscripts = () => API.get("/manuscripts");

export const createManuscript = (data) =>
  API.post("/manuscripts", data);

export const updateManuscript = (id, data) =>
  API.put(`/manuscripts/${id}`, data);

export const deleteManuscript = (id) =>
  API.delete(`/manuscripts/${id}`);
export const updateManuscriptStatus = (id, status_id) =>
  API.patch(`/manuscripts/${id}/status`, { status_id });