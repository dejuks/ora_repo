import api from "./axios";

const unwrap = async (request) => {
  const response = await request();
  return response?.data;
};

const authorEbookApi = {
  getCurrentUser: () => {
    return unwrap(() => api.get("/ebook/auth/me"));
  },

  listMySubmissions: (params = {}) => {
    const queryParams = {
      limit: params.limit || 20,
      page: params.page || 1,
      status: params.status,
      stage: params.stage,
      search: params.search,
      ...params,
    };

    return unwrap(() =>
      api.get("/ebook/manuscripts/my-submissions", {
        params: queryParams,
      })
    );
  },

  getSubmission: (id) => {
    return unwrap(() => api.get(`/ebook/submissions/${id}`));
  },

  createSubmission: (data) => {
    return unwrap(() => api.post("/ebook/submissions", data));
  },

  updateSubmission: (id, data) => {
    return unwrap(() => api.put(`/ebook/submissions/${id}`, data));
  },

  submitSubmission: (id) => {
    return unwrap(() => api.post(`/ebook/submissions/${id}/submit`));
  },

  resubmitSubmission: (id, data) => {
    return unwrap(() => api.post(`/ebook/submissions/${id}/resubmit`, data));
  },

  uploadFile: (id, file, role = "manuscript") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("role", role);

    return unwrap(() =>
      api.post(`/ebook/submissions/${id}/files`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  },

  listFiles: (id) => {
    return unwrap(() => api.get(`/ebook/submissions/${id}/files`));
  },

  getWorkflow: (id) => {
    return unwrap(() => api.get(`/ebook/submissions/${id}/workflow`));
  },

  getReviewComments: (id) => {
    return unwrap(() =>
      api.get(`/ebook/submissions/${id}/review-comments`)
    );
  },

  submitPaymentProof: (submissionId, data) => {
    return unwrap(() =>
      api.post(`/ebook/submissions/${submissionId}/payment-proof`, data)
    );
  },

  requestWaiver: (submissionId, data) => {
    return unwrap(() =>
      api.post(`/ebook/submissions/${submissionId}/waiver`, data)
    );
  },

  getFinanceTransactions: (submissionId) => {
    return unwrap(() =>
      api.get(`/ebook/submissions/${submissionId}/transactions`)
    );
  },

  getInvoice: (submissionId) => {
    return unwrap(() =>
      api.get(`/ebook/submissions/${submissionId}/invoice`)
    );
  },

  approveProof: (submissionId, data) => {
    return unwrap(() =>
      api.post(`/ebook/submissions/${submissionId}/proof/approve`, data)
    );
  },

  getPaymentOrderedSubmissions: (params = {}) => {
    const queryParams = {
      limit: params.limit || 20,
      page: params.page || 1,
      status: "payment_ordered",
      ...params,
    };

    return unwrap(() =>
      api.get("/ebook/my-submissions", {
        params: queryParams,
      })
    );
  },

  getPaymentOrderedCount: async () => {
    try {
      const result = await authorEbookApi.listMySubmissions({
        status: "payment_ordered",
        limit: 1,
      });

      return result?.pagination?.total || 0;
    } catch (error) {
      console.error("Error getting payment ordered count:", error);
      return 0;
    }
  },

  updatePaymentStatus: (submissionId, status) => {
    return unwrap(() =>
      api.patch(`/ebook/submissions/${submissionId}/payment-status`, {
        status,
      })
    );
  },

  getAuthorDashboard: async () => {
    try {
      const [submissions, stats, paymentOrdered] = await Promise.all([
        authorEbookApi.listMySubmissions({ limit: 100 }),
        unwrap(() => api.get("/ebook/dashboard/author-stats")).catch(() => ({
          summary: {},
        })),
        authorEbookApi.getPaymentOrderedCount(),
      ]);

      return {
        summary: {
          ...(stats?.summary || {}),
          paymentOrdered,
        },
        submissions: submissions?.rows || submissions?.data || [],
      };
    } catch (error) {
      console.error("Error getting author dashboard:", error);

      return {
        summary: {
          paymentOrdered: 0,
        },
        submissions: [],
      };
    }
  },
};

export default authorEbookApi;