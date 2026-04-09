// api/public_ebook.api.js
import api from "./axios";

<<<<<<< HEAD
const unwrap = async (request) => {
  try {
    const response = await request();
    return response?.data;
  } catch (error) {
    console.error("API Error:", error);
=======
const BASE = "/public";

const unwrap = async (request) => {
  try {
    const response = await request();
    return response?.data ?? null;
  } catch (error) {
    console.error("API Error:", error?.response?.data || error.message || error);
>>>>>>> origin/tbranch
    throw error;
  }
};

<<<<<<< HEAD
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
=======
const normalizeListResponse = (data) => {
  if (!data) return { rows: [], total: 0, page: 1, limit: 20 };

  if (Array.isArray(data)) {
    return {
      rows: data,
      total: data.length,
      page: 1,
      limit: data.length,
    };
  }

  if (Array.isArray(data.rows)) {
    return {
      rows: data.rows,
      total: data.total ?? data.rows.length ?? 0,
      page: data.page ?? 1,
      limit: data.limit ?? data.rows.length ?? 20,
    };
  }

  if (Array.isArray(data.data)) {
    return {
      rows: data.data,
      total: data.total ?? data.data.length ?? 0,
      page: data.page ?? data.current_page ?? 1,
      limit: data.limit ?? data.per_page ?? data.data.length ?? 20,
    };
  }

  return {
    rows: [],
    total: 0,
    page: 1,
    limit: 20,
  };
};

const publicEbookApi = {
  listPublications: async (params = {}) => {
    const queryParams = {
      limit: params.limit ?? 20,
      page: params.page ?? 1,
      ...(params.search ? { search: params.search } : {}),
      ...(params.category ? { category: params.category } : {}),
      ...(params.language ? { language: params.language } : {}),
      ...(params.sort ? { sort: params.sort } : {}),
    };

    const data = await unwrap(() => api.get(`${BASE}/ebooks`, { params: queryParams }));
    return normalizeListResponse(data);
  },

  getPublication: (id) => {
    return unwrap(() => api.get(`${BASE}/ebooks/${id}`));
  },

  getTrendingEbooks: async (limit = 10) => {
    const data = await unwrap(() =>
      api.get(`${BASE}/ebooks/trending`, { params: { limit } })
    );
    return normalizeListResponse(data);
  },

  getNewReleases: async (limit = 10) => {
    const data = await unwrap(() =>
      api.get(`${BASE}/ebooks/new-releases`, { params: { limit } })
    );
    return normalizeListResponse(data);
  },

  getFeaturedEbooks: async (limit = 6) => {
    const data = await unwrap(() =>
      api.get(`${BASE}/ebooks/featured`, { params: { limit } })
    );
    return normalizeListResponse(data);
  },

  getCategories: async () => {
    const data = await unwrap(() => api.get(`${BASE}/categories`));
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.rows)) return data.rows;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  },

  getPublicationsByCategory: async (categorySlug, params = {}) => {
    const data = await unwrap(() =>
      api.get(`${BASE}/categories/${categorySlug}/ebooks`, { params })
    );
    return normalizeListResponse(data);
  },

  searchPublications: async (query, params = {}) => {
    const data = await unwrap(() =>
      api.get(`${BASE}/search`, { params: { q: query, ...params } })
    );
    return normalizeListResponse(data);
  },

  getPublicationsByAuthor: async (authorId, params = {}) => {
    const data = await unwrap(() =>
      api.get(`${BASE}/authors/${authorId}/ebooks`, { params })
    );
    return normalizeListResponse(data);
  },

  getAuthorDetails: (authorId) => {
    return unwrap(() => api.get(`${BASE}/authors/${authorId}`));
  },

  getAuthors: async (params = {}) => {
    const data = await unwrap(() => api.get(`${BASE}/authors`, { params }));
    return normalizeListResponse(data);
  },

  getTopAuthors: async (limit = 10, sortBy = "downloads") => {
    const data = await unwrap(() =>
      api.get(`${BASE}/authors/top`, { params: { limit, sortBy } })
    );
    return normalizeListResponse(data);
  },

  downloadEbook: async (publicationId, format = "pdf") => {
    try {
      await api
        .post(`${BASE}/ebooks/${publicationId}/track-download`, {
          format,
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        })
        .catch(() => {});

      const response = await api.get(`${BASE}/ebooks/${publicationId}/download`, {
        params: { format },
        responseType: "blob",
      });

>>>>>>> origin/tbranch
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
<<<<<<< HEAD
      
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
      
=======

      const contentDisposition = response.headers["content-disposition"];
      let filename = `ebook-${publicationId}.${format}`;

      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match?.[1]) filename = match[1].replace(/['"]/g, "");
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

>>>>>>> origin/tbranch
      return true;
    } catch (error) {
      console.error("Download error:", error);
      throw new Error("Failed to download ebook. Please try again.");
    }
  },

<<<<<<< HEAD
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
=======
  streamEbook: async (publicationId, format = "pdf") => {
    try {
      await api
        .post(`${BASE}/ebooks/${publicationId}/track-view`, {
          format,
          user_agent: navigator.userAgent,
        })
        .catch(() => {});

      const response = await api.get(`${BASE}/ebooks/${publicationId}/stream`, {
        params: { format },
      });

      return response?.data?.stream_url || response?.data?.url || null;
>>>>>>> origin/tbranch
    } catch (error) {
      console.error("Stream error:", error);
      throw new Error("Failed to load ebook for reading.");
    }
  },

<<<<<<< HEAD
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

=======
  getSimilarPublications: async (publicationId, limit = 5) => {
    const data = await unwrap(() =>
      api.get(`${BASE}/ebooks/${publicationId}/similar`, { params: { limit } })
    );
    return normalizeListResponse(data);
  },

  getPublicStats: async () => {
    const data = await unwrap(() => api.get(`${BASE}/stats`));
    return (
      data || {
        totalEbooks: 0,
        totalDownloads: 0,
        totalAuthors: 0,
        languages: 0,
      }
    );
  },

  getRecentActivity: async (limit = 20) => {
    const data = await unwrap(() =>
      api.get(`${BASE}/activity`, { params: { limit } })
    );
    return normalizeListResponse(data);
  },

  getLanguageStats: () => {
    return unwrap(() => api.get(`${BASE}/language-stats`));
  },

  getPublicationTimeline: () => {
    return unwrap(() => api.get(`${BASE}/timeline`));
  },

  subscribeNewsletter: (email, preferences = {}) => {
    return unwrap(() =>
      api.post(`${BASE}/newsletter/subscribe`, { email, preferences })
    );
  },

  getPopularTags: async (limit = 20) => {
    const data = await unwrap(() =>
      api.get(`${BASE}/tags/popular`, { params: { limit } })
    );
    return normalizeListResponse(data);
  },

  searchByTag: async (tag, params = {}) => {
    const data = await unwrap(() =>
      api.get(`${BASE}/tags/${encodeURIComponent(tag)}/ebooks`, { params })
    );
    return normalizeListResponse(data);
  },

  getReadingStats: () => {
    return unwrap(() => api.get(`${BASE}/reading-stats`));
  },

  getShareMetadata: (publicationId) => {
    return unwrap(() => api.get(`${BASE}/ebooks/${publicationId}/share-metadata`));
  },
};

>>>>>>> origin/tbranch
export default publicEbookApi;