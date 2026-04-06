// src/api/repository/public.api.js
import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

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

export const publicationAPI = {
  searchPublicItems: async (
    query = "",
    page = 1,
    limit = 10,
    item_type = "all",
    year = "all",
    sort = "recent"
  ) => {
    try {
      const response = await API.get("/repository/public/search", {
        params: { query, page, limit, item_type, year, sort },
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  getPublicItem: async (uuid) => {
    try {
      const response = await API.get(`/repository/public/item/${uuid}`);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  getRecentItems: async (limit = 5) => {
    try {
      const response = await API.get("/repository/public/recent", {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  getRepositoryStats: async () => {
    try {
      const response = await API.get("/repository/public/stats");
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  trackView: async (uuid) => {
    try {
      const response = await API.post(`/repository/public/item/${uuid}/view`);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  trackDownload: async (uuid) => {
    try {
      const response = await API.post(`/repository/public/item/${uuid}/download`);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  rateItem: async (uuid, rating) => {
    try {
      const response = await API.post(`/repository/public/item/${uuid}/rate`, {
        rating,
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
};

/* optional direct helper exports */
export const getPublicItem = async (uuid) => {
  try {
    const response = await API.get(`/repository/public/item/${uuid}`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const trackView = async (uuid) => {
  try {
    const response = await API.post(`/repository/public/item/${uuid}/view`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const trackDownload = async (uuid) => {
  try {
    const response = await API.post(`/repository/public/item/${uuid}/download`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const rateItem = async (uuid, rating) => {
  try {
    const response = await API.post(`/repository/public/item/${uuid}/rate`, {
      rating,
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getPublicStats = async () => {
  try {
    const response = await API.get("/repository/public/stats");
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getRecentPublicItems = async (limit = 5) => {
  try {
    const response = await API.get("/repository/public/recent", {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export default publicationAPI;