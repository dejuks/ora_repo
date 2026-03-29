// repository.api.js

import axios from "./axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// ✅ TOKEN FIX
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ===============================
   CORRECT ENDPOINTS
================================ */

// ✅ CREATE
export const createItem = (data) =>
  API.post("/repository-items", data);

// ✅ GET
export const getItems = () =>
  API.get("/repository-items");

// ✅ SINGLE
export const getItem = (uuid) =>
  API.get(`/repository-items/${uuid}`);

// ✅ UPDATE
export const updateItem = (uuid, data) =>
  API.put(`/repository-items/${uuid}`, data);

// ✅ DELETE
export const deleteItem = (uuid) =>
  API.delete(`/repository-items/${uuid}`);

/* AUTHOR */
export const getDraftItems = () =>
  API.get("/repository-items/author/drafts");

export const submitDraft = (uuid) =>
  API.patch(`/repository-items/author/${uuid}/submit`);
export const createRepositoryAuthor = (data) =>
  API.post("/repository-authors/register", data);