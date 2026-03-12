import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const publicationAPI = {
  // Get all published manuscripts
  getPublishedManuscripts: async (page = 1, limit = 6, search = "") => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...(search && { search })
      });
      
      const response = await axios.get(`${API_URL}/publications/manuscripts?${params}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching published manuscripts:", error);
      throw error;
    }
  },

  // Get single manuscript by ID
  getManuscriptById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/publications/manuscripts/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching manuscript:", error);
      throw error;
    }
  },

  // Get recent manuscripts
  getRecentManuscripts: async (limit = 5) => {
    try {
      const response = await axios.get(`${API_URL}/publications/manuscripts/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching recent manuscripts:", error);
      throw error;
    }
  },

  // Get journal statistics
  getJournalStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/publications/stats`);
      return response.data;
    } catch (error) {
      console.error("Error fetching journal stats:", error);
      throw error;
    }
  }
};