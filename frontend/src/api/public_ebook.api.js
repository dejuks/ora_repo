// api/public_ebook.api.js
import api from "./axios";

const unwrap = async (request) => {
  try {
    const response = await request();
    return response?.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

const publicEbookApi = {
  /**
   * List all published ebooks with filtering and pagination
   * @param {Object} params - Query parameters
   * @param {number} params.limit - Number of items per page (default: 20)
   * @param {number} params.page - Page number (default: 1)
   * @param {string} params.search - Search term for title, author, or description
   * @param {string} params.category - Filter by category slug
   * @param {string} params.language - Filter by language
   * @param {string} params.sort - Sort by: downloads, rating, newest, oldest
   * @returns {Promise<Object>} List of publications with pagination
   */
  listPublications: (params = {}) => {
    const queryParams = {
      limit: params.limit || 20,
      page: params.page || 1,
      ...params
    };
    
    return unwrap(() => api.get("/public/ebooks", { params: queryParams }));
  },

  /**
   * Get a single publication by ID or slug (public access)
   * @param {string|number} id - Publication ID or slug
   * @returns {Promise<Object>} Publication details
   */
  getPublication: (id) => {
    return unwrap(() => api.get(`/public/ebooks/${id}`));
  },

  /**
   * Get trending ebooks (most downloaded and highly rated)
   * @param {number} limit - Number of items to return (default: 10)
   * @returns {Promise<Array>} List of trending ebooks
   */
  getTrendingEbooks: (limit = 10) => {
    return unwrap(() => api.get("/public/ebooks/trending", { params: { limit } }));
  },

  /**
   * Get new releases (most recently published)
   * @param {number} limit - Number of items to return (default: 10)
   * @returns {Promise<Array>} List of new releases
   */
  getNewReleases: (limit = 10) => {
    return unwrap(() => api.get("/public/ebooks/new-releases", { params: { limit } }));
  },

  /**
   * Get featured ebooks (curated by editors)
   * @param {number} limit - Number of items to return (default: 6)
   * @returns {Promise<Array>} List of featured ebooks
   */
  getFeaturedEbooks: (limit = 6) => {
    return unwrap(() => api.get("/public/ebooks/featured", { params: { limit } }));
  },

  /**
   * Get all categories with counts
   * @returns {Promise<Array>} List of categories with ebook counts
   */
  getCategories: () => {
    return unwrap(() => api.get("/public/categories"));
  },

  /**
   * Get ebooks by category
   * @param {string} categorySlug - Category slug
   * @param {Object} params - Additional query parameters
   * @returns {Promise<Object>} Publications in category with pagination
   */
  getPublicationsByCategory: (categorySlug, params = {}) => {
    return unwrap(() => api.get(`/public/categories/${categorySlug}/ebooks`, { params }));
  },

  /**
   * Search publications by keyword
   * @param {string} query - Search query
   * @param {Object} params - Additional search parameters
   * @returns {Promise<Object>} Search results with pagination
   */
  searchPublications: (query, params = {}) => {
    return unwrap(() => api.get("/public/search", { 
      params: { q: query, ...params } 
    }));
  },

  /**
   * Get publications by author
   * @param {string|number} authorId - Author ID or author name
   * @param {Object} params - Pagination parameters
   * @returns {Promise<Object>} Author's publications
   */
  getPublicationsByAuthor: (authorId, params = {}) => {
    return unwrap(() => api.get(`/public/authors/${authorId}/ebooks`, { params }));
  },

  /**
   * Get author details
   * @param {string|number} authorId - Author ID or username
   * @returns {Promise<Object>} Author details and stats
   */
  getAuthorDetails: (authorId) => {
    return unwrap(() => api.get(`/public/authors/${authorId}`));
  },

  /**
   * Get all authors with stats
   * @param {Object} params - Query parameters (limit, page, sort)
   * @returns {Promise<Object>} List of authors with publication counts
   */
  getAuthors: (params = {}) => {
    return unwrap(() => api.get("/public/authors", { params }));
  },

  /**
   * Get top authors by downloads or publications
   * @param {number} limit - Number of authors to return (default: 10)
   * @param {string} sortBy - Sort by: downloads, publications, rating
   * @returns {Promise<Array>} List of top authors
   */
  getTopAuthors: (limit = 10, sortBy = "downloads") => {
    return unwrap(() => api.get("/public/authors/top", { params: { limit, sortBy } }));
  },

  /**
   * Download ebook file (public access with tracking)
   * @param {string|number} publicationId - Publication ID
   * @param {string} format - File format (pdf, epub, mobi) - optional
   * @returns {Promise<void>} Triggers file download
   */
  downloadEbook: async (publicationId, format = "pdf") => {
    try {
      // Track download event (no auth required)
      await api.post(`/public/ebooks/${publicationId}/track-download`, {
        format,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }).catch(() => {
        // Don't block download if tracking fails
        console.warn("Download tracking failed but continuing");
      });
      
      // Trigger file download
      const response = await api.get(`/public/ebooks/${publicationId}/download`, {
        params: { format },
        responseType: "blob"
      });
      
      // Create download link
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers["content-disposition"];
      let filename = `ebook-${publicationId}.${format}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, '');
        }
      }
      
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error("Download error:", error);
      throw new Error("Failed to download ebook. Please try again.");
    }
  },

  /**
   * Stream ebook for reading online (public access)
   * @param {string|number} publicationId - Publication ID
   * @param {string} format - File format (pdf, epub)
   * @returns {Promise<string>} URL for streaming
   */
  streamEbook: async (publicationId, format = "pdf") => {
    try {
      // Track view event
      await api.post(`/public/ebooks/${publicationId}/track-view`, {
        format,
        user_agent: navigator.userAgent
      }).catch(() => {
        console.warn("View tracking failed but continuing");
      });
      
      // Get streaming URL
      const response = await api.get(`/public/ebooks/${publicationId}/stream`, {
        params: { format }
      });
      
      return response.data.stream_url;
    } catch (error) {
      console.error("Stream error:", error);
      throw new Error("Failed to load ebook for reading.");
    }
  },

  /**
   * Get similar publications based on categories and tags
   * @param {string|number} publicationId - Publication ID
   * @param {number} limit - Number of recommendations (default: 5)
   * @returns {Promise<Array>} List of similar publications
   */
  getSimilarPublications: (publicationId, limit = 5) => {
    return unwrap(() => api.get(`/public/ebooks/${publicationId}/similar`, { params: { limit } }));
  },

  /**
   * Get dashboard statistics (public)
   * @returns {Promise<Object>} Statistics including total ebooks, downloads, authors, languages
   */
  getPublicStats: () => {
    return unwrap(() => api.get("/public/stats"));
  },

  /**
   * Get recent activity feed (public)
   * @param {number} limit - Number of activities (default: 20)
   * @returns {Promise<Array>} List of recent activities
   */
  getRecentActivity: (limit = 20) => {
    return unwrap(() => api.get("/public/activity", { params: { limit } }));
  },

  /**
   * Get language stats
   * @returns {Promise<Object>} Statistics by language
   */
  getLanguageStats: () => {
    return unwrap(() => api.get("/public/language-stats"));
  },

  /**
   * Get year-wise publication stats
   * @returns {Promise<Object>} Publications per year
   */
  getPublicationTimeline: () => {
    return unwrap(() => api.get("/public/timeline"));
  },

  /**
   * Subscribe to newsletter (public)
   * @param {string} email - Email address
   * @param {Object} preferences - Subscription preferences (optional)
   * @returns {Promise<Object>} Subscription confirmation
   */
  subscribeNewsletter: (email, preferences = {}) => {
    return unwrap(() => api.post("/public/newsletter/subscribe", { email, preferences }));
  },

  /**
   * Get popular tags
   * @param {number} limit - Number of tags to return (default: 20)
   * @returns {Promise<Array>} List of popular tags
   */
  getPopularTags: (limit = 20) => {
    return unwrap(() => api.get("/public/tags/popular", { params: { limit } }));
  },

  /**
   * Search by tag
   * @param {string} tag - Tag name
   * @param {Object} params - Pagination parameters
   * @returns {Promise<Object>} Publications with the tag
   */
  searchByTag: (tag, params = {}) => {
    return unwrap(() => api.get(`/public/tags/${encodeURIComponent(tag)}/ebooks`, { params }));
  },

  /**
   * Get reading statistics (public)
   * @returns {Promise<Object>} Reading statistics
   */
  getReadingStats: () => {
    return unwrap(() => api.get("/public/reading-stats"));
  },

  /**
   * Get publication metadata for sharing
   * @param {string|number} publicationId - Publication ID
   * @returns {Promise<Object>} Metadata including title, description, cover image
   */
  getShareMetadata: (publicationId) => {
    return unwrap(() => api.get(`/public/ebooks/${publicationId}/share-metadata`));
  }
};

// Export individual functions for convenience
export const {
  listPublications,
  getPublication,
  getTrendingEbooks,
  getNewReleases,
  getFeaturedEbooks,
  getCategories,
  getPublicationsByCategory,
  searchPublications,
  getPublicationsByAuthor,
  getAuthorDetails,
  getAuthors,
  getTopAuthors,
  downloadEbook,
  streamEbook,
  getSimilarPublications,
  getPublicStats,
  getRecentActivity,
  getLanguageStats,
  getPublicationTimeline,
  subscribeNewsletter,
  getPopularTags,
  searchByTag,
  getReadingStats,
  getShareMetadata
} = publicEbookApi;

export default publicEbookApi;