import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/workflow-stages",
  
});

export const getStages = () => API.get("/");
export const createStage = (data) => API.post("/", data);
export const updateStage = (id, data) => API.put(`/${id}`, data);
export const deleteStage = (id) => API.delete(`/${id}`);
