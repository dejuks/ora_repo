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

  export const getUserRoles = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/roles`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user roles:", error);
    throw error;
  }
};

// Get all available roles
export const getAllRoles = async () => {
  try {
    const response = await api.get('/roles');
    return response.data;
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw error;
  }
};