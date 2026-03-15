import api from "./api";

const safe = async (request, fallback) => {
  try {
    const res = await request();
    return res?.data ?? res;
  } catch (error) {
    if (error?.response?.status === 404) return fallback;
    throw error;
  }
};

export const publicationAPI = {
  getPublishedManuscripts: async (page = 1, limit = 6, search = "") =>
    safe(() => api.get(`/publications/journal`, { params: { page, limit, search } }), { success: true, manuscripts: [], pagination: { page, limit, total: 0, pages: 1 } }),

  getRecentManuscripts: async (limit = 5) =>
    safe(() => api.get(`/publications/journal/recent`, { params: { limit } }), { success: true, manuscripts: [] }),

  getJournalStats: async () =>
    safe(() => api.get(`/publications/journal/stats`), { success: true, stats: { total_manuscripts: 0, total_authors: 0, latest_publication: null } }),

  getArticleById: async (id) =>
    safe(() => api.get(`/publications/journal/${id}`), { success: false, article: null }),
};

export default publicationAPI;
