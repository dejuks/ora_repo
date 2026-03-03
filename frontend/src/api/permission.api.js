import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// ✅ Attach token automatically
API.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getPermissions = () => API.get("/permissions");

export const createPermission = (name) =>
  API.post("/permissions", { name });

export const deletePermission = (uuid) =>
  API.delete(`/permissions/${uuid}`);