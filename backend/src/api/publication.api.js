import axios from "axios";

/* ================= AXIOS INSTANCE ================= */

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 15000, // 15 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================= OPTIONAL AUTH TOKEN ================= */
// Enable if needed later
/*
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
*/

/* ================= GLOBAL ERROR HANDLER ================= */

const handleError = (error) => {
  if (error.response) {
    console.error("API Error:", error.response.data);
    return Promise.reject(
      error.response.data || { success: false, message: "Server Error" }
    );
  }

  if (error.request) {
    console.error("Network Error:", error.message);
    return Promise.reject({
      success: false,
      message: "Network error. Please check your connection.",
    });
  }

  console.error("Unexpected Error:", error.message);
  return Promise.reject({
    success: false,
    message: error.message,
  });
};

/* ================= PUBLICATION API ================= */

export const publicationAPI = {
  /* ===== Get All Published Manuscripts ===== */
  getPublishedManuscripts: async (page = 1, limit = 6, search = "") => {
    try {
      const response = await API.get("/publications/manuscripts", {
        params: {
          page,
          limit,
          ...(search && { search }),
        },
      });

      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /* ===== Get Single Manuscript ===== */
  getManuscriptById: async (id) => {
    try {
      const response = await API.get(`/publications/manuscripts/${id}`);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /* ===== Get Recent Manuscripts ===== */
  getRecentManuscripts: async (limit = 5) => {
    try {
      const response = await API.get("/publications/manuscripts/recent", {
        params: { limit },
      });

      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /* ===== Get Journal Stats ===== */
  getJournalStats: async () => {
    try {
      const response = await API.get("/publications/stats");
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
  /* ===== Get Single Manuscript by ID ===== */
  getManuscriptById: async (id) => {
    try {
      const response = await API.get(`/publications/manuscripts/${id}`);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /* ===== Get Article by ID (Alias for getManuscriptById) ===== */
  getArticleById: async (id) => {
    try {
      const response = await API.get(`/publications/manuscripts/${id}`);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /* ===== Get Recent Manuscripts ===== */
  getRecentManuscripts: async (limit = 5) => {
    try {
      const response = await API.get("/publications/manuscripts/recent", {
        params: { limit },
      });

      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /* ===== Get Journal Stats ===== */
  getJournalStats: async () => {
    try {
      const response = await API.get("/publications/stats");
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /* ===== Get Related Articles ===== */
  getRelatedArticles: async (category, currentId, limit = 3) => {
    try {
      const response = await API.get("/publications/manuscripts/related", {
        params: { category, currentId, limit },
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /* ===== Download Article File ===== */
  downloadFile: async (fileId) => {
    try {
      const response = await API.get(`/publications/files/${fileId}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
};