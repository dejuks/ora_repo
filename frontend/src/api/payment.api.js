import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/payments",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const paymentAPI = {
  // Get all payment orders
  getAllPayments: async () => {
    try {
      const response = await API.get("/all");
      return response.data;
    } catch (error) {
      console.error("Error fetching payments:", error);
      throw error;
    }
  },

  // Get payment by ID
  getPaymentById: async (id) => {
    try {
      const response = await API.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching payment:", error);
      throw error;
    }
  },

  // Get payment by manuscript ID
  getPaymentByManuscript: async (manuscriptId) => {
    try {
      const response = await API.get(`/manuscript/${manuscriptId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching manuscript payment:", error);
      throw error;
    }
  },

  // Create payment order
  createPayment: async (paymentData) => {
    try {
      const response = await API.post("/create", paymentData);
      return response.data;
    } catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    }
  },

  // Upload payment receipt
  uploadReceipt: async (formData) => {
    try {
      const response = await API.post("/upload-receipt", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading receipt:", error);
      throw error;
    }
  },

  // Update payment status
  updatePaymentStatus: async (id, status) => {
    try {
      const response = await API.patch(`/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error("Error updating payment status:", error);
      throw error;
    }
  },

  // Get payment statistics
  getPaymentStats: async () => {
    try {
      const response = await API.get("/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching payment stats:", error);
      throw error;
    }
  },

  // Get overdue payments
  getOverduePayments: async () => {
    try {
      const response = await API.get("/overdue");
      return response.data;
    } catch (error) {
      console.error("Error fetching overdue payments:", error);
      throw error;
    }
  },

  // Delete payment (admin only)
  deletePayment: async (id) => {
    try {
      const response = await API.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting payment:", error);
      throw error;
    }
  },
};
