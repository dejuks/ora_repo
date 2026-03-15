import api from './api';

export const getSystemSettings = () => api.get('/system/settings');
export const updateSystemSettings = (settings) => api.put('/system/settings', { settings });
export const getLibraryAuditLogs = (params = {}) => api.get('/library/audit-logs', { params });
export const getLibrarySecurityAlerts = () => api.get('/library/audit-logs/security-alerts');
