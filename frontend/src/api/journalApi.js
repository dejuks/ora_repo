const API_URL = "http://localhost:5000/journals";

// Get token from localStorage (adjust key if you use a different one)
const getToken = () => localStorage.getItem("token");

// Attach JWT to every request
const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// Fetch all journals
export const getJournals = async () => {
  const res = await fetch(API_URL, { headers: getHeaders() });
  return res.json();
};

// Fetch single journal
export const getJournalById = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, { headers: getHeaders() });
  return res.json();
};

// Create journal
export const createJournal = async (data) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

// Update journal
export const updateJournal = async (id, data) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

// Delete journal
export const deleteJournal = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return res.json();
};
