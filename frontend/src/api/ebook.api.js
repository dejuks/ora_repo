import api from "./api";

const unwrap = async (request) => {
  try {
    const res = await request();
    return res?.data ?? res;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

const toFormData = (payload = {}) => {
  const formData = new FormData();
  const excludedKeys = [
    "file",
    "payment_proof",
    "receipt_file",
    "manuscript",
    "manuscript_file",
    "attachments",
  ];

  Object.entries(payload || {}).forEach(([key, value]) => {
    if (excludedKeys.includes(key)) return;
    if (value === undefined || value === null || value === "") return;

    if (Array.isArray(value)) {
      if (key === "keywords") {
        formData.append(key, value.join(", "));
      } else {
        formData.append(key, JSON.stringify(value));
      }
      return;
    }

    if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
};

const ebookApi = {
  listSubmissions: (params = {}) => unwrap(() => api.get("/ebook/submissions", { params })),
  listMySubmissions: (params = {}) => unwrap(() => api.get("/ebook/submissions-mine", { params })),
  getSubmission: (id) => unwrap(() => api.get(`/ebook/submissions/${id}`)),
  getWorkflow: (id) => unwrap(() => api.get(`/ebook/submissions/${id}/workflow`)),

  createSubmission: (payload) => {
    if (payload instanceof FormData) {
      return unwrap(() =>
        api.post("/ebook/submissions", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      );
    }

    const hasFile = payload?.file instanceof File;

    if (hasFile) {
      const formData = toFormData(payload);
      formData.append("file", payload.file);

      if (payload.file_role && !formData.has("file_role")) {
        formData.append("file_role", payload.file_role);
      } else if (!formData.has("file_role")) {
        formData.append("file_role", "manuscript");
      }

      return unwrap(() =>
        api.post("/ebook/submissions", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      );
    }

    return unwrap(() => api.post("/ebook/submissions", payload));
  },

  updateSubmission: (id, payload) => unwrap(() => api.put(`/ebook/submissions/${id}`, payload)),
  submitSubmission: (id) => unwrap(() => api.post(`/ebook/submissions/${id}/submit`)),
  resubmitSubmission: (id, payload) => unwrap(() => api.post(`/ebook/submissions/${id}/resubmit`, payload)),
  screening: (id, payload) => unwrap(() => api.post(`/ebook/submissions/${id}/screening`, payload)),
  assignReviewer: (id, payload) => unwrap(() => api.post(`/ebook/submissions/${id}/assign-reviewer`, payload)),

  makeDecision: (id, payload) =>
    unwrap(() =>
      api.post(`/ebook/submissions/${id}/decision`, {
        decision: String(payload?.decision || "").trim().toLowerCase().replace(/\s+/g, "_"),
        note: payload?.note || "",
      })
    ),

  upsertFinance: (id, payload) => unwrap(() => api.post(`/ebook/submissions/${id}/finance`, payload)),
  upsertProduction: (id, payload) => unwrap(() => api.post(`/ebook/submissions/${id}/production`, payload)),
  publishSubmission: (id, payload) => unwrap(() => api.post(`/ebook/submissions/${id}/publish`, payload)),

  uploadFile: async (id, file, fileRole = "manuscript") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("file_role", fileRole);
    const res = await api.post(`/ebook/submissions/${id}/files/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  requestWaiver: (id, payload) => unwrap(() => api.post(`/ebook/submissions/${id}/request-waiver`, payload)),
  approveWaiver: (id, payload) => unwrap(() => api.post(`/ebook/submissions/${id}/approve-waiver`, payload)),
  declineWaiver: (id, payload) => unwrap(() => api.post(`/ebook/submissions/${id}/decline-waiver`, payload)),
  issueInvoice: (id, payload) => unwrap(() => api.post(`/ebook/submissions/${id}/issue-invoice`, payload)),
  verifyPayment: (id, payload) => unwrap(() => api.post(`/ebook/submissions/${id}/verify-payment`, payload)),
  rejectPayment: (id, payload) => unwrap(() => api.post(`/ebook/submissions/${id}/reject-payment`, payload)),

  submitPaymentProof: (id, payload = {}) => {
    const formData = toFormData(payload);
    if (payload?.file) formData.append("file", payload.file);
    else if (payload?.payment_proof) formData.append("payment_proof", payload.payment_proof);

    return unwrap(() =>
      api.post(`/ebook/submissions/${id}/payment-proof`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  },

  getInvoice: (id) => unwrap(() => api.get(`/ebook/submissions/${id}/invoice`)),
  getReceipt: (id) => unwrap(() => api.get(`/ebook/submissions/${id}/receipt`)),
  getFinanceTransactions: (id) => unwrap(() => api.get(`/ebook/submissions/${id}/finance-transactions`)),
  approveProof: (id, payload) => unwrap(() => api.post(`/ebook/submissions/${id}/approve-proof`, payload)),
  getReviewComments: (id) => unwrap(() => api.get(`/ebook/submissions/${id}/review-comments`)),

  getAuthorDashboard: () => unwrap(() => api.get("/ebook/dashboard/author")),
  getEditorDashboard: () => unwrap(() => api.get("/ebook/dashboard/editor")),
  getReviewerDashboard: () => unwrap(() => api.get("/ebook/dashboard/reviewer")),
  getFinanceDashboard: () => unwrap(() => api.get("/ebook/dashboard/finance")),
  getProductionDashboard: () => unwrap(() => api.get("/ebook/dashboard/production")),

  getReviewerOptions: () => unwrap(() => api.get("/ebook/reviewer-options")),
  listReviewerOptions: () => unwrap(() => api.get("/ebook/reviewer-options")),
  listReviewAssignments: () => unwrap(() => api.get("/ebook/review-assignments")),
  getReviewAssignment: (id) => unwrap(() => api.get(`/ebook/review-assignments/${id}/detail`)),
  getReviewAssignmentFiles: (id) => unwrap(() => api.get(`/ebook/review-assignments/${id}/files`)),
  getReviewTemplate: () => unwrap(() => api.get("/ebook/review-template")),
  respondAssignment: (id, payload) => unwrap(() => api.post(`/ebook/review-assignments/${id}/respond`, payload)),

  submitReview: (id, payload = {}) => {
    const hasAttachments = Array.isArray(payload?.attachments) && payload.attachments.length > 0;

    if (!hasAttachments) {
      const { attachments, ...rest } = payload || {};
      return unwrap(() => api.post(`/ebook/review-assignments/${id}/submit-review`, rest));
    }

    const formData = toFormData(payload);
    (payload.attachments || []).forEach((file) => {
      formData.append("attachments", file);
    });

    return unwrap(() =>
      api.post(`/ebook/review-assignments/${id}/submit-review`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  },

  updateReview: (id, payload) => unwrap(() => api.put(`/ebook/review-assignments/${id}/review`, payload)),
  requestReviewExtension: (id, payload) => unwrap(() => api.post(`/ebook/review-assignments/${id}/extension`, payload)),

  uploadReviewFile: (id, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return unwrap(() =>
      api.post(`/ebook/review-assignments/${id}/files`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  },

  getReviewerReminders: (params = {}) => unwrap(() => api.get("/ebook/reviewer-reminders", { params })),
  removeReviewAssignment: (id) => unwrap(() => api.delete(`/ebook/review-assignments/${id}`)),
  reassignReviewer: (submissionId, payload) =>
    unwrap(() => api.post(`/ebook/submissions/${submissionId}/reassign-reviewer`, payload)),

  getEditorQueue: (params = {}) => unwrap(() => api.get("/ebook/editor-queue", { params })),
  approveForProduction: (id, payload) => unwrap(() => api.post(`/ebook/submissions/${id}/approve-production`, payload)),
  notifyAuthor: (id, payload) => unwrap(() => api.post(`/ebook/submissions/${id}/notify-author`, payload)),
  addEditorComment: (id, payload) => unwrap(() => api.post(`/ebook/submissions/${id}/editor-comment`, payload)),

  listPublications: (params = {}) => unwrap(() => api.get("/ebook/publications", { params })),
  listPublicCatalog: (params = {}) => unwrap(() => api.get("/ebook-public/publications", { params })),
  getPublicPublication: (slug) => unwrap(() => api.get(`/ebook-public/publications/${slug}`)),
  downloadPublicPublication: async (slug) =>
    api.get(`/ebook-public/publications/${slug}/download`, { responseType: "blob" }),
  getPublicCitation: (slug) => unwrap(() => api.get(`/ebook-public/publications/${slug}/citation`)),
  logPublicDownload: (slug) => unwrap(() => api.post(`/ebook-public/publications/${slug}/log-download`)),
  getPublicSearchSuggestions: (params = {}) =>
    unwrap(() => api.get("/ebook-public/search/suggestions", { params })),

  getAdminAuditLogs: (params = {}) => unwrap(() => api.get("/ebook/admin/audit-logs", { params })),
  getAdminStorage: () => unwrap(() => api.get("/ebook/admin/storage")),
  getAdminHealth: () => unwrap(() => api.get("/ebook/admin/health")),
  saveWorkflowRules: (payload) => unwrap(() => api.post("/ebook/admin/workflow-rules", payload)),
  reindexAdmin: () => unwrap(() => api.post("/ebook/admin/reindex")),
};

export default ebookApi;