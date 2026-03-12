import api from "./api";

/* =========================
   MATERIAL TYPES
========================= */
export const getMaterialTypes = () => api.get("/library/material-types");
export const createMaterialType = (data) => api.post("/library/material-types", data);
export const updateMaterialType = (id, data) => api.put(`/library/material-types/${id}`, data);
export const deleteMaterialType = (id) => api.delete(`/library/material-types/${id}`);

/* =========================
   CATEGORIES
========================= */
export const getLibraryCategories = () => api.get("/library/categories");
export const createLibraryCategory = (data) => api.post("/library/categories", data);
export const updateLibraryCategory = (id, data) => api.put(`/library/categories/${id}`, data);
export const deleteLibraryCategory = (id) => api.delete(`/library/categories/${id}`);

/* =========================
   PUBLISHERS
========================= */
export const getPublishers = () => api.get("/library/publishers");
export const createPublisher = (data) => api.post("/library/publishers", data);
export const updatePublisher = (id, data) => api.put(`/library/publishers/${id}`, data);
export const deletePublisher = (id) => api.delete(`/library/publishers/${id}`);

/* =========================
   LANGUAGES
========================= */
export const getLanguages = () => api.get("/library/languages");
export const createLanguage = (data) => api.post("/library/languages", data);
export const updateLanguage = (id, data) => api.put(`/library/languages/${id}`, data);
export const deleteLanguage = (id) => api.delete(`/library/languages/${id}`);
const toQuery = (params = {}) => {
  const clean = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "");
  return Object.fromEntries(clean);
};

export const libraryApi = {
  list: async (resource, params = {}) => {
    const { data } = await api.get(`/library/${resource}`, { params: toQuery({ limit: 200, ...params }) });
    return data;
  },
  get: async (resource, id) => {
    const { data } = await api.get(`/library/${resource}/${id}`);
    return data;
  },
  create: async (resource, payload) => {
    const { data } = await api.post(`/library/${resource}`, payload);
    return data;
  },
  update: async (resource, id, payload) => {
    const { data } = await api.put(`/library/${resource}/${id}`, payload);
    return data;
  },
  remove: async (resource, id) => {
    const { data } = await api.delete(`/library/${resource}/${id}`);
    return data;
  },
  borrowLoan: async (payload) => {
    const { data } = await api.post('/library/loans/borrow', payload);
    return data;
  },
  returnLoan: async (loanId, payload = {}) => {
    const { data } = await api.post(`/library/loans/${loanId}/return`, payload);
    return data;
  },
  renewLoan: async (loanId, payload = {}) => {
    const { data } = await api.post(`/library/loans/${loanId}/renew`, payload);
    return data;
  },
  createHold: async (payload) => {
    const { data } = await api.post('/library/holds', payload);
    return data;
  },
  cancelHold: async (holdId, payload = {}) => {
    const { data } = await api.post(`/library/holds/${holdId}/cancel`, payload);
    return data;
  },
  fulfillHold: async (holdId, payload = {}) => {
    const { data } = await api.post(`/library/holds/${holdId}/fulfill`, payload);
    return data;
  },
  payFine: async (fineId, payload) => {
    const { data } = await api.post(`/library/fines/${fineId}/pay`, payload);
    return data;
  },
  waiveFine: async (fineId, payload) => {
    const { data } = await api.post(`/library/fines/${fineId}/waive`, payload);
    return data;
  },
  submitDigitalSubmission: async (submissionId) => {
    const { data } = await api.post(`/library/digital-submissions/${submissionId}/submit`);
    return data;
  },
  reviewDigitalSubmission: async (submissionId, payload) => {
    const { data } = await api.post(`/library/digital-submissions/${submissionId}/review`, payload);
    return data;
  },
  publishDigitalSubmission: async (submissionId) => {
    const { data } = await api.post(`/library/digital-submissions/${submissionId}/publish`);
    return data;
  },
  accessDigitalResource: async (resourceId) => {
    const { data } = await api.get(`/library/digital-resources/${resourceId}/access`);
    return data;
  },
  getReportSummary: async () => {
    const { data } = await api.get('/library/reports/summary');
    return data;
  },
  getOverdueLoans: async () => {
    const { data } = await api.get('/library/reports/overdue-loans');
    return data;
  },
  uploadSubmissionFile: async (submissionId, file) => {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post(`/library/digital-submission-files/upload/${submissionId}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  uploadResourceFile: async (resourceId, file) => {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post(`/library/digital-resource-files/upload/${resourceId}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },


  
};

export default libraryApi;
