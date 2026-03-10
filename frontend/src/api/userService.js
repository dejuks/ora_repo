import api from './api';

export const userService = {
  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },

  // Get user permissions
  getUserPermissions: async () => {
    try {
      const response = await api.get('/users/permissions');
      return response.data;
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      throw error;
    }
  }
};