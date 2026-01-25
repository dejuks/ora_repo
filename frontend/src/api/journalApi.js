// src/api/journalApi.js

const API_URL = "http://localhost:5000/api/journals"; // make sure this matches your backend route

// Get token from localStorage
const getToken = () => localStorage.getItem("token");

// Build headers with token
const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken() || ""}`,
});

// Helper function to handle fetch responses
const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({})); // safely parse JSON
  if (!res.ok) {
    // Throw error with message from backend if available
    const error = data.message || res.statusText || "API request failed";
    throw new Error(error);
  }
  return data;
};

// --- API METHODS ---
export const getJournals = async () => {
  const res = await fetch(API_URL, { headers: getHeaders() });
  return handleResponse(res);
};

export const getJournalById = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, { headers: getHeaders() });
  return handleResponse(res);
};

export const createJournal = async (data) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const updateJournal = async (id, data) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const deleteJournal = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(res);
};
