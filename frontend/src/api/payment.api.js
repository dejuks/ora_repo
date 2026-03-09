import axios from "./axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const API = axios.create({
  baseURL: `${API_BASE_URL}/payments/manuscript`,
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
  generateInvoice: async (id) => {
    try {
      // API endpoint: GET /api/payments/manuscript/:manuscriptId/generate-invoice
      // console.log(`Generating invoice for manuscript ID: ${id}`);
      console.log(`API URL: ${API_BASE_URL}/payments/manuscript/${id}/generate-invoice`);
      const response = await API.get(`/${API_BASE_URL}/payments/${id}/generate-invoice`);
      return response.data;
    } catch (error) {
      console.error("Error generating invoice:", error);
      throw error;
    }
  },
updatePaymentStatus: async (id, status) => {
    try {
      const response = await API.put(`/update/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error("Error updating payment status:", error);
      throw error;
    }
  },

};


