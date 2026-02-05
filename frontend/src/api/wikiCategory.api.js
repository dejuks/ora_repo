import axios from "axios";

// Axios instance with base URL and Authorization header
const API = axios.create({
  baseURL: "http://localhost:5000/api/wiki/categories", // <-- correct endpoint for categories
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// CRUD API functions using the API instance
export const getCategories = () => API.get("/");
export const getCategory = (id) => API.get(`/${id}`);
export const createCategory = (data) => API.post("/", data);
export const updateCategory = (id, data) => API.put(`/${id}`, data);
export const deleteCategory = (id) => API.delete(`/${id}`);
