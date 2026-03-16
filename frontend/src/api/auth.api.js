// src/api/auth.api.js
import axios from "axios";

const API = axios.create({
baseURL: process.env.REACT_APP_API_URL,
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
