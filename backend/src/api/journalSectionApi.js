const API = "http://localhost:5000/api";

export const getSections = (journalId) =>
  fetch(`${API}/journals/${journalId}/sections`).then((r) => r.json());

export const createSection = (journalId, data) =>
  fetch(`${API}/journals/${journalId}/sections`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const updateSection = (id, data) =>
  fetch(`${API}/journal-sections/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const deleteSection = (id) =>
  fetch(`${API}/journal-sections/${id}`, { method: "DELETE" }).then((r) =>
    r.json()
  );
