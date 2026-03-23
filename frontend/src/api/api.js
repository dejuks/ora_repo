// src/api/api.js
import axios from "axios";

const DEFAULT_API_BASE_URL = "http://localhost:5000/api";
const API_BASE_URL = process.env.REACT_APP_API_URL || DEFAULT_API_BASE_URL;

/* =========================================
   AXIOS INSTANCE (Base API)
   This is the main axios instance that other APIs can import
========================================= */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access - clear local storage and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // You might want to redirect to login page here
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Export the axios instance as default for other modules to use
export default api;

/* =========================
   ARTICLES
========================= */

export const getArticles = (filters = {}) =>
  api.get("/wiki/articles", { params: filters }).then(res => res.data);

export const getArticleBySlug = (slug) =>
  api.get(`/wiki/articles/slug/${slug}`).then(res => res.data);

export const getArticleById = (id) =>
  api.get(`/wiki/articles/${id}`).then(res => res.data);

export const createArticle = (data) =>
  api.post("/wiki/articles", data).then(res => res.data);

export const updateArticle = (id, data) =>
  api.put(`/wiki/articles/${id}`, data).then(res => res.data);

export const deleteArticle = (id) =>
  api.delete(`/wiki/articles/${id}`).then(res => res.data);

export const restoreArticle = (id) =>
  api.post(`/wiki/articles/${id}/restore`).then(res => res.data);

export const permanentlyDeleteArticle = (id) =>
  api.delete(`/wiki/articles/${id}/permanent`).then(res => res.data);


/* =========================
   REVISIONS
========================= */

export const getArticleRevisions = (id) =>
  api.get(`/wiki/articles/${id}/revisions`).then(res => res.data);

export const getRevision = (articleId, revisionId) =>
  api.get(`/wiki/articles/${articleId}/revisions/${revisionId}`).then(res => res.data);

export const revertToRevision = (articleId, revisionId) =>
  api.post(`/wiki/articles/${articleId}/revert/${revisionId}`).then(res => res.data);


/* =========================
   VANDALISM
========================= */

export const getVandalismReports = (status = "pending") =>
  api.get("/wiki/vandalism/reports", { params: { status } }).then(res => res.data);

export const reportVandalism = (articleId, data) =>
  api.post(`/wiki/articles/${articleId}/report-vandalism`, data).then(res => res.data);

export const reviewVandalismReport = (reportId, data) =>
  api.put(`/wiki/vandalism/reports/${reportId}/review`, data).then(res => res.data);


/* =========================
   PROTECTION
========================= */

export const protectArticle = (articleId, data) =>
  api.post(`/wiki/articles/${articleId}/protect`, data).then(res => res.data);

export const removeProtection = (articleId) =>
  api.delete(`/wiki/articles/${articleId}/protect`).then(res => res.data);


/* =========================
   USER
========================= */

export const getUserContributions = (userId) =>
  api.get(`/wiki/users/${userId}/contributions`).then(res => res.data);


/* =========================
   HISTORY
========================= */

export const getArticleHistory = (id) =>
  api.get(`/wiki/articles/${id}/history`).then(res => res.data);

export const getRecentChanges = (limit = 50) =>
  api.get("/wiki/recent-changes", { params: { limit } }).then(res => res.data);

export const getPopularArticles = (limit = 10) =>
  api.get("/wiki/popular", { params: { limit } }).then(res => res.data);

export const getRandomArticle = () =>
  api.get("/wiki/random").then(res => res.data);


/* =========================
   WIKI API OBJECT (for backward compatibility)
   This collects all wiki methods into a single object
========================= */

export const wikiApi = {
  // Articles
  getArticles,
  getArticleBySlug,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  restoreArticle,
  permanentlyDeleteArticle,
  
  // Revisions
  getArticleRevisions,
  getRevision,
  revertToRevision,
  
  // Vandalism
  getVandalismReports,
  reportVandalism,
  reviewVandalismReport,
  
  // Protection
  protectArticle,
  removeProtection,
  
  // User
  getUserContributions,
  
  // History
  getArticleHistory,
  getRecentChanges,
  getPopularArticles,
  getRandomArticle,
};

// NOTE: Only ONE default export at the top of the file (export default api;)
// Do NOT add another export default here