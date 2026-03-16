import axios from "axios";

/* =========================================
   AXIOS INSTANCE (Base API)
========================================= */
const apiInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


/* =========================
   ARTICLES
========================= */

export const getArticles = (filters = {}) =>
  apiInstance.get("/wiki/articles", { params: filters }).then(res => res.data);

export const getArticleBySlug = (slug) =>
  apiInstance.get(`/wiki/articles/slug/${slug}`).then(res => res.data);

export const getArticleById = (id) =>
  apiInstance.get(`/wiki/articles/${id}`).then(res => res.data);

export const createArticle = (data) =>
  apiInstance.post("/wiki/articles", data).then(res => res.data);

export const updateArticle = (id, data) =>
  apiInstance.put(`/wiki/articles/${id}`, data).then(res => res.data);

export const deleteArticle = (id) =>
  apiInstance.delete(`/wiki/articles/${id}`).then(res => res.data);

export const restoreArticle = (id) =>
  apiInstance.post(`/wiki/articles/${id}/restore`).then(res => res.data);

export const permanentlyDeleteArticle = (id) =>
  apiInstance.delete(`/wiki/articles/${id}/permanent`).then(res => res.data);


/* =========================
   REVISIONS
========================= */

export const getArticleRevisions = (id) =>
  apiInstance.get(`/wiki/articles/${id}/revisions`).then(res => res.data);

export const getRevision = (articleId, revisionId) =>
  apiInstance.get(`/wiki/articles/${articleId}/revisions/${revisionId}`).then(res => res.data);

export const revertToRevision = (articleId, revisionId) =>
  apiInstance.post(`/wiki/articles/${articleId}/revert/${revisionId}`).then(res => res.data);


/* =========================
   VANDALISM
========================= */

export const getVandalismReports = (status = "pending") =>
  apiInstance.get("/wiki/vandalism/reports", { params: { status } }).then(res => res.data);

export const reportVandalism = (articleId, data) =>
  apiInstance.post(`/wiki/articles/${articleId}/report-vandalism`, data).then(res => res.data);

export const reviewVandalismReport = (reportId, data) =>
  apiInstance.put(`/wiki/vandalism/reports/${reportId}/review`, data).then(res => res.data);


/* =========================
   PROTECTION
========================= */

export const protectArticle = (articleId, data) =>
  apiInstance.post(`/wiki/articles/${articleId}/protect`, data).then(res => res.data);

export const removeProtection = (articleId) =>
  apiInstance.delete(`/wiki/articles/${articleId}/protect`).then(res => res.data);


/* =========================
   USER
========================= */

export const getUserContributions = (userId) =>
  apiInstance.get(`/wiki/users/${userId}/contributions`).then(res => res.data);


/* =========================
   HISTORY
========================= */

export const getArticleHistory = (id) =>
  apiInstance.get(`/wiki/articles/${id}/history`).then(res => res.data);

export const getRecentChanges = (limit = 50) =>
  apiInstance.get("/wiki/recent-changes", { params: { limit } }).then(res => res.data);

export const getPopularArticles = (limit = 10) =>
  apiInstance.get("/wiki/popular", { params: { limit } }).then(res => res.data);

export const getRandomArticle = () =>
  apiInstance.get("/wiki/random").then(res => res.data);


/* =========================
   DEFAULT EXPORT (OPTIONAL)
========================= */

const wikiApi = {
  createArticle,
  deleteArticle,
  getArticleById,
  getArticleBySlug,
  getArticleHistory,
  getArticleRevisions,
  getArticles,
  getPopularArticles,
  getRandomArticle,
  getRecentChanges,
  getRevision,
  getUserContributions,
  getVandalismReports,
  permanentlyDeleteArticle,
  protectArticle,
  removeProtection,
  reportVandalism,
  restoreArticle,
  revertToRevision,
  reviewVandalismReport,
  updateArticle,
};

export default wikiApi;