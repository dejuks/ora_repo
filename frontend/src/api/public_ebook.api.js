// api/public_ebook.api.js
import api from "./axios";

const BASE = "/public";

const unwrap = async (request) => {
  try {
    const response = await request();
    return response?.data ?? null;
  } catch (error) {
    console.error("API Error:", error?.response?.data || error.message || error);
    throw error;
  }
};

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
  listPublications: (params = {}) => {
    const queryParams = {
      limit: params.limit ?? 20,
      page: params.page ?? 1,
      ...(params.search ? { search: params.search } : {}),
      ...(params.category ? { category: params.category } : {}),
      ...(params.language ? { language: params.language } : {}),
      ...(params.sort ? { sort: params.sort } : {}),
    };
    return unwrap(() => api.get("/ebook-public/publications", { params: queryParams }));
  },

  getPublication: (id) => {
    return unwrap(() => api.get(`${BASE}/ebooks/${id}`));
  },

  getTrendingEbooks: (limit = 10) => {
    return unwrap(() => api.get("/public/ebooks/trending", { params: { limit } }));
  },

  getNewReleases: (limit = 10) => {
    return unwrap(() => api.get("/public/ebooks/new-releases", { params: { limit } }));
  },

  getFeaturedEbooks: (limit = 6) => {
    return unwrap(() => api.get("/public/ebooks/featured", { params: { limit } }));
  },

  getCategories: () => {
    return unwrap(() => api.get("/public/categories"));
  },

  getPublicationsByCategory: (categorySlug, params = {}) => {
    return unwrap(() => api.get(`/public/categories/${categorySlug}/ebooks`, { params }));
  },

  searchPublications: (query, params = {}) => {
    return unwrap(() => api.get("/public/search", { 
      params: { q: query, ...params } 
    }));
  },

  getPublicationsByAuthor: (authorId, params = {}) => {
    return unwrap(() => api.get(`/public/authors/${authorId}/ebooks`, { params }));
  },

  getAuthorDetails: (authorId) => {
    return unwrap(() => api.get(`${BASE}/authors/${authorId}`));
  },

  getAuthors: (params = {}) => {
    return unwrap(() => api.get("/public/authors", { params }));
  },

  getTopAuthors: (limit = 10, sortBy = "downloads") => {
    return unwrap(() => api.get("/public/authors/top", { params: { limit, sortBy } }));
  },

  /**
   * Get the full URL for a PDF file
   */
  getPdfUrl: (fileUrl) => {
    const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    return fileUrl.startsWith("http") ? fileUrl : `${baseUrl}${fileUrl}`;
  },

  /**
   * Download ebook using direct file URL from API response
   */
  downloadEbook: async (publicationId, format = "pdf") => {
    try {
      const response = await api.get(`/ebook-public/publications`);
      const publications = response?.data?.rows || [];
      const publication = publications.find(p => p.uuid === publicationId);
      
      if (publication && publication.file_url) {
        const fileUrl = publicEbookApi.getPdfUrl(publication.file_url);
        
        const link = document.createElement("a");
        link.href = fileUrl;
        link.setAttribute("download", `${publication.title || 'ebook'}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        try {
          await api.post(`/public/ebooks/${publicationId}/track-download`, {
            format,
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }).catch(() => {});
        } catch (trackError) {
          console.warn("Download tracking failed:", trackError);
        }
        
        return true;
      } else {
        throw new Error("File URL not found for this publication");
      }
    } catch (error) {
      console.error("Download error:", error);
      throw new Error("Failed to download ebook. File may not be available.");
    }
  },

  /**
   * Direct download using file_url
   */
  downloadByFileUrl: async (fileUrl, title = "ebook") => {
    try {
      const fullUrl = publicEbookApi.getPdfUrl(fileUrl);
      const link = document.createElement("a");
      link.href = fullUrl;
      link.setAttribute("download", `${title}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } catch (error) {
      console.error("Download error:", error);
      throw new Error("Failed to download file");
    }
  },

  /**
   * Get PDF URL for viewing in iframe or embed
   */
  getPdfViewerUrl: (fileUrl) => {
    const fullUrl = publicEbookApi.getPdfUrl(fileUrl);
    // Add PDF viewer parameters if needed
    return fullUrl;
  },

  streamEbook: async (publicationId, format = "pdf") => {
    try {
      await api.post(`/public/ebooks/${publicationId}/track-view`, {
        format,
        user_agent: navigator.userAgent
      }).catch(() => {});
      
      const response = await api.get(`/public/ebooks/${publicationId}/stream`, {
        params: { format }
      });

      return response?.data?.stream_url || response?.data?.url || null;
    } catch (error) {
      console.error("Stream error:", error);
      throw new Error("Failed to load ebook for reading.");
    }
  },

  getSimilarPublications: (publicationId, limit = 5) => {
    return unwrap(() => api.get(`/public/ebooks/${publicationId}/similar`, { params: { limit } }));
  },

  getPublicStats: () => {
    return unwrap(() => api.get("/public/stats"));
  },

  getRecentActivity: (limit = 20) => {
    return unwrap(() => api.get("/public/activity", { params: { limit } }));
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

  getPopularTags: (limit = 20) => {
    return unwrap(() => api.get("/public/tags/popular", { params: { limit } }));
  },

  searchByTag: (tag, params = {}) => {
    return unwrap(() => api.get(`/public/tags/${encodeURIComponent(tag)}/ebooks`, { params }));
  },

  getReadingStats: () => {
    return unwrap(() => api.get(`${BASE}/reading-stats`));
  },

  getShareMetadata: (publicationId) => {
    return unwrap(() => api.get(`${BASE}/ebooks/${publicationId}/share-metadata`));
  },
};

export default publicEbookApi;