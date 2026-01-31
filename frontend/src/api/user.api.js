import api from "./axios";

export const getUsers = () => api.get("/users");
export const createUser = (data) =>
  api.post("/users", data, { headers: { "Content-Type": "multipart/form-data" } });

export const updateUser = (id, data) =>
  api.put(`/users/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } });

export const deleteUser = (id) => api.delete(`/users/${id}`);
export const getAuthors = () =>
  api.get(
    "/users?role_id=1d67d32d-dcee-4302-8369-26ca00385a09"
  );