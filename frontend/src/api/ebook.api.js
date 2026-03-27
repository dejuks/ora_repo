import api from "./api";

const unwrap = async (request) => {
  const response = await request();
  return response?.data;
};

const toFormData = (payload = {}) => {
  const formData = new FormData();

  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null) {
          formData.append(`${key}[]`, item);
        }
      });
      return;
    }

    formData.append(key, value);
  });

  return formData;
};

const ebookApi = {
  /* =========================
     Dashboard / overview
  ========================= */
  getDashboard: () => unwrap(() => api.get("/ebook/dashboard")),
  getAuthorDashboard: () => unwrap(() => api.get("/ebook/dashboard/author")),
  getEditorDashboard: () => unwrap(() => api.get("/ebook/dashboard/editor")),
  getReviewerDashboard: () => unwrap(() => api.get("/ebook/dashboard/reviewer")),
  getFinanceDashboard: () => unwrap(() => api.get("/ebook/dashboard/finance")),
  getProductionDashboard: () => unwrap(() => api.get("/ebook/dashboard/production")),

  /* =========================
     Submission CRUD
  ========================= */
  listSubmissions: (params = {}) =>
    unwrap(() => api.get("/ebook/submissions", { params })),

  listMySubmissions: (params = {}) =>
    unwrap(() => api.get("/ebook/submissions/my", { params })),

  getSubmission: (id) =>
    unwrap(() => api.get(`/ebook/submissions/${id}`)),

  getWorkflow: (id) =>
    unwrap(() => api.get(`/ebook/submissions/${id}/workflow`)),

  createSubmission: (payload) =>
    unwrap(() => api.post("/ebook/submissions", payload)),

  updateSubmission: (id, payload) =>
    unwrap(() => api.put(`/ebook/submissions/${id}`, payload)),

  deleteSubmission: (id) =>
    unwrap(() => api.delete(`/ebook/submissions/${id}`)),

  saveDraft: (payload) =>
    unwrap(() => api.post("/ebook/submissions/draft", payload)),

  submitSubmission: (id) =>
    unwrap(() => api.post(`/ebook/submissions/${id}/submit`)),

  screening: (id, payload) =>
    unwrap(() => api.post(`/ebook/submissions/${id}/screening`, payload)),

  /* =========================
     Submission files
  ========================= */
  uploadFile: (id, file, file_role = "manuscript") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("file_role", file_role);

    return unwrap(() =>
      api.post(`/ebook/submissions/${id}/files`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  },

  listFiles: (id) =>
    unwrap(() => api.get(`/ebook/submissions/${id}/files`)),

  deleteFile: (id, fileId) =>
    unwrap(() => api.delete(`/ebook/submissions/${id}/files/${fileId}`)),

  /* =========================
     Editor queue / workflow
  ========================= */
  getEditorQueue: (params = {}) =>
    unwrap(() => api.get("/ebook/editor-queue", { params })),

  assignReviewer: (id, payload) =>
    unwrap(() => api.post(`/ebook/submissions/${id}/assign-reviewer`, payload)),

  reassignReviewer: (submissionId, payload) =>
    unwrap(() =>
      api.post(`/ebook/submissions/${submissionId}/reassign-reviewer`, payload)
    ),

  assignPreviousReviewersForRevision: (submissionId, payload) =>
    unwrap(() =>
      api.post(
        `/ebook/submissions/${submissionId}/assign-previous-reviewers`,
        payload
      )
    ),

  makeDecision: (id, payload) =>
    unwrap(() => api.post(`/ebook/submissions/${id}/decision`, payload)),

  /* =========================
     Reviewer options / assignments
  ========================= */
  listReviewerOptions: () =>
    unwrap(() => api.get("/ebook/reviewer-options")),

  listReviewAssignments: (params = {}) =>
    unwrap(() => api.get("/ebook/review-assignments", { params })),

  getReviewAssignment: (id) =>
    unwrap(() => api.get(`/ebook/review-assignments/${id}/detail`)),

  getReviewAssignmentFiles: (id) =>
    unwrap(() => api.get(`/ebook/review-assignments/${id}/files`)),

  removeReviewAssignment: (id) =>
    unwrap(() => api.delete(`/ebook/review-assignments/${id}`)),

  respondAssignment: (id, payload) =>
    unwrap(() => api.post(`/ebook/review-assignments/${id}/respond`, payload)),

  requestReviewExtension: (id, payload) =>
    unwrap(() => api.post(`/ebook/review-assignments/${id}/extension`, payload)),

  getReviewTemplate: () =>
    unwrap(() => api.get("/ebook/review-template")),

  submitReview: (id, payload = {}) => {
    const hasAttachments =
      Array.isArray(payload?.attachments) && payload.attachments.length > 0;

    if (!hasAttachments) {
      const { attachments, ...rest } = payload || {};
      return unwrap(() =>
        api.post(`/ebook/review-assignments/${id}/submit-review`, rest)
      );
    }

    const formData = new FormData();
    Object.entries(payload || {}).forEach(([key, value]) => {
      if (key === "attachments") return;
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    (payload.attachments || []).forEach((file) => {
      formData.append("attachments", file);
    });

    return unwrap(() =>
      api.post(`/ebook/review-assignments/${id}/submit-review`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  },

  updateReview: (id, payload) =>
    unwrap(() => api.put(`/ebook/review-assignments/${id}/review`, payload)),

  uploadReviewFile: (id, file) => {
    const formData = new FormData();
    formData.append("file", file);

    return unwrap(() =>
      api.post(`/ebook/review-assignments/${id}/files`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  },

  getReviewerReminders: (params = {}) =>
    unwrap(() => api.get("/ebook/reviewer-reminders", { params })),

  getReviewAssignmentDetail: (id) =>
    unwrap(() => api.get(`/ebook/review-assignments/${id}/detail`)),

  /* =========================
     Finance
  ========================= */
  listFinanceQueue: (params = {}) =>
    unwrap(() => api.get("/ebook/finance-queue", { params })),

  getFinanceRecord: (submissionId) =>
    unwrap(() => api.get(`/ebook/submissions/${submissionId}/finance`)),

  recordFinanceDecision: (submissionId, payload) =>
    unwrap(() => api.post(`/ebook/submissions/${submissionId}/finance`, payload)),

  getInvoice: (submissionId) =>
    unwrap(() => api.get(`/ebook/submissions/${submissionId}/finance`)),

  getFinanceTransactions: (submissionId) =>
    unwrap(() => api.get(`/ebook/submissions/${submissionId}/workflow`)),

  issueInvoice: (submissionId, payload = {}) =>
    unwrap(() =>
      api.post(`/ebook/submissions/${submissionId}/finance`, {
        action: "issue_invoice",
        ...payload,
      })
    ),

  approveWaiver: (submissionId, payload = {}) =>
    unwrap(() =>
      api.post(`/ebook/submissions/${submissionId}/finance`, {
        action: "approve_waiver",
        ...payload,
      })
    ),

  declineWaiver: (submissionId, payload = {}) =>
    unwrap(() =>
      api.post(`/ebook/submissions/${submissionId}/finance`, {
        action: "decline_waiver",
        ...payload,
      })
    ),

  verifyPayment: (submissionId, payload = {}) =>
    unwrap(() =>
      api.post(`/ebook/submissions/${submissionId}/finance`, {
        action: "verify_payment",
        ...payload,
      })
    ),

  rejectPayment: (submissionId, payload = {}) =>
    unwrap(() =>
      api.post(`/ebook/submissions/${submissionId}/finance`, {
        action: "reject_payment",
        ...payload,
      })
    ),

  /* =========================
     Production / DCM
  ========================= */
  listProductionQueue: (params = {}) =>
    unwrap(() => api.get("/ebook/production-queue", { params })),

  getProductionRecord: (submissionId) =>
    unwrap(() => api.get(`/ebook/submissions/${submissionId}/production`)),

  updateProduction: (submissionId, payload) =>
    unwrap(() => api.post(`/ebook/submissions/${submissionId}/production`, payload)),

  uploadProductionFile: (submissionId, file, file_role = "final") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("file_role", file_role);

    return unwrap(() =>
      api.post(`/ebook/submissions/${submissionId}/production/files`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  },

  /* =========================
     Publications / public reader
  ========================= */
  listPublications: (params = {}) =>
    unwrap(() => api.get("/ebook/publications", { params })),

  getPublication: (id) =>
    unwrap(() => api.get(`/ebook/publications/${id}`)),

  publishSubmission: (submissionId, payload = {}) =>
    unwrap(() => api.post(`/ebook/submissions/${submissionId}/publish`, payload)),

  /* =========================
     Utility / misc
  ========================= */
  downloadFile: async (url, filename) => {
    const response = await api.get(url, { responseType: "blob" });
    const blob = new Blob([response.data]);
    const href = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = filename || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(href);
    return true;
  },

  toFormData,
};

export default ebookApi;