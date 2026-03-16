// services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Wiki Article API
export const wikiAPI = {
  // Public endpoints
  getArticles: (params) => API.get('/wiki/articles', { params }),
  getArticle: (id) => API.get(`/wiki/articles/${id}`),
  getArticleBySlug: (slug) => API.get(`/wiki/articles/slug/${slug}`),
  getPopularArticles: (limit = 6) => API.get(`/wiki/articles/popular?limit=${limit}`),
  getRecentArticles: (limit = 6) => API.get(`/wiki/articles/recent?limit=${limit}`),
  getWikiStats: () => API.get('/wiki/articles/stats'),
  getLanguageStats: () => API.get('/wiki/articles/languages/stats'),
  
  // Protected endpoints
  createArticle: (data) => API.post('/wiki/articles', data),
  getMyArticles: () => API.get('/wiki/articles/my-articles'),
  getUserActivity: () => API.get('/wiki/articles/user/activity'),
  getUserContributions: () => API.get('/wiki/articles/user/contributions'),
  getUserStats: () => API.get('/wiki/articles/user/stats'),
  updateArticle: (id, data) => API.put(`/wiki/articles/${id}`, data),
  deleteArticle: (id) => API.delete(`/wiki/articles/${id}`),
  restoreArticle: (id) => API.post(`/wiki/articles/${id}/restore`),
  getRevisions: (id) => API.get(`/wiki/articles/${id}/revisions`),
  
  // Admin only
  permanentlyDeleteArticle: (id) => API.delete(`/wiki/articles/${id}/permanent`),
};

// Media API
export const mediaAPI = {
  // Public endpoints
  getMedia: (params) => API.get('/wiki/media', { params }),
  getMediaItem: (id) => API.get(`/wiki/media/${id}`),
  getArticleMedia: (articleId) => API.get(`/wiki/media/article/${articleId}`),
  getMediaStatistics: () => API.get('/wiki/media/stats'),
  
  // Protected endpoints
  uploadMedia: (formData) => API.post('/wiki/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMyMedia: () => API.get('/wiki/media/user/me'),
  updateMediaItem: (id, data) => API.put(`/wiki/media/${id}`, data),
  deleteMediaItem: (id) => API.delete(`/wiki/media/${id}`),
};

export default API;