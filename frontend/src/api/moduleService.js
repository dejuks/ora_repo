// src/services/moduleService.js

const API_URL = "http://localhost:5000/api/modules";

// Get token from localStorage
const getToken = () => localStorage.getItem("token");

// Build headers with token
const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken() || ""}`,
});

// Helper function to handle fetch responses
const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = data.message || res.statusText || "API request failed";
    throw new Error(error);
  }
  return data;
};

// --- MODULE API METHODS ---
export const moduleService = {
  // Get all modules
  getAllModules: async () => {
    const res = await fetch(API_URL, { 
      headers: getHeaders() 
    });
    return handleResponse(res);
  },

  // Get active modules
  getActiveModules: async () => {
    const res = await fetch(`${API_URL}?status=active`, { 
      headers: getHeaders() 
    });
    return handleResponse(res);
  },

  // Get single module by ID
  getModule: async (moduleId) => {
    const res = await fetch(`${API_URL}/${moduleId}`, { 
      headers: getHeaders() 
    });
    return handleResponse(res);
  },

  // Get module by name
  getModuleByName: async (name) => {
    const res = await fetch(`${API_URL}/name/${encodeURIComponent(name)}`, { 
      headers: getHeaders() 
    });
    return handleResponse(res);
  },

  // Create new module
  createModule: async (moduleData) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(moduleData),
    });
    return handleResponse(res);
  },

  // Update module
  updateModule: async (moduleId, moduleData) => {
    const res = await fetch(`${API_URL}/${moduleId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(moduleData),
    });
    return handleResponse(res);
  },

  // Delete module
  deleteModule: async (moduleId) => {
    const res = await fetch(`${API_URL}/${moduleId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Perform module action
  performAction: async (moduleId, action, data = {}) => {
    const res = await fetch(`${API_URL}/${moduleId}/actions`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ action, ...data }),
    });
    return handleResponse(res);
  },

  // Get module settings
  getModuleSettings: async (moduleId) => {
    const res = await fetch(`${API_URL}/${moduleId}/settings`, { 
      headers: getHeaders() 
    });
    return handleResponse(res);
  },

  // Update module settings
  updateModuleSettings: async (moduleId, settings) => {
    const res = await fetch(`${API_URL}/${moduleId}/settings`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(settings),
    });
    return handleResponse(res);
  },

  // Toggle module status (activate/deactivate)
  toggleModuleStatus: async (moduleId) => {
    const res = await fetch(`${API_URL}/${moduleId}/toggle`, {
      method: "POST",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Get module statistics
  getModuleStats: async (moduleId, period = 'month') => {
    const res = await fetch(`${API_URL}/${moduleId}/stats?period=${period}`, { 
      headers: getHeaders() 
    });
    return handleResponse(res);
  },

  // Get module permissions
  getModulePermissions: async (moduleId) => {
    const res = await fetch(`${API_URL}/${moduleId}/permissions`, { 
      headers: getHeaders() 
    });
    return handleResponse(res);
  },

  // Update module permissions
  updateModulePermissions: async (moduleId, permissions) => {
    const res = await fetch(`${API_URL}/${moduleId}/permissions`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ permissions }),
    });
    return handleResponse(res);
  },

  // Get module audit logs
  getModuleAuditLogs: async (moduleId, limit = 50) => {
    const res = await fetch(`${API_URL}/${moduleId}/audit-logs?limit=${limit}`, { 
      headers: getHeaders() 
    });
    return handleResponse(res);
  },

  // Backup module data
  backupModule: async (moduleId) => {
    const res = await fetch(`${API_URL}/${moduleId}/backup`, {
      method: "POST",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Restore module from backup
  restoreModule: async (moduleId, backupId) => {
    const res = await fetch(`${API_URL}/${moduleId}/restore/${backupId}`, {
      method: "POST",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Get module dependencies
  getModuleDependencies: async (moduleId) => {
    const res = await fetch(`${API_URL}/${moduleId}/dependencies`, { 
      headers: getHeaders() 
    });
    return handleResponse(res);
  },

  // Check module health
  checkModuleHealth: async (moduleId) => {
    const res = await fetch(`${API_URL}/${moduleId}/health`, { 
      headers: getHeaders() 
    });
    return handleResponse(res);
  },

  // Get module version info
  getModuleVersion: async (moduleId) => {
    const res = await fetch(`${API_URL}/${moduleId}/version`, { 
      headers: getHeaders() 
    });
    return handleResponse(res);
  }
};