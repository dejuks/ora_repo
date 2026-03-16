import axios from "axios";

const baseApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/* 🔐 Attach Token Automatically */
baseApi.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("researcherToken") ||
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* 🚨 Global Error Handler */
baseApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.replace("/login");
    }

    return Promise.reject(error);
  }
);

export default baseApi;