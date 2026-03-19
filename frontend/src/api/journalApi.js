// src/api/journalApi.js

const API_BASE = process.env.REACT_APP_API_URL;

// Get token from localStorage
const getToken = () => localStorage.getItem("token");

// Build headers
const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken() || ""}`,
});

// Handle response safely
const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = data.message || res.statusText || "API request failed";
    throw new Error(error);
  }

  return data;
};

// ================= API METHODS =================

// Get all journals (with optional search & pagination)
export const getJournals = async (page = 1, limit = 6, search = "") => {
  const query = `?page=${page}&limit=${limit}&search=${search}`;
  const res = await fetch(`${API_BASE}/journals${query}`, {
    headers: getHeaders(),
  });

  return handleResponse(res);
};

// Get journal by ID
export const getJournalById = async (id) => {
  const res = await fetch(`${API_BASE}/journals/${id}`, {
    headers: getHeaders(),
  });

  return handleResponse(res);
};

// Create journal
export const createJournal = async (data) => {
  const res = await fetch(`${API_BASE}/journals`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse(res);
};

// Update journal
export const updateJournal = async (id, data) => {
  const res = await fetch(`${API_BASE}/journals/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse(res);
};

// Delete journal
export const deleteJournal = async (id) => {
  const res = await fetch(`${API_BASE}/journals/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  return handleResponse(res);
};