import axios from "axios";

// ===============================
// AXIOS INSTANCE
// ===============================
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // http://localhost:5000/api
});

// Attach token dynamically (IMPORTANT)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ===============================
   MAIN RESOURCE: repository-items
================================ */

// CREATE
export const createItem = (data) =>
  API.post("/repository-items", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// GET ALL
export const getItems = () =>
  API.get("/repository-items");

export const getMyItems = () =>
  API.get("/repository-items/author/my-items");
export const getDashboardStats = () =>
  API.get("/repository-items/author/dashboard");
// GET SINGLE
export const getItem = (uuid) =>
  API.get(`/repository-items/${uuid}`);

// UPDATE
export const updateItem = (uuid, data) =>
  API.post(`/repository-items/${uuid}?_method=PUT`, data);

// DELETE
export const deleteItem = (uuid) =>
  API.delete(`/repository-items/${uuid}`);

/* ===============================
   AUTHOR
================================ */

export const getDraftItems = () =>
  API.get("/repository-items/author/drafts");

export const deleteDraft = (uuid) =>
  API.delete(`/repository-items/${uuid}`);

export const submitDraft = (uuid) =>
  API.patch(`/repository-items/author/${uuid}/submit`);

export const getDepositsUnderReview = () =>
  API.get("/repository-items/author/deposits/review");

export const getReturnedDeposits = () =>
  API.get("/repository-items/author/deposits/returned");

export const getApprovedDeposits = () =>
  API.get("/repository-items/author/deposits/approved");

/* ===============================
   CURATOR
================================ */

export const approveItem = (uuid) =>
  API.patch(`/repository-items/${uuid}/approve`);

export const rejectItem = (uuid, reason) =>
  API.post(`/repository-items/${uuid}/reject`, { reason });

export const requestRevision = (uuid, comment) =>
  API.patch(`/repository-items/${uuid}/revision`, { comment });

export const enhanceMetadata = (uuid, metadata) =>
  API.put(`/repository-items/${uuid}/metadata`, { metadata });

export const assignVocabulary = (uuid, vocabulary) =>
  API.put(`/repository-items/${uuid}/vocabulary`, { vocabulary });

export const checkCopyright = (uuid, status, notes) =>
  API.put(`/repository-items/${uuid}/copyright`, { status, notes });

export const getCuratorNewQueue = () =>
  API.get("/repository-items/curator/queue/new");

/* ===============================
   REVIEWER
================================ */

export const getReviewerNewQueue = () =>
  API.get("/repository-items/reviewer/queue/new");

export const claimItemForReview = (uuid) =>
  API.patch(`/repository-items/${uuid}/claim`);

export const bulkClaimItems = (ids) =>
  API.patch("/repository-items/reviewer/queue/claim", { ids });

export const getReviewerItemDetail = (uuid) =>
  API.get(`/repository-items/reviewer/${uuid}`);

/* ===============================
   SEARCH
================================ */

export const searchRepositoryItems = ({ query = "", filterLetter = "", page = 1 }) =>
  API.get("/repository-items/search", {
    params: { query, filterLetter, page },
  });

/* ===============================
   REVISION COMMENT
================================ */

export const updateRevisionComment = (uuid, data) =>
  API.patch(`/repository-items/${uuid}/revision-comment`, data);

export const updateRevisionCommentWithFile = (uuid, formData) =>
  API.patch(`/repository-items/${uuid}/edit-revision`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export default API;