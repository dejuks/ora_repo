import api from './api.js';

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;
const rowsWrap = (response) => {
  const data = unwrap(response);
  if (Array.isArray(data)) return { rows: data };
  if (Array.isArray(data?.rows)) return { rows: data.rows, meta: data.meta };
  if (Array.isArray(data?.data)) return { rows: data.data, meta: data.meta };
  return data;
};

const RESOURCE_PATH = (resource) => `/library/portal/resources/${resource}`;

const libraryApi = {
  list: async (resource, params = {}) => rowsWrap(await api.get(RESOURCE_PATH(resource), { params })),
  create: async (resource, payload) => unwrap(await api.post(RESOURCE_PATH(resource), payload)),
  update: async (resource, id, payload) => unwrap(await api.patch(`${RESOURCE_PATH(resource)}/${id}`, payload)),
  remove: async (resource, id) => unwrap(await api.delete(`${RESOURCE_PATH(resource)}/${id}`)),

  getCirculationSummary: async () => unwrap(await api.get('/library/portal/librarian/summary')),
  getReportSummary: async () => unwrap(await api.get('/library/portal/admin/dashboard')),
  getMyCirculationOverview: async () => unwrap(await api.get('/library/portal/member/overview')),

  searchCatalog: async (params = {}) => rowsWrap(await api.get('/library/physical-library', { params })),

  borrowLoan: async (payload) => unwrap(await api.post('/library/physical-library/borrow', payload)),
  returnLoan: async (loanId) => unwrap(await api.post('/library/physical-library/return', { loan_id: loanId })),
  renewLoan: async (loanId, payload = {}) => unwrap(await api.post('/library/physical-library/renew', { loan_id: loanId, ...payload })),

  createHold: async (payload) => unwrap(await api.post('/library/physical-library/holds', payload)),
  cancelHold: async (holdId, payload = {}) => unwrap(await api.patch(`/library/physical-library/holds/${holdId}/cancel`, payload)),
  fulfillHold: async (holdId, payload = {}) => unwrap(await api.patch(`/library/portal/holds/${holdId}/fulfill`, payload)),

  createFine: async (payload) => unwrap(await api.post('/library/physical-library/fines', payload)),
  payFine: async (fineId, payload) => unwrap(await api.post(`/library/portal/fines/${fineId}/pay`, payload)),

  addCopy: async (materialId, payload) => unwrap(await api.post(`/library/physical-library/${materialId}/copies`, payload)),
  updateCopy: async (copyId, payload) => unwrap(await api.patch(`/library/physical-library/copies/${copyId}`, payload)),
  removeCopy: async (copyId) => unwrap(await api.delete(`/library/physical-library/copies/${copyId}`)),
  markCopyMissing: async (copyId, payload = {}) => unwrap(await api.patch(`/library/physical-library/copies/${copyId}/missing`, payload)),
  markCopyDamaged: async (copyId, payload = {}) => unwrap(await api.patch(`/library/physical-library/copies/${copyId}/damaged`, payload)),

  getAdminDashboard: async () => unwrap(await api.get('/library/portal/admin/dashboard')),
};

export const getMaterialTypes = () => libraryApi.list('material-types');
export const createMaterialType = (data) => libraryApi.create('material-types', data);
export const updateMaterialType = (id, data) => libraryApi.update('material-types', id, data);
export const deleteMaterialType = (id) => libraryApi.remove('material-types', id);

export const getLibraryCategories = () => libraryApi.list('categories');
export const createLibraryCategory = (data) => libraryApi.create('categories', data);
export const updateLibraryCategory = (id, data) => libraryApi.update('categories', id, data);
export const deleteLibraryCategory = (id) => libraryApi.remove('categories', id);

export const getPublishers = () => libraryApi.list('publishers');
export const createPublisher = (data) => libraryApi.create('publishers', data);
export const updatePublisher = (id, data) => libraryApi.update('publishers', id, data);
export const deletePublisher = (id) => libraryApi.remove('publishers', id);

export const getLanguages = () => libraryApi.list('languages');
export const createLanguage = (data) => libraryApi.create('languages', data);
export const updateLanguage = (id, data) => libraryApi.update('languages', id, data);
export const deleteLanguage = (id) => libraryApi.remove('languages', id);

export const getLibraryBranches = () => libraryApi.list('branches');
export const createLibraryBranch = (data) => libraryApi.create('branches', data);
export const updateLibraryBranch = (id, data) => libraryApi.update('branches', id, data);
export const deleteLibraryBranch = (id) => libraryApi.remove('branches', id);

export const getLibraryLocations = () => libraryApi.list('locations');
export const createLibraryLocation = (data) => libraryApi.create('locations', data);
export const updateLibraryLocation = (id, data) => libraryApi.update('locations', id, data);
export const deleteLibraryLocation = (id) => libraryApi.remove('locations', id);

export const getMemberTypes = () => libraryApi.list('member-types');
export const createMemberType = (data) => libraryApi.create('member-types', data);
export const updateMemberType = (id, data) => libraryApi.update('member-types', id, data);
export const deleteMemberType = (id) => libraryApi.remove('member-types', id);

export const getContributors = () => libraryApi.list('contributors');
export const createContributor = (data) => libraryApi.create('contributors', data);
export const updateContributor = (id, data) => libraryApi.update('contributors', id, data);
export const deleteContributor = (id) => libraryApi.remove('contributors', id);

export const getLibrarySubjects = () => libraryApi.list('subjects');
export const createLibrarySubject = (data) => libraryApi.create('subjects', data);
export const updateLibrarySubject = (id, data) => libraryApi.update('subjects', id, data);
export const deleteLibrarySubject = (id) => libraryApi.remove('subjects', id);

export const getLibrarianDashboard = () => libraryApi.getCirculationSummary();
export const getManagerDashboard = () => libraryApi.getReportSummary();
export const getCatalogerDashboard = () => libraryApi.getReportSummary();
export const getAdminDashboard = () => libraryApi.getAdminDashboard();

export const getDigitalCollections = () => libraryApi.list('digital-collections');
export const createDigitalCollection = (data) => libraryApi.create('digital-collections', data);
export const updateDigitalCollection = (id, data) => libraryApi.update('digital-collections', id, data);
export const deleteDigitalCollection = (id) => libraryApi.remove('digital-collections', id);

export { libraryApi };
export default libraryApi;
