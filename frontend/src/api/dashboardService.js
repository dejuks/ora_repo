// src/services/dashboardService.js

const API_URL = "http://localhost:5000/api/dashboard";

// Get token from localStorage
const getToken = () => localStorage.getItem("token");

// Build headers with token
const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken() || ""}`,
});

// Helper function to handle fetch responses
const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({})); // safely parse JSON
  if (!res.ok) {
    // Throw error with message from backend if available
    const error = data.message || res.statusText || "API request failed";
    throw new Error(error);
  }
  return data;
};

// --- DASHBOARD API METHODS ---
export const dashboardService = {
  // Get quick statistics
  getQuickStats: async () => {
    const res = await fetch(`${API_URL}/stats`, { 
      headers: getHeaders() 
    });
    return handleResponse(res);
  },

  // Get system overview data
  getSystemOverview: async () => {
    const res = await fetch(`${API_URL}/system-overview`, { 
      headers: getHeaders() 
    });
    return handleResponse(res);
  },

  // Get module metrics
  getModuleMetrics: async () => {
    const res = await fetch(`${API_URL}/module-metrics`, { 
      headers: getHeaders() 
    });
    return handleResponse(res);
  },

  // Get recent activities
  getRecentActivities: async (limit = 10) => {
    const res = await fetch(`${API_URL}/recent-activities?limit=${limit}`, { 
      headers: getHeaders() 
    });
    return handleResponse(res);
  },

  // Get chart data for visualizations
  getChartData: async (chartType, period = 'week') => {
    const res = await fetch(`${API_URL}/charts/${chartType}?period=${period}`, { 
      headers: getHeaders() 
    });
    return handleResponse(res);
  },

  // Get user activity heatmap data
  getUserActivityHeatmap: async (days = 30) => {
    const res = await fetch(`${API_URL}/heatmap?days=${days}`, { 
      headers: getHeaders() 
    });
    return handleResponse(res);
  },

  // Export dashboard report
  exportDashboardReport: async (format = 'pdf', dateRange = {}) => {
    const queryParams = new URLSearchParams({
      format,
      ...dateRange
    }).toString();
    
    const res = await fetch(`${API_URL}/export?${queryParams}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Get notification counts
  getNotificationCounts: async () => {
    const res = await fetch(`${API_URL}/notifications/count`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Mark notifications as read
  markNotificationsRead: async (notificationIds) => {
    const res = await fetch(`${API_URL}/notifications/read`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ notificationIds })
    });
    return handleResponse(res);
  }
};