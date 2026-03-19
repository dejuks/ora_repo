import api from './api'; // Your axios instance

// Get all articles with filters
export const getArticles = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return api.get(`/wiki/articles${params ? `?${params}` : ''}`);
};

// Get article by slug (public)
export const getArticleBySlug = async (slug) => {
  return api.get(`/wiki/articles/slug/${slug}`);
};

// Get article by ID
export const getArticleById = async (id) => {
  return api.get(`/wiki/articles/${id}`);
};

// Create new article
export const createArticle = async (articleData) => {
  return api.post('/wiki/articles', articleData);
};

// Update article
export const updateArticle = async (id, articleData) => {
  return api.put(`/wiki/articles/${id}`, articleData);
};

// Delete article (soft delete)
export const deleteArticle = async (id) => {
  return api.delete(`/wiki/articles/${id}`);
};

// Admin: Restore article
export const restoreArticle = async (id) => {
  return api.post(`/wiki/articles/${id}/restore`);
};

// Admin: Permanently delete article
export const permanentlyDeleteArticle = async (id) => {
  return api.delete(`/wiki/articles/${id}/permanent`);
};

// Get article revisions
export const getArticleRevisions = async (id) => {
  return api.get(`/wiki/articles/${id}/revisions`);
};

// Get specific revision
export const getRevision = async (articleId, revisionId) => {
  return api.get(`/wiki/articles/${articleId}/revisions/${revisionId}`);
};

// Revert to revision
export const revertToRevision = async (articleId, revisionId) => {
  return api.post(`/wiki/articles/${articleId}/revert/${revisionId}`);
};

// Vandalism Reports
export const getVandalismReports = async (status = 'pending') => {
  return api.get(`/wiki/vandalism/reports?status=${status}`);
};

export const reportVandalism = async (articleId, data) => {
  return api.post(`/wiki/articles/${articleId}/report-vandalism`, data);
};

export const reviewVandalismReport = async (reportId, data) => {
  return api.put(`/wiki/vandalism/reports/${reportId}/review`, data);
};

// Article protection
export const protectArticle = async (articleId, data) => {
  return api.post(`/wiki/articles/${articleId}/protect`, data);
};

export const removeProtection = async (articleId) => {
  return api.delete(`/wiki/articles/${articleId}/protect`);
};

// User contributions
export const getUserContributions = async (userId) => {
  return api.get(`/wiki/users/${userId}/contributions`);
};

// Article history
export const getArticleHistory = async (id) => {
  return api.get(`/wiki/articles/${id}/history`);
};

// Recent changes
export const getRecentChanges = async (limit = 50) => {
  return api.get(`/wiki/recent-changes?limit=${limit}`);
};

// Popular articles
export const getPopularArticles = async (limit = 10) => {
  return api.get(`/wiki/popular?limit=${limit}`);
};

// Random article
export const getRandomArticle = async () => {
  return api.get('/wiki/random');
};