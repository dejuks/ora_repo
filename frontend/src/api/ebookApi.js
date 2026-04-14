// api/ebook.api.js - Database-based API
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

const ebookApi = {
  // ==================== AUTHENTICATION & USER ====================
  
  /**
   * Get current user's profile
   */
  getCurrentUser: () => {
    return unwrap(() => api.get("/ebook/auth/me"));
  },

  /**
   * Get user's roles
   */
  getUserRoles: () => {
    return unwrap(() => api.get("/ebook/auth/roles"));
  },

  // ==================== SUBMISSIONS ====================
  
  /**
   * List submissions with filters (only user's own if not admin)
   */
  listSubmissions: (params = {}) => {
    const queryParams = {
      limit: params.limit || 20,
      page: params.page || 1,
      status: params.status,
      stage: params.stage,
      search: params.search,
      ...params
    };
    return unwrap(() => api.get("/ebook/submissions", { params: queryParams }));
  },

  /**
   * List user's own submissions
   */
  listMySubmissions: (params = {}) => {
    const queryParams = {
      limit: params.limit || 20,
      page: params.page || 1,
      status: params.status,
      stage: params.stage,
      ...params
    };
    return unwrap(() => api.get("/ebook/my-submissions", { params: queryParams }));
  },

  /**
   * Get single submission by ID
   */
  getSubmission: (id) => {
    return unwrap(() => api.get(`/ebook/submissions/${id}`));
  },

  /**
   * Create new submission
   */
  createSubmission: (data) => {
    return unwrap(() => api.post("/ebook/submissions", data));
  },

  /**
   * Update submission
   */
  updateSubmission: (id, data) => {
    return unwrap(() => api.put(`/ebook/submissions/${id}`, data));
  },

  /**
   * Submit submission for review
   */
  submitSubmission: (id) => {
    return unwrap(() => api.post(`/ebook/submissions/${id}/submit`));
  },

  /**
   * Resubmit after revisions
   */
  resubmitSubmission: (id, data) => {
    return unwrap(() => api.post(`/ebook/submissions/${id}/resubmit`, data));
  },

  /**
   * Upload file for submission
   */
  uploadFile: (id, file, role = "manuscript") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("role", role);
    return unwrap(() => api.post(`/ebook/submissions/${id}/files`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }));
  },

  /**
   * Get files for submission
   */
  listFiles: (id) => {
    return unwrap(() => api.get(`/ebook/submissions/${id}/files`));
  },

  /**
   * Get workflow for submission
   */
  getWorkflow: (id) => {
    return unwrap(() => api.get(`/ebook/submissions/${id}/workflow`));
  },

  /**
   * Get review comments for submission
   */
  getReviewComments: (id) => {
    return unwrap(() => api.get(`/ebook/submissions/${id}/review-comments`));
  },

  // ==================== EDITOR FUNCTIONS ====================
  
  /**
   * Get editor queue
   */
  getEditorQueue: (params = {}) => {
    const queryParams = {
      stage: params.stage,
      limit: params.limit || 20,
      page: params.page || 1,
      ...params
    };
    return unwrap(() => api.get("/ebook/editor/queue", { params: queryParams }));
  },

  /**
   * Get editor assignments (manuscripts assigned to editor)
   */
  getEditorAssignments: (params = {}) => {
    const queryParams = {
      limit: params.limit || 20,
      page: params.page || 1,
      ...params
    };
    return unwrap(() => api.get("/ebook/editor/assignments", { params: queryParams }));
  },

  /**
   * Screen submission (editor action)
   */
  screening: (id, data) => {
    return unwrap(() => api.post(`/ebook/editor/submissions/${id}/screen`, data));
  },

  /**
   * Make editorial decision
   */
  makeDecision: (id, data) => {
    return unwrap(() => api.post(`/ebook/editor/submissions/${id}/decision`, data));
  },

  /**
   * Add editor comment
   */
  addEditorComment: (id, data) => {
    return unwrap(() => api.post(`/ebook/editor/submissions/${id}/comment`, data));
  },

  /**
   * Notify author
   */
  notifyAuthor: (id, data) => {
    return unwrap(() => api.post(`/ebook/editor/submissions/${id}/notify`, data));
  },

  // ==================== REVIEWER FUNCTIONS ====================
  
  /**
   * Get reviewer assignments
   */
  getReviewerAssignments: (params = {}) => {
    const queryParams = {
      limit: params.limit || 20,
      page: params.page || 1,
      status: params.status,
      ...params
    };
    return unwrap(() => api.get("/ebook/reviewer/assignments", { params: queryParams }));
  },

  /**
   * Get review assignment detail
   */
  getReviewAssignmentDetail: (id) => {
    return unwrap(() => api.get(`/ebook/reviewer/assignments/${id}`));
  },

  /**
   * Get review assignment files
   */
  getReviewAssignmentFiles: (id) => {
    return unwrap(() => api.get(`/ebook/reviewer/assignments/${id}/files`));
  },

  /**
   * Get review template
   */
  getReviewTemplate: () => {
    return unwrap(() => api.get("/ebook/reviewer/template"));
  },

  /**
   * Respond to review assignment
   */
  respondAssignment: (id, data) => {
    return unwrap(() => api.post(`/ebook/reviewer/assignments/${id}/respond`, data));
  },

  /**
   * Submit review
   */
  submitReview: (id, data) => {
    return unwrap(() => api.post(`/ebook/reviewer/assignments/${id}/submit`, data));
  },

  /**
   * Update review
   */
  updateReview: (id, data) => {
    return unwrap(() => api.put(`/ebook/reviewer/assignments/${id}`, data));
  },

  /**
   * Request review extension
   */
  requestReviewExtension: (id, data) => {
    return unwrap(() => api.post(`/ebook/reviewer/assignments/${id}/extension`, data));
  },

  /**
   * Upload review file
   */
  uploadReviewFile: (id, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return unwrap(() => api.post(`/ebook/reviewer/assignments/${id}/files`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }));
  },

  // ==================== REVIEWER MANAGEMENT ====================
  
  /**
   * List available reviewers
   */
  listReviewerOptions: (params = {}) => {
    return unwrap(() => api.get("/ebook/reviewers", { params }));
  },

  /**
   * Assign reviewer to submission
   */
  assignReviewer: (submissionId, data) => {
    return unwrap(() => api.post(`/ebook/submissions/${submissionId}/reviewers`, data));
  },

  /**
   * List review assignments (admin/editor)
   */
  listReviewAssignments: (params = {}) => {
    return unwrap(() => api.get("/ebook/review-assignments", { params }));
  },

  /**
   * Get reviewer reminders
   */
  getReviewerReminders: () => {
    return unwrap(() => api.get("/ebook/reviewer/reminders"));
  },

  // ==================== FINANCE FUNCTIONS ====================
  
  /**
   * Get finance dashboard data
   */
  getFinanceDashboard: (params = {}) => {
    return unwrap(() => api.get("/ebook/finance/dashboard", { params }));
  },

  /**
   * Get finance items assigned to user
   */
  getFinanceItems: (params = {}) => {
    return unwrap(() => api.get("/ebook/finance/items", { params }));
  },

  /**
   * Submit payment proof
   */
  submitPaymentProof: (submissionId, data) => {
    return unwrap(() => api.post(`/ebook/submissions/${submissionId}/payment-proof`, data));
  },

  /**
   * Request waiver
   */
  requestWaiver: (submissionId, data) => {
    return unwrap(() => api.post(`/ebook/submissions/${submissionId}/waiver`, data));
  },

  /**
   * Get finance transactions
   */
  getFinanceTransactions: (submissionId) => {
    return unwrap(() => api.get(`/ebook/submissions/${submissionId}/transactions`));
  },

  /**
   * Get invoice
   */
  getInvoice: (submissionId) => {
    return unwrap(() => api.get(`/ebook/submissions/${submissionId}/invoice`));
  },

  /**
   * Issue invoice (finance officer)
   */
  issueInvoice: (submissionId, data) => {
    return unwrap(() => api.post(`/ebook/finance/submissions/${submissionId}/invoice`, data));
  },

  /**
   * Approve waiver (finance officer)
   */
  approveWaiver: (submissionId, data) => {
    return unwrap(() => api.post(`/ebook/finance/submissions/${submissionId}/waiver/approve`, data));
  },

  /**
   * Decline waiver (finance officer)
   */
  declineWaiver: (submissionId, data) => {
    return unwrap(() => api.post(`/ebook/finance/submissions/${submissionId}/waiver/decline`, data));
  },

  /**
   * Verify payment (finance officer)
   */
  verifyPayment: (submissionId, data) => {
    return unwrap(() => api.post(`/ebook/finance/submissions/${submissionId}/payment/verify`, data));
  },

  /**
   * Reject payment (finance officer)
   */
  rejectPayment: (submissionId, data) => {
    return unwrap(() => api.post(`/ebook/finance/submissions/${submissionId}/payment/reject`, data));
  },

  // ==================== PRODUCTION FUNCTIONS ====================
  
  /**
   * Get production dashboard data
   */
  getProductionDashboard: (params = {}) => {
    return unwrap(() => api.get("/ebook/production/dashboard", { params }));
  },

  /**
   * Get production items assigned to user
   */
  getProductionItems: (params = {}) => {
    return unwrap(() => api.get("/ebook/production/items", { params }));
  },

  /**
   * Upsert production metadata
   */
  upsertProduction: (submissionId, data) => {
    return unwrap(() => api.put(`/ebook/production/submissions/${submissionId}`, data));
  },

  /**
   * Approve for production
   */
  approveForProduction: (submissionId, data) => {
    return unwrap(() => api.post(`/ebook/production/submissions/${submissionId}/approve`, data));
  },

  /**
   * Publish submission
   */
  publishSubmission: (submissionId, data) => {
    return unwrap(() => api.post(`/ebook/production/submissions/${submissionId}/publish`, data));
  },

  /**
   * Approve proof (author)
   */
  approveProof: (submissionId, data) => {
    return unwrap(() => api.post(`/ebook/submissions/${submissionId}/proof/approve`, data));
  },

  // ==================== PUBLIC FUNCTIONS ====================
  
  /**
   * List publications (public catalog)
   */
  listPublications: (params = {}) => {
    const queryParams = {
      limit: params.limit || 20,
      page: params.page || 1,
      search: params.search,
      category: params.category,
      ...params
    };
    return unwrap(() => api.get("/ebook/public/publications", { params: queryParams }));
  },

  /**
   * List public catalog
   */
  listPublicCatalog: (params = {}) => {
    return ebookApi.listPublications(params);
  },

  /**
   * Get public publication by ID
   */
  getPublicPublication: (id) => {
    return unwrap(() => api.get(`/ebook/public/publications/${id}`));
  },

  /**
   * Get public search suggestions
   */
  getPublicSearchSuggestions: (params = {}) => {
    return unwrap(() => api.get("/ebook/public/search/suggestions", { params }));
  },

  /**
   * Get public citation
   */
  getPublicCitation: (id) => {
    return unwrap(() => api.get(`/ebook/public/publications/${id}/citation`));
  },

  /**
   * Download public publication
   */
  downloadPublicPublication: (id) => {
    return unwrap(() => api.get(`/ebook/public/publications/${id}/download`, {
      responseType: "blob"
    }));
  },

  // ==================== USER LIBRARY ====================
  
  /**
   * Get user's library (downloaded/purchased books)
   */
  getMyLibrary: (params = {}) => {
    return unwrap(() => api.get("/ebook/my-library", { params }));
  },

  /**
   * Get reading history
   */
  getReadingHistory: (params = {}) => {
    return unwrap(() => api.get("/ebook/reading-history", { params }));
  },

  /**
   * Add book to library
   */
  addToLibrary: (publicationId) => {
    return unwrap(() => api.post(`/ebook/library/${publicationId}`));
  },

  /**
   * Track view/read
   */
  trackView: (publicationId) => {
    return unwrap(() => api.post(`/ebook/public/publications/${publicationId}/track-view`));
  },

  // ==================== ADMIN FUNCTIONS ====================
  
  /**
   * Get admin health status
   */
  getAdminHealth: () => {
    return unwrap(() => api.get("/ebook/admin/health"));
  },

  /**
   * Get admin storage info
   */
  getAdminStorage: () => {
    return unwrap(() => api.get("/ebook/admin/storage"));
  },

  /**
   * Get admin audit logs
   */
  getAdminAuditLogs: (params = {}) => {
    return unwrap(() => api.get("/ebook/admin/audit-logs", { params }));
  },

  /**
   * Save workflow rules
   */
  saveWorkflowRules: (data) => {
    return unwrap(() => api.post("/ebook/admin/workflow-rules", data));
  },

  /**
   * Reindex search
   */
  reindexAdmin: () => {
    return unwrap(() => api.post("/ebook/admin/reindex"));
  },

  /**
   * Get all submissions (admin only)
   */
  getAllSubmissions: (params = {}) => {
    return unwrap(() => api.get("/ebook/admin/submissions", { params }));
  },

  // ==================== PAYMENT ORDERED FUNCTIONS ====================
  
  /**
   * Get submissions with payment_ordered status
   */
  getPaymentOrderedSubmissions: (params = {}) => {
    const queryParams = {
      limit: params.limit || 20,
      page: params.page || 1,
      status: 'payment_ordered',
      ...params
    };
    return unwrap(() => api.get("/ebook/my-submissions", { params: queryParams }));
  },

  /**
   * Get payment ordered count
   */
  getPaymentOrderedCount: async () => {
    try {
      const result = await ebookApi.listMySubmissions({ 
        status: 'payment_ordered', 
        limit: 1 
      });
      return result?.pagination?.total || 0;
    } catch (error) {
      console.error("Error getting payment ordered count:", error);
      return 0;
    }
  },

  /**
   * Update payment status to ordered
   */
  updatePaymentStatus: (submissionId, status) => {
    return unwrap(() => api.patch(`/ebook/submissions/${submissionId}/payment-status`, { status }));
  },

  // ==================== DASHBOARDS ====================
  
  /**
   * Get author dashboard (user's own data only)
   */
  getAuthorDashboard: async () => {
    try {
      const [submissions, stats, paymentOrdered] = await Promise.all([
        ebookApi.listMySubmissions({ limit: 100 }),
        unwrap(() => api.get("/ebook/dashboard/author-stats")).catch(() => ({ summary: {} })),
        ebookApi.getPaymentOrderedCount()
      ]);
      
      return {
        summary: {
          ...(stats?.summary || {}),
          paymentOrdered: paymentOrdered
        },
        submissions: submissions?.rows || []
      };
    } catch (error) {
      console.error("Error getting author dashboard:", error);
      return {
        summary: { paymentOrdered: 0 },
        submissions: []
      };
    }
  },

  /**
   * Get editor dashboard
   */
  getEditorDashboard: async () => {
    const [queue, stats] = await Promise.all([
      ebookApi.getEditorQueue({ limit: 100 }),
      unwrap(() => api.get("/ebook/dashboard/editor-stats")).catch(() => ({ summary: {} }))
    ]);
    return {
      summary: stats?.summary || {},
      submissions: queue?.rows || []
    };
  },

  /**
   * Get reviewer dashboard
   */
  getReviewerDashboard: async () => {
    const [assignments, stats] = await Promise.all([
      ebookApi.getReviewerAssignments({ limit: 100 }),
      unwrap(() => api.get("/ebook/dashboard/reviewer-stats")).catch(() => ({ summary: {} }))
    ]);
    return {
      summary: stats?.summary || {},
      assignments: assignments?.rows || []
    };
  },

  /**
   * Get finance dashboard
   */
  getFinanceDashboard: async () => {
    const [items, stats] = await Promise.all([
      ebookApi.getFinanceItems({ limit: 100 }),
      unwrap(() => api.get("/ebook/dashboard/finance-stats")).catch(() => ({ summary: {} }))
    ]);
    return {
      summary: stats?.summary || {},
      finances: items?.rows || []
    };
  },

  /**
   * Get production dashboard
   */
  getProductionDashboard: async () => {
    const [items, stats] = await Promise.all([
      ebookApi.getProductionItems({ limit: 100 }),
      unwrap(() => api.get("/ebook/dashboard/production-stats")).catch(() => ({ summary: {} }))
    ]);
    return {
      summary: stats?.summary || {},
      production: items?.rows || []
    };
  }
};

export default ebookApi;