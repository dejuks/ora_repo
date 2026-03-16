import api from "./axios";

const BASE_URL = "/manuscript/categories";

// Get all categories
export const getCategories = () => api.get(BASE_URL);

// Get single category
export const getCategory = (id) => {
  if (!id) throw new Error("Category ID is required");
  return api.get(`${BASE_URL}/${id}`);
};

// Create category
export const createCategory = (data) => {
  if (!data) throw new Error("Category data is required");
  return api.post(BASE_URL, data);
};

// Update category
export const updateCategory = (id, data) => {
  if (!id) throw new Error("Category ID is required");
  if (!data) throw new Error("Update data is required");
  return api.put(`${BASE_URL}/${id}`, data);
};

// Delete category
export const deleteCategory = (id) => {
  if (!id) throw new Error("Category ID is required");
  return api.delete(`${BASE_URL}/${id}`);
};