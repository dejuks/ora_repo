import api from "./api.js";

export const getMaterialTypes = () => api.get("/library/material-types");
export const createMaterialType = (data) => api.post("/library/material-types", data);
export const updateMaterialType = (id, data) => api.put(`/library/material-types/${id}`, data);
export const deleteMaterialType = (id) => api.delete(`/library/material-types/${id}`);

export const getLibraryCategories = () => api.get("/library/categories");
export const createLibraryCategory = (data) => api.post("/library/categories", data);
export const updateLibraryCategory = (id, data) => api.put(`/library/categories/${id}`, data);
export const deleteLibraryCategory = (id) => api.delete(`/library/categories/${id}`);

export const getPublishers = () => api.get("/library/publishers");
export const createPublisher = (data) => api.post("/library/publishers", data);
export const updatePublisher = (id, data) => api.put(`/library/publishers/${id}`, data);
export const deletePublisher = (id) => api.delete(`/library/publishers/${id}`);

export const getLanguages = () => api.get("/library/languages");
export const createLanguage = (data) => api.post("/library/languages", data);
export const updateLanguage = (id, data) => api.put(`/library/languages/${id}`, data);
export const deleteLanguage = (id) => api.delete(`/library/languages/${id}`);

export const getLibraryBranches = () => api.get("/library/branches");
export const createLibraryBranch = (data) => api.post("/library/branches", data);
export const updateLibraryBranch = (id, data) => api.put(`/library/branches/${id}`, data);
export const deleteLibraryBranch = (id) => api.delete(`/library/branches/${id}`);

export const getLibraryLocations = () => api.get("/library/locations");
export const createLibraryLocation = (data) => api.post("/library/locations", data);
export const updateLibraryLocation = (id, data) => api.put(`/library/locations/${id}`, data);
export const deleteLibraryLocation = (id) => api.delete(`/library/locations/${id}`);

export const getMemberTypes = () => api.get("/library/member-types");
export const createMemberType = (data) => api.post("/library/member-types", data);
export const updateMemberType = (id, data) => api.put(`/library/member-types/${id}`, data);
export const deleteMemberType = (id) => api.delete(`/library/member-types/${id}`);

export const getContributors = () => api.get("/library/contributors");
export const createContributor = (data) => api.post("/library/contributors", data);
export const updateContributor = (id, data) => api.put(`/library/contributors/${id}`, data);
export const deleteContributor = (id) => api.delete(`/library/contributors/${id}`);

export const getLibrarianDashboard = () => api.get("/library/dashboard/librarian");
export const getManagerDashboard = () => api.get("/library/dashboard/manager");
export const getCatalogerDashboard = () => api.get("/library/dashboard/cataloger");
export const getAdminDashboard = () => api.get("/library/dashboard/admin");

export const getDigitalCollections = () => api.get("/library/digital-collections");
export const createDigitalCollection = (data) => api.post("/library/digital-collections", data);
export const updateDigitalCollection = (id, data) => api.put(`/library/digital-collections/${id}`, data);
export const deleteDigitalCollection = (id) => api.delete(`/library/digital-collections/${id}`);

const toQuery = (params = {}) => {
  const clean = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "");
  return Object.fromEntries(clean);
};

