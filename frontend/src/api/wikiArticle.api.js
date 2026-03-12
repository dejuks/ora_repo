// api/wikiArticle.api.js
import axios from "axios";

// Create Axios instance with dynamic token
const getAPI = () => {
  const token = localStorage.getItem("token");
  return axios.create({
    baseURL: "http://localhost:5000/api/wiki/articles",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

// Get all articles with pagination and filters
// Get all articles with pagination and filters
export const getArticles = async (params = {}) => {
  try {
    const API = getAPI();
    const response = await API.get("/", { params });
    
    // Handle the response structure from your data
    if (response.data?.success) {
      // Your API returns data directly in response.data.data array
      return {
        success: true,
        data: response.data.data || [], // This matches your data structure
        total: response.data.data?.length || 0
      };
    }
    
    return {
      success: false,
      data: [],
      total: 0
    };
  } catch (error) {
    console.error("Error fetching articles:", error);
    throw error;
  }
};
// Get single article by ID
export const getArticle = async (id) => {
  try {
    const API = getAPI();
    const response = await API.get(`/${id}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data
      };
    }
    
    return {
      success: false,
      data: null
    };
  } catch (error) {
    console.error("Error fetching article:", error);
    throw error;
  }
};

// Get article by slug
export const getArticleBySlug = async (slug) => {
  try {
    const API = getAPI();
    const response = await API.get(`/slug/${slug}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data
      };
    }
    
    return {
      success: false,
      data: null
    };
  } catch (error) {
    console.error("Error fetching article by slug:", error);
    throw error;
  }
};

// Create new article
export const createArticle = async (data) => {
  try {
    const API = getAPI();
    const response = await API.post("/", data);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Article created successfully"
      };
    }
    
    return {
      success: false,
      data: null,
      message: response.data.message || "Failed to create article"
    };
  } catch (error) {
    console.error("Error creating article:", error);
    throw error;
  }
};

// Update article
export const updateArticle = async (id, data) => {
  try {
    const API = getAPI();
    const response = await API.put(`/${id}`, data);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Article updated successfully"
      };
    }
    
    return {
      success: false,
      data: null,
      message: response.data.message || "Failed to update article"
    };
  } catch (error) {
    console.error("Error updating article:", error);
    throw error;
  }
};

// Delete article (soft delete)
export const deleteArticle = async (id) => {
  try {
    const token = localStorage.getItem('token'); // or however you store the JWT
    if (!token) throw new Error("No authentication token found");

    const API = getAPI(); // your Axios instance
    const response = await API.delete(`/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`, // <-- send token
      },
    });
    
    if (response.data.success) {
      return {
        success: true,
        message: response.data.message || "Article deleted successfully"
      };
    }
    
    return {
      success: false,
      message: response.data.message || "Failed to delete article"
    };
  } catch (error) {
    console.error("Error deleting article:", error);
    throw error;
  }
};
// Permanently delete article (admin only)
export const permanentlyDeleteArticle = async (id) => {
  try {
    const API = getAPI();
    const response = await API.delete(`/${id}/permanent`);
    
    if (response.data.success) {
      return {
        success: true,
        message: response.data.message || "Article permanently deleted"
      };
    }
    
    return {
      success: false,
      message: response.data.message || "Failed to permanently delete article"
    };
  } catch (error) {
    console.error("Error permanently deleting article:", error);
    throw error;
  }
};

// Restore archived article
export const restoreArticle = async (id) => {
  try {
    const API = getAPI();
    const response = await API.post(`/${id}/restore`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Article restored successfully"
      };
    }
    
    return {
      success: false,
      data: null,
      message: response.data.message || "Failed to restore article"
    };
  } catch (error) {
    console.error("Error restoring article:", error);
    throw error;
  }
};

// Get article revisions
export const getArticleRevisions = async (id) => {
  try {
    const API = getAPI();
    const response = await API.get(`/${id}/revisions`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data
      };
    }
    
    return {
      success: false,
      data: []
    };
  } catch (error) {
    console.error("Error fetching article revisions:", error);
    throw error;
  }
};

// Get user's articles
export const getMyArticles = async () => {
  try {
    const API = getAPI();
    const response = await API.get("/my-articles");
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data
      };
    }
    
    return {
      success: false,
      data: []
    };
  } catch (error) {
    console.error("Error fetching my articles:", error);
    throw error;
  }
};

// Get user activity
export const getUserActivity = async (limit = 20) => {
  try {
    const API = getAPI();
    const response = await API.get(`/user/activity?limit=${limit}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data
      };
    }
    
    return {
      success: false,
      data: []
    };
  } catch (error) {
    console.error("Error fetching user activity:", error);
    throw error;
  }
};

// Get user contributions
export const getUserContributions = async () => {
  try {
    const API = getAPI();
    const response = await API.get("/user/contributions");
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data
      };
    }
    
    return {
      success: false,
      data: { articles: [], edits: [] }
    };
  } catch (error) {
    console.error("Error fetching user contributions:", error);
    throw error;
  }
};

// Get user stats
export const getUserStats = async () => {
  try {
    const API = getAPI();
    const response = await API.get("/user/stats");
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data
      };
    }
    
    return {
      success: false,
      data: {}
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    throw error;
  }
};

// Get popular articles
export const getPopularArticles = async (limit = 6) => {
  try {
    const API = getAPI();
    const response = await API.get(`/popular?limit=${limit}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data
      };
    }
    
    return {
      success: false,
      data: []
    };
  } catch (error) {
    console.error("Error fetching popular articles:", error);
    throw error;
  }
};

// Get recent articles
export const getRecentArticles = async (limit = 6) => {
  try {
    const API = getAPI();
    const response = await API.get(`/recent?limit=${limit}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data
      };
    }
    
    return {
      success: false,
      data: []
    };
  } catch (error) {
    console.error("Error fetching recent articles:", error);
    throw error;
  }
};

// Get wiki statistics
export const getWikiStats = async () => {
  try {
    const API = getAPI();
    const response = await API.get("/stats");
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data
      };
    }
    
    return {
      success: false,
      data: {}
    };
  } catch (error) {
    console.error("Error fetching wiki stats:", error);
    throw error;
  }
};

// Search articles
export const searchArticles = async (query, params = {}) => {
  try {
    const API = getAPI();
    const response = await API.get("/", { 
      params: { 
        search: query,
        ...params 
      } 
    });
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data.articles || [],
        pagination: response.data.data.pagination
      };
    }
    
    return {
      success: false,
      data: [],
      pagination: null
    };
  } catch (error) {
    console.error("Error searching articles:", error);
    throw error;
  }
};