import api from "./axios.js";

export const getModules = () => api.get("/modules");
export const getModuleById = (uuid) => api.get(`/modules/${uuid}`);
export const createModule = (data) => api.post("/modules", data);
export const updateModule = (uuid, data) => api.put(`/modules/${uuid}`, data);
export const deleteModule = (uuid) => api.delete(`/modules/${uuid}`);
