import axios from "axios";

/* ==============================
   AXIOS INSTANCE
============================== */
const API = axios.create({
  baseURL: "http://localhost:5000/api/manuscripts",
});

/* 🔐 AUTO ATTACH TOKEN */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ==============================
   API FUNCTIONS
============================== */
export const fetchManuscripts = () => API.get("/"); // GET all manuscripts
export const fetchManuscript = (id) => API.get(`/${id}`); // GET by id
export const createManuscript = (data) => API.post("/", data); // CREATE
export const updateManuscript = (id, data) => API.put(`/${id}`, data); // UPDATE
export const deleteManuscript = (id) => API.delete(`/${id}`); // DELETE
export const fetchScreenedManuscripts = () => {
  const token = localStorage.getItem('token');
  return axios.get(
    'http://localhost:5000/api/journal/ae/screening',
    { headers: { Authorization: `Bearer ${token}` } }
  );
};