export const libraryApi = {
  getMaterialTypes,
  createMaterialType,
  updateMaterialType,
  deleteMaterialType,
  getLibraryCategories,
  createLibraryCategory,
  updateLibraryCategory,
  deleteLibraryCategory,
  getPublishers,
  createPublisher,
  updatePublisher,
  deletePublisher,
  getLanguages,
  createLanguage,
  updateLanguage,
  deleteLanguage,
  getLibraryBranches,
  createLibraryBranch,
  updateLibraryBranch,
  deleteLibraryBranch,
  getLibraryLocations,
  createLibraryLocation,
  updateLibraryLocation,
  deleteLibraryLocation,
  getMemberTypes,
  createMemberType,
  updateMemberType,
  deleteMemberType,
  getContributors,
  createContributor,
  updateContributor,
  deleteContributor,
  getLibrarianDashboard,
  getManagerDashboard,
  getCatalogerDashboard,
  getAdminDashboard,

  getDigitalCollections,
  createDigitalCollection,
  updateDigitalCollection,
  deleteDigitalCollection,

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

  submitAcquisitionRequest: async (requestId) => {
    const { data } = await api.post(`/library/acquisition-requests/${requestId}/submit`);
    return data;
  },
  approveAcquisitionRequest: async (requestId) => {
    const { data } = await api.post(`/library/acquisition-requests/${requestId}/approve`);
    return data;
  },
  rejectAcquisitionRequest: async (requestId, payload) => {
    const { data } = await api.post(`/library/acquisition-requests/${requestId}/reject`, payload);
    return data;
  },
  markAcquisitionRequestOrdered: async (requestId) => {
    const { data } = await api.post(`/library/acquisition-requests/${requestId}/mark-ordered`);
    return data;
  },

  receivePurchaseOrder: async (purchaseOrderId, payload = {}) => {
    const { data } = await api.post(`/library/purchase-orders/${purchaseOrderId}/receive`, payload);
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




  searchCatalog: async (params = {}) => {
    const { data } = await api.get('/library/catalog/search', { params: toQuery(params) });
    return data;
  },
  getCatalogMaterial: async (materialId) => {
    const { data } = await api.get(`/library/catalog/${materialId}`);
    return data;
  },
  getCatalogAvailability: async (materialId) => {
    const { data } = await api.get(`/library/catalog/${materialId}/availability`);
    return data;
  },
  getSubmissionWorkflow: async (submissionId) => {
    const { data } = await api.get(`/library/digital-submissions/${submissionId}/workflow`);
    return data;
  },
  resubmitDigitalSubmission: async (submissionId, payload = {}) => {
    const { data } = await api.post(`/library/digital-submissions/${submissionId}/resubmit`, payload);
    return data;
  },
  getUploaderDashboard: async () => {
    const { data } = await api.get('/library/digital-submissions/uploader/dashboard');
    return data;
  },
  listPublisherPackages: async (params = {}) => {
    const { data } = await api.get('/publisher/packages', { params: toQuery(params) });
    return data;
  },
  createPublisherPackage: async (payload = {}) => {
    const form = new FormData();
    Object.entries(payload || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') form.append(key, value);
    });
    const { data } = await api.post('/publisher/packages', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    return data;
  },
  createPublisherResource: async (payload = {}) => {
    const form = new FormData();
    Object.entries(payload || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') form.append(key, value);
    });
    const { data } = await api.post('/publisher/resources', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    return data;
  },
  getUsageReport: async () => {
    const { data } = await api.get('/library/reports/usage');
    return data;
  },
  getLoansReport: async () => {
    const { data } = await api.get('/library/reports/loans');
    return data;
  },
  getCatalogClassificationSuggestion: async (materialId) => {
    const { data } = await api.get('/library/catalog-tools/classification/suggest', { params: { material_id: materialId } });
    return data;
  },
  applyCatalogClassification: async (materialId, payload) => {
    const { data } = await api.post(`/library/catalog-tools/materials/${materialId}/classify`, payload);
    return data;
  },
  generateCopyBarcode: async (copyId, payload = {}) => {
    const { data } = await api.post(`/library/catalog-tools/copies/${copyId}/generate-barcode`, payload);
    return data;
  },
  generateMissingCopyBarcodes: async (payload = {}) => {
    const { data } = await api.post('/library/catalog-tools/copies/generate-missing', payload);
    return data;
  },

  createInventoryAudit: async (payload = {}) => {
    const { data } = await api.post('/library/inventory/audit', payload);
    return data;
  },
  getInventoryReport: async () => {
    const { data } = await api.get('/library/inventory/report');
    return data;
  },
  getCirculationSummary: async () => {
    const { data } = await api.get('/library/circulation/summary');
    return data;
  },
  getMyCirculationOverview: async () => {
    const { data } = await api.get('/library/circulation/my/overview');
    return data;
  },
  getMemberCirculationOverview: async (memberId) => {
    const { data } = await api.get(`/library/circulation/member/${memberId}/overview`);
    return data;
  },

  getDigitalCollectionResources: async (collectionId) => {
    const { data } = await api.get(`/library/digital-collections/${collectionId}/resources`);
    return data;
  },
  addDigitalCollectionResource: async (collectionId, payload) => {
    const { data } = await api.post(`/library/digital-collections/${collectionId}/resources`, payload);
    return data;
  },
  removeDigitalCollectionResource: async (collectionId, resourceId) => {
    const { data } = await api.delete(`/library/digital-collections/${collectionId}/resources/${resourceId}`);
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
  uploadSubmissionFile: async (submissionId, file, fileRole = 'main') => {
    const form = new FormData();
    form.append('file', file);
    form.append('file_role', fileRole);
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
