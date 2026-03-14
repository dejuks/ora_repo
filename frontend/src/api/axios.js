import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Public routes that don't need authentication
const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/google',
  '/auth/github',
  '/auth/twitter',
  '/manuscripts/public',
  '/manuscripts/files/'
];

// Check if the URL is a public route
const isPublicRoute = (url) => {
  if (!url) return false;
  return publicRoutes.some(route => url.includes(route));
};

// 🔐 Request interceptor (Attach Token)
api.interceptors.request.use(
  (config) => {
    // Skip token attachment for public routes
    if (!isPublicRoute(config.url)) {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 Response interceptor (Handle 401 globally)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect for public routes
    if (error.response?.status === 401) {
      const url = error.config?.url;
      
      // Only redirect to login if it's not a public route
      if (!isPublicRoute(url)) {
        console.warn("Unauthorized - Redirecting to login");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.replace("/journal/author-login");
      }
    }
    return Promise.reject(error);
  }
);

export default api;