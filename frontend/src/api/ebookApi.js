// src/api/ebookApi.js

import api from "./axios";

// ================= HELPER =================
const unwrap = async (request) => {
  try {
    const response = await request();
    return response?.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// ================= API =================
const ebookApi = {
  // =========================================================
  // AUTH
  // =========================================================

  getCurrentUser: () => {
    return unwrap(() => api.get("/ebook/auth/me"));
  },
// getPublicPublication
    getPublicPublication: (id) => { 
    return unwrap(() =>
      api.get(`/ebooks/public/publications/${id}`)
    );
  },
  //getPublicCitation
  getPublicCitation: (id) => {
    return unwrap(() =>
      api.get(
        `/ebooks/public/publications/${id}/citation`
      )
    );
  },
  getUserRoles: () => {
    return unwrap(() => api.get("/ebook/auth/roles"));
  },

  // publishManuscript
  publishManuscript: (id, data) => {
    return unwrap(() =>
      api.put(`/ebooks/manuscripts/${id}/publish`, data)
    );
  },


  // =========================================================
  // MANUSCRIPTS / SUBMISSIONS
  // =========================================================

  listSubmissions: (params = {}) => {
    return unwrap(() =>
      api.get("/ebook/manuscripts", {
        params: {
          limit: params.limit || 20,
          page: params.page || 1,
          status: params.status,
          search: params.search,
          ...params,
        },
      })
    );
  },

  listMySubmissions: (params = {}) => {
    return unwrap(() =>
      api.get("/ebook/manuscripts/my-submissions", {
        params: {
          limit: params.limit || 20,
          page: params.page || 1,
          status: params.status,
          search: params.search,
          ...params,
        },
      })
    );
  },

  getSubmission: (id) => {
    return unwrap(() =>
      api.get(`/ebook/manuscripts/${id}`)
    );
  },

  createSubmission: (data) => {
    return unwrap(() =>
      api.post("/ebook/manuscripts", data)
    );
  },

  updateSubmission: (id, data) => {
    return unwrap(() =>
      api.put(`/ebook/manuscripts/${id}`, data)
    );
  },

  submitSubmission: (id) => {
    return unwrap(() =>
      api.post(`/ebook/manuscripts/${id}/submit`)
    );
  },

  resubmitSubmission: (id, data) => {
    return unwrap(() =>
      api.post(`/ebook/manuscripts/${id}/resubmit`, data)
    );
  },

  uploadFile: (id, file, role = "manuscript") => {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("role", role);

    return unwrap(() =>
      api.post(
        `/ebook/manuscripts/${id}/files`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      )
    );
  },

  listFiles: (id) => {
    return unwrap(() =>
      api.get(`/ebook/manuscripts/${id}/files`)
    );
  },

  getWorkflow: (id) => {
    return unwrap(() =>
      api.get(`/ebook/manuscripts/${id}/workflow`)
    );
  },

  getReviewComments: (id) => {
    return unwrap(() =>
      api.get(
        `/ebook/manuscripts/${id}/review-comments`
      )
    );
  },

  // =========================================================
  // EDITOR
  // =========================================================

  getEditorQueue: (params = {}) => {
    return unwrap(() =>
      api.get("/ebook/editor/queue", {
        params: {
          stage: params.stage,
          limit: params.limit || 20,
          page: params.page || 1,
          ...params,
        },
      })
    );
  },

  getEditorAssignments: (params = {}) => {
    return unwrap(() =>
      api.get("/ebook/editor/assignments", {
        params: {
          limit: params.limit || 20,
          page: params.page || 1,
          ...params,
        },
      })
    );
  },

  screening: (id, data) => {
    return unwrap(() =>
      api.post(
        `/ebook/editor/manuscripts/${id}/screen`,
        data
      )
    );
  },

  makeDecision: (id, data) => {
    return unwrap(() =>
      api.post(
        `/ebook/editor/manuscripts/${id}/decision`,
        data
      )
    );
  },

  addEditorComment: (id, data) => {
    return unwrap(() =>
      api.post(
        `/ebook/editor/manuscripts/${id}/comment`,
        data
      )
    );
  },

  notifyAuthor: (id, data) => {
    return unwrap(() =>
      api.post(
        `/ebook/editor/manuscripts/${id}/notify`,
        data
      )
    );
  },

  // =========================================================
  // REVIEWER
  // =========================================================

  getReviewerAssignments: (params = {}) => {
    return unwrap(() =>
      api.get("/ebook/reviewer/assignments", {
        params: {
          limit: params.limit || 20,
          page: params.page || 1,
          status: params.status,
          ...params,
        },
      })
    );
  },

  getReviewAssignmentDetail: (id) => {
    return unwrap(() =>
      api.get(
        `/ebook/reviewer/assignments/${id}`
      )
    );
  },

  getReviewAssignmentFiles: (id) => {
    return unwrap(() =>
      api.get(
        `/ebook/reviewer/assignments/${id}/files`
      )
    );
  },

  getReviewTemplate: () => {
    return unwrap(() =>
      api.get("/ebook/reviewer/template")
    );
  },

  respondAssignment: (id, data) => {
    return unwrap(() =>
      api.post(
        `/ebook/reviewer/assignments/${id}/respond`,
        data
      )
    );
  },

  submitReview: (id, data) => {
    return unwrap(() =>
      api.post(
        `/ebook/reviewer/assignments/${id}/submit`,
        data
      )
    );
  },

  updateReview: (id, data) => {
    return unwrap(() =>
      api.put(
        `/ebook/reviewer/assignments/${id}`,
        data
      )
    );
  },

  requestReviewExtension: (id, data) => {
    return unwrap(() =>
      api.post(
        `/ebook/reviewer/assignments/${id}/extension`,
        data
      )
    );
  },

  uploadReviewFile: (id, file) => {
    const formData = new FormData();

    formData.append("file", file);

    return unwrap(() =>
      api.post(
        `/ebook/reviewer/assignments/${id}/files`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      )
    );
  },

  // =========================================================
  // REVIEWER MANAGEMENT
  // =========================================================

  listReviewerOptions: (params = {}) => {
    return unwrap(() =>
      api.get("/ebook/reviewers", {
        params,
      })
    );
  },

  assignReviewer: (submissionId, data) => {
    return unwrap(() =>
      api.post(
        `/ebook/manuscripts/${submissionId}/reviewers`,
        data
      )
    );
  },

  listReviewAssignments: (params = {}) => {
    return unwrap(() =>
      api.get(
        "/ebook/review-assignments",
        {
          params,
        }
      )
    );
  },

  getReviewerReminders: () => {
    return unwrap(() =>
      api.get("/ebook/reviewer/reminders")
    );
  },

  // =========================================================
  // FINANCE
  // =========================================================

  getFinanceItems: (params = {}) => {
    return unwrap(() =>
      api.get("/ebook/finance/items", {
        params,
      })
    );
  },

  submitPaymentProof: (submissionId, data) => {
    return unwrap(() =>
      api.post(
        `/ebook/manuscripts/${submissionId}/payment-proof`,
        data
      )
    );
  },

  verifyPayment: (submissionId, data) => {
    return unwrap(() =>
      api.post(
        `/ebook/finance/manuscripts/${submissionId}/payment/verify`,
        data
      )
    );
  },

  rejectPayment: (submissionId, data) => {
    return unwrap(() =>
      api.post(
        `/ebook/finance/manuscripts/${submissionId}/payment/reject`,
        data
      )
    );
  },

  updatePaymentStatus: (
    submissionId,
    status
  ) => {
    return unwrap(() =>
      api.patch(
        `/ebook/manuscripts/${submissionId}/payment-status`,
        { status }
      )
    );
  },

  // =========================================================
  // PRODUCTION
  // =========================================================

  getProductionItems: (params = {}) => {
    return unwrap(() =>
      api.get("/ebook/production/items", {
        params,
      })
    );
  },

  upsertProduction: (submissionId, data) => {
    return unwrap(() =>
      api.put(
        `/ebook/production/manuscripts/${submissionId}`,
        data
      )
    );
  },

  approveForProduction: (
    submissionId,
    data
  ) => {
    return unwrap(() =>
      api.post(
        `/ebook/production/manuscripts/${submissionId}/approve`,
        data
      )
    );
  },

  publishSubmission: (
    submissionId,
    data
  ) => {
    return unwrap(() =>
      api.post(
        `/ebook/production/manuscripts/${submissionId}/publish`,
        data
      )
    );
  },

  approveProof: (submissionId, data) => {
    return unwrap(() =>
      api.post(
        `/ebook/manuscripts/${submissionId}/proof/approve`,
        data
      )
    );
  },

  // =========================================================
  // PUBLICATIONS
  // =========================================================

  listPublicCatalog: (params = {}) => {
    return unwrap(() =>
      api.get("/ebooks/publications", {
        params,
      })
    );
  },

  listPublications: (params = {}) => {
    return unwrap(() =>
      api.get(
        "/ebooks/management/publications",
        {
          params,
        }
      )
    );
  },

  getPublicSearchSuggestions: (
    params = {}
  ) => {
    return unwrap(() =>
      api.get(
        "/ebooks/publications/search/suggestions",
        {
          params,
        }
      )
    );
  },

  getPublicCitation: (id) => {
    return unwrap(() =>
      api.get(
        `/ebooks/public/publications/${id}/citation`
      )
    );
  },

  downloadPublicPublication: (id) => {
    return unwrap(() =>
      api.get(
        `/ebooks/public/publications/${id}/download`,
        {
          responseType: "blob",
        }
      )
    );
  },
  

  // =========================================================
  // USER LIBRARY
  // =========================================================

  getMyLibrary: (params = {}) => {
    return unwrap(() =>
      api.get("/ebook/my-library", {
        params,
      })
    );
  },

  getReadingHistory: (params = {}) => {
    return unwrap(() =>
      api.get(
        "/ebook/reading-history",
        {
          params,
        }
      )
    );
  },

  addToLibrary: (publicationId) => {
    return unwrap(() =>
      api.post(
        `/ebook/library/${publicationId}`
      )
    );
  },

  trackView: (publicationId) => {
    return unwrap(() =>
      api.post(
        `/ebook/public/publications/${publicationId}/track-view`
      )
    );
  },

  // =========================================================
  // ADMIN
  // =========================================================

  getAdminHealth: () => {
    return unwrap(() =>
      api.get("/ebook/admin/health")
    );
  },

  getAdminStorage: () => {
    return unwrap(() =>
      api.get("/ebook/admin/storage")
    );
  },

  getAdminAuditLogs: (params = {}) => {
    return unwrap(() =>
      api.get(
        "/ebook/admin/audit-logs",
        {
          params,
        }
      )
    );
  },

  saveWorkflowRules: (data) => {
    return unwrap(() =>
      api.post(
        "/ebook/admin/workflow-rules",
        data
      )
    );
  },

  reindexAdmin: () => {
    return unwrap(() =>
      api.post("/ebook/admin/reindex")
    );
  },

  getAllSubmissions: (params = {}) => {
    return unwrap(() =>
      api.get(
        "/ebook/admin/submissions",
        {
          params,
        }
      )
    );
  },

  // =========================================================
  // PAYMENT ORDERED
  // =========================================================

  getPaymentOrderedSubmissions: (
    params = {}
  ) => {
    return unwrap(() =>
      api.get(
        "/ebook/manuscripts/my-submissions",
        {
          params: {
            limit: params.limit || 20,
            page: params.page || 1,
            payment_status: "ordered",
            ...params,
          },
        }
      )
    );
  },

  getPaymentOrderedCount: async () => {
    try {
      const result =
        await ebookApi.getPaymentOrderedSubmissions(
          {
            limit: 1,
          }
        );

      return (
        result?.pagination?.total ||
        result?.rows?.length ||
        0
      );
    } catch (error) {
      console.error(error);
      return 0;
    }
  },

  // =========================================================
  // DASHBOARDS
  // =========================================================

  getAuthorDashboard: async () => {
    try {
      const [
        submissions,
        stats,
        paymentOrdered,
      ] = await Promise.all([
        ebookApi.listMySubmissions({
          limit: 100,
        }),

        unwrap(() =>
          api.get(
            "/ebook/dashboard/author-stats"
          )
        ).catch(() => ({
          summary: {},
        })),

        ebookApi.getPaymentOrderedCount(),
      ]);

      return {
        summary: {
          ...(stats?.summary || {}),
          paymentOrdered,
        },

        submissions:
          submissions?.rows || [],
      };
    } catch (error) {
      console.error(error);

      return {
        summary: {
          paymentOrdered: 0,
        },
        submissions: [],
      };
    }
  },

  getEditorDashboard: async () => {
    const [queue, stats] =
      await Promise.all([
        ebookApi.getEditorQueue({
          limit: 100,
        }),

        unwrap(() =>
          api.get(
            "/ebook/dashboard/editor-stats"
          )
        ).catch(() => ({
          summary: {},
        })),
      ]);

    return {
      summary: stats?.summary || {},
      submissions: queue?.rows || [],
    };
  },

  getReviewerDashboard: async () => {
    const [assignments, stats] =
      await Promise.all([
        ebookApi.getReviewerAssignments({
          limit: 100,
        }),

        unwrap(() =>
          api.get(
            "/ebook/dashboard/reviewer"
          )
        ).catch(() => ({
          summary: {},
        })),
      ]);

    return {
      summary: stats?.summary || {},
      assignments:
        assignments?.rows || [],
    };
  },

  getFinanceDashboard: async () => {
    const [items, stats] =
      await Promise.all([
        ebookApi.getFinanceItems({
          limit: 100,
        }),

        unwrap(() =>
          api.get(
            "/ebook/dashboard/finance-stats"
          )
        ).catch(() => ({
          summary: {},
        })),
      ]);

    return {
      summary: stats?.summary || {},
      finances: items?.rows || [],
    };
  },
  getProductionDashboard: async () => {
    const [items, stats] =
      await Promise.all([
        ebookApi.getProductionItems({
          limit: 100,
        }),

        unwrap(() =>
          api.get(
            "/ebook/dashboard/production-stats"
          )
        ).catch(() => ({
          summary: {},
        })),
      ]);

    return {
      summary: stats?.summary || {},
      production: items?.rows || [],
    };
  },
};

export default ebookApi;