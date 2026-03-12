import api from "./axios";

export const getUsers = () => api.get("/users");

// use FormData only if photo upload exists
export const createUser = (data) => {
  const isFormData = data instanceof FormData;
  return api.post("/users", data, isFormData ? {
    headers: { "Content-Type": "multipart/form-data" }
  } : {});
};

export const updateUser = (id, data) => {
  const isFormData = data instanceof FormData;
  return api.put(`/users/${id}`, data, isFormData ? {
    headers: { "Content-Type": "multipart/form-data" }
  } : {});
};

export const deleteUser = (id) => api.delete(`/users/${id}`);

export const getAuthors = () =>
  api.get("/users?role_id=1d67d32d-dcee-4302-8369-26ca00385a09");

export const getUserRoles = async (userId) => {
  const response = await api.get(`/users/${userId}/roles`);
  return response.data;
};

export const getAllRoles = async () => {
  const response = await api.get("/roles");
  return response.data;
};