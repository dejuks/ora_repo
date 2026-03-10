import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/eic",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get all manuscripts ready for decision
export const getCompletedReviewsAPI = async () => {
  try {
    const response = await API.get("/completed-reviews");
    return response.data;
  } catch (error) {
    console.error("Error fetching completed reviews:", error);
    throw error;
  }
};

// Get single manuscript details for decision
export const getManuscriptForDecisionAPI = async (id) => {
  try {
    const response = await API.get(`/manuscript/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching manuscript ${id}:`, error);
    throw error;
  }
};

// Make final decision on manuscript
export const makeDecisionAPI = async (id, decisionData) => {
  try {
    console.log("Sending decision data to backend:", decisionData); // Debug log
    const response = await API.post(`/manuscript/${id}/decide`, decisionData);
    console.log("Backend response:", response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error("Error making decision:", error);
    throw error;
  }
};

// Get decision history for a manuscript
export const getDecisionHistoryAPI = async (id) => {
  try {
    const response = await API.get(`/manuscript/${id}/decisions`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching decision history for ${id}:`, error);
    throw error;
  }
};

// Get decision statistics
export const getDecisionStatsAPI = async () => {
  try {
    const response = await API.get("/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching decision stats:", error);
    throw error;
  }
};

export const initiatePaymentAPI = async (manuscriptId, paymentData) => {
  try {
    console.log("Sending payment data to backend:", paymentData); // Debug log
    const response = await API.post(`/manuscripts/${manuscriptId}/initiate-payment`, paymentData);
    console.log("Payment response:", response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error("Error initiating payment:", error);
    throw error;
  }
};

