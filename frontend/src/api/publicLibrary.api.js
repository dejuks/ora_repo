import axios from 'axios';

const API = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/public/library`,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

function unwrap(response) {
  return response?.data ?? response;
}

export const publicLibraryApi = {
  getPublished: async (params = {}) => {
    const response = await API.get('/published', { params });
    return unwrap(response);
  },
  getPublishedById: async (id) => {
    const response = await API.get(`/published/${id}`);
    return unwrap(response);
  },
  getCategories: async () => {
    const response = await API.get('/categories');
    return unwrap(response);
  },
};

export default publicLibraryApi;
