// src/services/activityService.js

const API_URL = "http://localhost:5000/api/activities";

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

// --- ACTIVITY API METHODS ---
export const activityService = {
  // Get recent activities
  getRecentActivities: async (limit = 10) => {
    const res = await fetch(`${API_URL}/recent?limit=${limit}`, { 
      headers: getHeaders() 
    });
    return handleResponse(res);
  },

  // Get activities by user
  getActivitiesByUser: async (userId, limit = 20) => {
    const res = await fetch(`${API_URL}/user/${userId}?limit=${limit}`, { 
      headers: getHeaders() 
    });
    return handleResponse(res);
  },

  // Get activities by module
  getActivitiesByModule: async (moduleName, limit = 20) => {
    const res = await fetch(`${API_URL}/module/${moduleName}?limit=${limit}`, { 
      headers: getHeaders() 
    });
    return handleResponse(res);
  },

  // Get activities by date range
  getActivitiesByDateRange: async (startDate, endDate) => {
    const res = await fetch(
      `${API_URL}/range?start=${startDate}&end=${endDate}`, { 
        headers: getHeaders() 
      }
    );
    return handleResponse(res);
  },

  // Log new activity
  logActivity: async (activityData) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(activityData),
    });
    return handleResponse(res);
  },

  // Get activity summary
  getActivitySummary: async (period = 'day') => {
    const res = await fetch(`${API_URL}/summary?period=${period}`, { 
      headers: getHeaders() 
    });
    return handleResponse(res);
  },

  // Get activity trends
  getActivityTrends: async (days = 7) => {
    const res = await fetch(`${API_URL}/trends?days=${days}`, { 
      headers: getHeaders() 
    });
    return handleResponse(res);
  },

  // Search activities
  searchActivities: async (query, filters = {}) => {
    const queryParams = new URLSearchParams({
      q: query,
      ...filters
    }).toString();
    
    const res = await fetch(`${API_URL}/search?${queryParams}`, { 
      headers: getHeaders() 
    });
    return handleResponse(res);
  },

  // Export activities
  exportActivities: async (format = 'csv', dateRange = {}) => {
    const queryParams = new URLSearchParams({
      format,
      ...dateRange
    }).toString();
    
    const res = await fetch(`${API_URL}/export?${queryParams}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Delete old activities (admin only)
  deleteOldActivities: async (daysOld = 30) => {
    const res = await fetch(`${API_URL}/cleanup?days=${daysOld}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Get activity statistics
  getActivityStats: async () => {
    const res = await fetch(`${API_URL}/stats`, { 
      headers: getHeaders() 
    });
    return handleResponse(res);
  }
};