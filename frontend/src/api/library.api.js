
import api from './api.js';

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;
const rowsWrap = (response) => {
  const data = unwrap(response);
  if (Array.isArray(data)) return { rows: data };
  if (Array.isArray(data?.rows)) return { rows: data.rows, meta: data.meta };
  if (Array.isArray(data?.data)) return { rows: data.data, meta: data.meta };
  return data;
};

const request = async (configs) => {
  let lastError;
  for (const config of configs) {
    try {
      return await api.request(config);
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      if (status && status !== 404) throw error;
    }
  }
  throw lastError;
};

const resourcePaths = (resource) => [
  `/library/resources/${resource}`,
  `/library/portal/resources/${resource}`,
  `/library/portal/crud/${resource}`,
];

const resourceRequest = async (method, resource, suffix = '', data, params) => {
  const configs = resourcePaths(resource).map((url) => ({ method, url: `${url}${suffix}`, data, params }));
  return request(configs);
};

const summaryRequest = async (paths) => request(paths.map((url) => ({ method: 'get', url })));

const libraryApi = {
  list: async (resource, params = {}) => rowsWrap(await resourceRequest('get', resource, '', undefined, params)),
  get: async (resource, id) => unwrap(await resourceRequest('get', resource, `/${id}`)),
  create: async (resource, payload) => unwrap(await resourceRequest('post', resource, '', payload)),
  update: async (resource, id, payload) => unwrap(await request([
    { method: 'patch', url: `/library/resources/${resource}/${id}`, data: payload },
    { method: 'patch', url: `/library/portal/resources/${resource}/${id}`, data: payload },
    { method: 'put', url: `/library/resources/${resource}/${id}`, data: payload },
    { method: 'put', url: `/library/portal/resources/${resource}/${id}`, data: payload },
    { method: 'patch', url: `/library/portal/crud/${resource}/${id}`, data: payload },
    { method: 'put', url: `/library/portal/crud/${resource}/${id}`, data: payload },
  ])),
  remove: async (resource, id) => unwrap(await resourceRequest('delete', resource, `/${id}`)),

  getCirculationSummary: async () => unwrap(await summaryRequest(['/library/librarian/summary', '/library/portal/librarian/summary', '/library/portal/summary/librarian'])),
  getReportSummary: async () => unwrap(await summaryRequest(['/library/admin/dashboard', '/library/portal/admin/dashboard', '/library/portal/dashboard/admin'])),
  getMyCirculationOverview: async () => unwrap(await summaryRequest(['/library/member/overview', '/library/portal/member/overview', '/library/portal/overview/member'])),
  getOverdueLoans: async () => unwrap(await summaryRequest(['/library/reports/overdue-loans', '/library/portal/reports/overdue-loans', '/library/portal/overdue-loans'])),

  searchCatalog: async (params = {}) => rowsWrap(await request([
    { method: 'get', url: '/library/resources/materials', params },
    { method: 'get', url: '/library/portal/resources/materials', params },
    { method: 'get', url: '/library/physical-library', params },
  ])),

  borrowLoan: async (payload) => unwrap(await request([
    { method: 'post', url: '/library/physical-library/borrow', data: payload },
  ])),
  returnLoan: async (loanId) => unwrap(await request([{ method: 'post', url: '/library/physical-library/return', data: { loan_id: loanId } }])),
  renewLoan: async (loanId, payload = {}) => unwrap(await request([{ method: 'post', url: '/library/physical-library/renew', data: { loan_id: loanId, ...payload } }])),

  createHold: async (payload) => unwrap(await request([{ method: 'post', url: '/library/physical-library/holds', data: payload }])),
  cancelHold: async (holdId, payload = {}) => unwrap(await request([{ method: 'patch', url: `/library/physical-library/holds/${holdId}/cancel`, data: payload }])),
  fulfillHold: async (holdId, payload = {}) => unwrap(await request([
    { method: 'patch', url: `/library/holds/${holdId}/fulfill`, data: payload },
    { method: 'patch', url: `/library/portal/holds/${holdId}/fulfill`, data: payload },
    { method: 'patch', url: `/library/portal/hold-requests/${holdId}/fulfill`, data: payload },
  ])),

  createFine: async (payload) => unwrap(await request([{ method: 'post', url: '/library/physical-library/fines', data: payload }])),
  payFine: async (fineId, payload) => unwrap(await request([
    { method: 'post', url: `/library/fines/${fineId}/pay`, data: payload },
    { method: 'post', url: `/library/portal/fines/${fineId}/pay`, data: payload },
    { method: 'post', url: `/library/portal/fine-payments/${fineId}/pay`, data: payload },
  ])),

  addCopy: async (materialId, payload) => unwrap(await request([{ method: 'post', url: `/library/physical-library/${materialId}/copies`, data: payload }])),
  updateCopy: async (copyId, payload) => unwrap(await request([{ method: 'patch', url: `/library/physical-library/copies/${copyId}`, data: payload }])),
  removeCopy: async (copyId) => unwrap(await request([{ method: 'delete', url: `/library/physical-library/copies/${copyId}` }])),
  markCopyMissing: async (copyId, payload = {}) => unwrap(await request([{ method: 'patch', url: `/library/physical-library/copies/${copyId}/missing`, data: payload }])),
  markCopyDamaged: async (copyId, payload = {}) => unwrap(await request([{ method: 'patch', url: `/library/physical-library/copies/${copyId}/damaged`, data: payload }])),

  getAdminDashboard: async () => unwrap(await summaryRequest(['/library/admin/dashboard', '/library/portal/admin/dashboard'])),
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
