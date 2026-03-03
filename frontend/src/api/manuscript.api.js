import api from './axios';

/* ==============================
   HELPER FUNCTIONS
============================== */
const handleResponse = (res) => res.data;
const handleError = (err) => {
  console.error('API Error:', err);
  throw err.response?.data || err.message || "API request failed";
};

/* ==============================
   API FUNCTIONS
============================== */
export const fetchManuscripts = async (params = {}) => {
  try {
    const res = await api.get('/manuscripts', { params });
    return handleResponse(res);
  } catch (err) {
    handleError(err);
  }
};

export const fetchManuscript = async (id) => {
  if (!id) throw new Error("Manuscript ID is required");
  try {
    const res = await api.get(`/manuscripts/${id}`);
    return handleResponse(res);
  } catch (err) {
    handleError(err);
  }
};

export const createManuscript = async (data) => {
  if (!data) throw new Error("Manuscript data is required");
  try {
    const res = await api.post('/manuscripts', data);
    return handleResponse(res);
  } catch (err) {
    handleError(err);
  }
};

export const updateManuscript = async (id, data) => {
  if (!id) throw new Error("Manuscript ID is required");
  if (!data) throw new Error("Update data is required");
  try {
    const res = await api.put(`/manuscripts/${id}`, data);
    return handleResponse(res);
  } catch (err) {
    handleError(err);
  }
};

export const deleteManuscript = async (id) => {
  if (!id) throw new Error("Manuscript ID is required");
  try {
    const res = await api.delete(`/manuscripts/${id}`);
    return handleResponse(res);
  } catch (err) {
    handleError(err);
  }
};

export const fetchScreenedManuscripts = async (params = {}) => {
  try {
    const res = await api.get('/manuscripts/screening', { params });
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