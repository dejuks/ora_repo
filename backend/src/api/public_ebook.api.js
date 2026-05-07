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

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

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

      return true;
    } catch (error) {
      console.error("Download error:", error);
      throw new Error("Failed to download ebook. Please try again.");
    }
  },

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
    } catch (error) {
      console.error("Stream error:", error);
      throw new Error("Failed to load ebook for reading.");
    }
  },

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

export default publicEbookApi;