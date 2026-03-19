import axios from "axios";
const API_BASE = process.env.REACT_APP_API_URL 
const API = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

export const login = (data) => {
  return API.post("/auth/login", {
    email: data.email,
    password: data.password,
  });
};

export const registerEbookAuthor = (data) => {
  return API.post("/auth/ebook-author-register", data);
};
