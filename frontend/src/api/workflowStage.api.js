import axios from "axios";
  const API_URL = process.env.REACT_APP_API_URL;

const API = axios.create({
  baseURL: `${API_URL}/workflow-stages`,
  
});

export const getStages = () => API.get("/");
export const createStage = (data) => API.post("/", data);
export const updateStage = (id, data) => API.put(`/${id}`, data);
export const deleteStage = (id) => API.delete(`/${id}`);
