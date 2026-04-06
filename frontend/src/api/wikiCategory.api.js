import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const getAPI = () => {
  const token = localStorage.getItem("token");
  return axios.create({
    baseURL: `${API_URL}/wiki/categories`,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

export const getCategories = async () => {
  try {
    const API = getAPI();
    const response = await API.get("/");

    return {
      success: true,
      data: Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
        ? response.data.data
        : [],
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const getCategory = async (id) => {
  try {
    const API = getAPI();
    const response = await API.get(`/${id}`);

    return {
      success: true,
      data: response.data?.data || response.data || null,
    };
  } catch (error) {
    console.error("Error fetching category:", error);
    throw error;
  }
};

export const createCategory = async (data) => {
  try {
    const API = getAPI();
    const response = await API.post("/", data);

    return {
      success: true,
      data: response.data?.data || response.data || null,
    };
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

export const updateCategory = async (id, data) => {
  try {
    const API = getAPI();
    const response = await API.put(`/${id}`, data);

    return {
      success: true,
      data: response.data?.data || response.data || null,
    };
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const API = getAPI();
    const response = await API.delete(`/${id}`);

    return {
      success: true,
      data: response.data?.data || response.data || null,
    };
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};