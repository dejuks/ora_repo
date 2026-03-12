// src/api/ebookApi.js
import axios from "axios";

/**
 * Backend:
 * app.use("/api/ebooks", ebookRoutes)
 * So baseURL must be: http://localhost:5000/api/ebooks
 */
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
const API_URL = `${API_BASE}/api/ebooks`;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
  },
});

// Add token to requests if available
apiClient.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // ✅ ebook author login page
        window.location.href = "/ebook/login";
      }
    }
    return Promise.reject(error);
  }
);

// helper: normalize axios errors
function throwApiError(error) {
  const msg =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Request failed";
  throw new Error(msg);
}

const ebookApi = {
  // =========================
  // STAFF: list all ebooks
  // GET /api/ebooks?status=...
  // =========================
  getAllEbooks: async (filters = {}) => {
    try {
      const res = await apiClient.get("/", { params: filters }); // ✅ baseURL already /api/ebooks
      return res.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  // =========================
  // AUTHOR: list my ebooks
  // GET /api/ebooks/mine
  // =========================
  getMyEbooks: async () => {
    try {
      const res = await apiClient.get("/mine");
      return res.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  // =========================
  // DETAIL
  // GET /api/ebooks/:id
  // =========================
  getEbookById: async (id) => {
    try {
      const res = await apiClient.get(`/${id}`);
      return res.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  // =========================
  // CREATE (multipart supported)
  // POST /api/ebooks
  // field name: file
  // =========================
    // =========================
  // CREATE (supports FormData OR plain object)
  // POST /api/ebooks
  // field name: file
  // =========================
  createEbook: async (payload) => {
    try {
      // ✅ If caller already built FormData (like AuthorSubmitManuscript.jsx)
      const isFormData =
        typeof FormData !== "undefined" && payload instanceof FormData;

      if (isFormData) {
        const res = await apiClient.post("/", payload); // axios sets boundary
        return res.data;
      }

      // ✅ Otherwise: accept object payload
      const hasFile = payload?.file instanceof File;

      if (hasFile) {
        const fd = new FormData();
        fd.append("title", payload.title || "");
        fd.append("abstract", payload.abstract || "");
        fd.append("status", payload.status || "DRAFT");

        const kw = Array.isArray(payload.keywords)
          ? payload.keywords.join(",")
          : String(payload.keywords || "");
        fd.append("keywords", kw);

        fd.append("file", payload.file);

        const res = await apiClient.post("/", fd);
        return res.data;
      }

      // JSON only
      const res = await apiClient.post("/", {
        title: payload?.title || "",
        abstract: payload?.abstract || null,
        keywords: payload?.keywords || null,
        status: payload?.status || "DRAFT",
      });

      return res.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  // =========================
  // UPDATE
  // PUT /api/ebooks/:id
  // =========================
  updateEbook: async (id, payload) => {
    try {
      const res = await apiClient.put(`/${id}`, {
        title: payload.title ?? null,
        abstract: payload.abstract ?? null,
        keywords: payload.keywords ?? null,
        status: payload.status ?? null,
      });
      return res.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  // =========================
  // DELETE (soft delete)
  // DELETE /api/ebooks/:id
  // =========================
  deleteEbook: async (id) => {
    try {
      const res = await apiClient.delete(`/${id}`);
      return res.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  // =========================
  // FILE UPLOAD to current version
  // POST /api/ebooks/:id/files
  // =========================
  uploadFileToCurrentVersion: async (ebookId, { fileType, file }) => {
    try {
      const fd = new FormData();
      if (fileType) fd.append("fileType", fileType);
      fd.append("file", file);

      const res = await apiClient.post(`/${ebookId}/files`, fd);
      return res.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  // =========================
  // REVISION submit (new version)
  // POST /api/ebooks/:id/revision
  // =========================
  submitRevision: async (ebookId, { notes, file }) => {
    try {
      const fd = new FormData();
      if (notes) fd.append("notes", notes);
      fd.append("file", file);

      const res = await apiClient.post(`/${ebookId}/revision`, fd);
      return res.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  // =========================
  // EDITOR: screening queue
  // GET /api/ebooks/editor/screening
  // =========================
  listScreeningQueue: async (params = {}) => {
    try {
      const res = await apiClient.get("/editor/screening", { params });
      return res.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  startScreening: async (ebookId) => {
    try {
      const res = await apiClient.post(`/${ebookId}/editor/start-screening`);
      return res.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  getScreeningFormData: async (ebookId) => {
    try {
      const res = await apiClient.get(`/${ebookId}/screening-form`);
      return res.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  submitScreeningAssessment: async (ebookId, payload) => {
    try {
      const res = await apiClient.post(`/${ebookId}/screening-assessment`, payload);
      return res.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  requestRevision: async (ebookId, note) => {
    try {
      const res = await apiClient.post(`/${ebookId}/editor/request-revision`, { note });
      return res.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  sendToReview: async (ebookId, reviewerIds = []) => {
    try {
      const res = await apiClient.post(`/${ebookId}/editor/send-to-review`, { reviewerIds });
      return res.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  deskReject: async (ebookId, note) => {
    try {
      const res = await apiClient.post(`/${ebookId}/editor/desk-reject`, { note });
      return res.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  getReviewSummary: async (ebookId) => {
    try {
      const res = await apiClient.get(`/${ebookId}/review-summary`);
      return res.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  editorAccept: async (ebookId, note) => {
    try {
      const res = await apiClient.post(`/${ebookId}/editor/accept`, { note });
      return res.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  // REVIEWER APIs
  getMyReviews: async () => {
    try {
      const res = await apiClient.get("/reviewer/my-reviews");
      return res.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  respondToReview: async (assignmentId, action) => {
    try {
      const res = await apiClient.post(`/reviewer/${assignmentId}/respond`, { action });
      return res.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  submitReview: async (assignmentId, payload) => {
    try {
      const res = await apiClient.post(`/reviewer/${assignmentId}/submit`, {
        recommendation: payload.recommendation,
        comments: payload.comments,
        confidential_comments: payload.confidential_comments || null,
      });
      return res.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  // =========================
  // FINANCE
  // GET /api/ebooks/finance/pending
  // POST /api/ebooks/:id/finance/decision
  // =========================
  listFinancePending: async () => {
    try {
      const res = await apiClient.get('/finance/pending');
      return res.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  financeDecision: async (ebookId, payload) => {
    try {
      const res = await apiClient.post(`/${ebookId}/finance/decision`, payload);
      return res.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  // =========================
  // PRODUCTION + PUBLICATION
  // GET /api/ebooks/production/queue
  // POST /api/ebooks/:id/production/upload-final (multipart)
  // POST /api/ebooks/:id/production/publish
  // =========================
  listProductionQueue: async () => {
    try {
      const res = await apiClient.get('/production/queue');
      return res.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  uploadFinalOutputs: async (ebookId, { pdf, epub, cover }) => {
    try {
      const fd = new FormData();
      if (pdf) fd.append('pdf', pdf);
      if (epub) fd.append('epub', epub);
      if (cover) fd.append('cover', cover);
      const res = await apiClient.post(`/${ebookId}/production/upload-final`, fd);
      return res.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  publishEbook: async (ebookId, payload) => {
    try {
      const res = await apiClient.post(`/${ebookId}/production/publish`, payload);
      return res.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  // =========================
  // PUBLIC LIBRARY (NO AUTH)
  // GET /api/ebooks/public
  // GET /api/ebooks/public/:id
  // GET /api/ebooks/public/:id/download
  // =========================
  publicList: async (q) => {
    try {
      const res = await apiClient.get('/public', { params: q ? { q } : {} });
      return res.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  publicDetail: async (id) => {
    try {
      const res = await apiClient.get(`/public/${id}`);
      return res.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  publicDownload: async (id, type = 'pdf') => {
    try {
      const res = await apiClient.get(`/public/${id}/download`, { params: { type } });
      return res.data;
    } catch (error) {
      throwApiError(error);
    }
  },
};

export default ebookApi;