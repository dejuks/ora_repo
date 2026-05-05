
import api from './api.js';
export const getLibraryAuditLogs = (params = {}) =>
  api.get('/library/audit-logs', { params }).then((res) => res?.data?.data ?? res?.data ?? res);
export const getLibrarySecurityAlerts = (params = {}) =>
  api.get('/library/audit-logs/security-alerts', { params }).then((res) => res?.data?.data ?? res?.data ?? res);
