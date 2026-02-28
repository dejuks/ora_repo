// src/api/auth.api.js
import API from "./axios";

export const login = async ({ email, password }) => {
  const { data } = await API.post("/auth/login", {
    email,
    password,
  });

  return data; // returns { token, user }
};