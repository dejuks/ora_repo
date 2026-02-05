
import axios from "axios";

// Create Axios instance
const API = axios.create({
  baseURL: "http://localhost:5000/api/wiki/articles",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});
export const getArticles = () => API.get("/");
export const getArticle = (id) => API.get(`/${id}`);
export const createArticle = (data) => API.post("/", data);
export const updateArticle = (id, data) => API.put(`/${id}`, data);
export const deleteArticle = (id) => API.delete(`/${id}`);