// src/api/manuscript.api.js
import axios from "axios";

/* ==============================
   AXIOS INSTANCE
============================== */
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api/manuscripts", // use env variable for production
  headers: { "Content-Type": "application/json" },
});

/* 🔐 AUTO ATTACH TOKEN */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ==============================
   HELPER
============================== */
const handleResponse = (res) => res.data;
const handleError = (err) => {
  console.error(err);
  throw err.response?.data || err.message || "API request failed";
};

/* ==============================
   API FUNCTIONS
============================== */
export const fetchManuscripts = async (params = {}) => {
  try {
    const res = await API.get("/", { params });
    return handleResponse(res);
  } catch (err) {
    handleError(err);
  }
};

export const fetchManuscript = async (id) => {
  if (!id) throw new Error("Manuscript ID is required");
  try {
    const res = await API.get(`/${id}`);
    return handleResponse(res);
  } catch (err) {
    handleError(err);
  }
};

export const createManuscript = async (data) => {
  if (!data) throw new Error("Manuscript data is required");
  try {
    const res = await API.post("/", data);
    return handleResponse(res);
  } catch (err) {
    handleError(err);
  }
};

export const updateManuscript = async (id, data) => {
  if (!id) throw new Error("Manuscript ID is required");
  if (!data) throw new Error("Update data is required");
  try {
    const res = await API.put(`/${id}`, data);
    return handleResponse(res);
  } catch (err) {
    handleError(err);
  }
};

export const deleteManuscript = async (id) => {
  if (!id) throw new Error("Manuscript ID is required");
  try {
    const res = await API.delete(`/${id}`);
    return handleResponse(res);
  } catch (err) {
    handleError(err);
  }
};

export const fetchScreenedManuscripts = async (params = {}) => {
  try {
    const res = await API.get("/screening", { params });
    return handleResponse(res);
  } catch (err) {
    handleError(err);
  }
};

/* ==============================
   DEFAULT EXPORT
============================== */
const manuscriptAPI = {
  fetchManuscripts,
  fetchManuscript,
  createManuscript,
  updateManuscript,
  deleteManuscript,
  fetchScreenedManuscripts,
};

export default manuscriptAPI;