import api from "./api";

export const getPublisherPackages = (params = {}) => api.get('/publisher/packages', { params });

export const createPublisherPackage = async (payload = {}, file = null) => {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') form.append(key, value);
  });
  if (file) form.append('file', file);
  const { data } = await api.post('/publisher/packages', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data;
};

export const createPublisherResource = async (payload = {}, file = null) => {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') form.append(key, value);
  });
  if (file) form.append('file', file);
  const { data } = await api.post('/publisher/resources', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data;
};
