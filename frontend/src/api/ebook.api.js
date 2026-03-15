import api from "./api";

const unwrap = async (request) => {
  const res = await request();
  return res?.data ?? res;
};

const ebookApi = {
  listSubmissions: (params = {}) => unwrap(() => api.get('/ebook/submissions', { params })),
  getSubmission: (id) => unwrap(() => api.get(`/ebook/submissions/${id}`)),
  getWorkflow: (id) => unwrap(() => api.get(`/ebook/submissions/${id}/workflow`)),
  createSubmission: (payload) => {
    const hasFile = payload?.file instanceof File;
    if (hasFile) {
      const formData = new FormData();
      Object.entries(payload || {}).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        if (key === 'keywords' && Array.isArray(value)) {
          formData.append(key, value.join(', '));
          return;
        }
        if (key === 'file') {
          formData.append('file', value);
          return;
        }
        formData.append(key, value);
      });
      if (!formData.get('file_role')) formData.append('file_role', 'manuscript');
      return unwrap(() => api.post('/ebook/submissions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }));
    }
    return unwrap(() => api.post('/ebook/submissions', payload));
  },
  updateSubmission: (id, payload) => unwrap(() => api.put(`/ebook/submissions/${id}`, payload)),
  submitSubmission: (id) => unwrap(() => api.post(`/ebook/submissions/${id}/submit`)),
  resubmitSubmission: (id, payload) => unwrap(() => api.post(`/ebook/submissions/${id}/resubmit`, payload)),
  screening: (id, payload) => unwrap(() => api.post(`/ebook/submissions/${id}/screening`, payload)),
  assignReviewer: (id, payload) => unwrap(() => api.post(`/ebook/submissions/${id}/assign-reviewer`, payload)),
  makeDecision: (id, payload) => {
    const normalized = { ...payload, decision: String(payload?.decision || '').trim().toLowerCase().replace(/\s+/g, '_') };
    return unwrap(() => api.post(`/ebook/submissions/${id}/decision`, normalized));
  },
  upsertFinance: (id, payload) => unwrap(() => api.post(`/ebook/submissions/${id}/finance`, payload)),
  upsertProduction: (id, payload) => unwrap(() => api.post(`/ebook/submissions/${id}/production`, payload)),
  publishSubmission: (id, payload) => unwrap(() => api.post(`/ebook/submissions/${id}/publish`, payload)),
  uploadFile: async (id, file, fileRole = 'manuscript') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_role', fileRole);
    const res = await api.post(`/ebook/submissions/${id}/files/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  getAuthorDashboard: () => unwrap(() => api.get('/ebook/dashboard/author')),
  getEditorDashboard: () => unwrap(() => api.get('/ebook/dashboard/editor')),
  getReviewerDashboard: () => unwrap(() => api.get('/ebook/dashboard/reviewer')),
  getFinanceDashboard: () => unwrap(() => api.get('/ebook/dashboard/finance')),
  getProductionDashboard: () => unwrap(() => api.get('/ebook/dashboard/production')),
  getReviewerOptions: (params = {}) => unwrap(() => api.get('/ebook/reviewer-options', { params })),
  listReviewAssignments: () => unwrap(() => api.get('/ebook/review-assignments')),
  respondAssignment: (id, payload) => unwrap(() => api.post(`/ebook/review-assignments/${id}/respond`, payload)),
  submitReview: (id, payload) => unwrap(() => api.post(`/ebook/review-assignments/${id}/submit-review`, payload)),
  listPublications: (params = {}) => unwrap(() => api.get('/ebook/publications', { params })),
  listPublicCatalog: (params = {}) => unwrap(() => api.get('/ebook-public/publications', { params })),
  getPublicPublication: (slug) => unwrap(() => api.get(`/ebook-public/publications/${slug}`)),
};

export default ebookApi;
