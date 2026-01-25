import axios from "axios";

const API = "http://localhost:5000/api/manuscript-statuses";

export const getStatuses = () => axios.get(API);
export const createStatus = (data) => axios.post(API, data);
export const updateStatus = (id, data) => axios.put(`${API}/${id}`, data);
export const deleteStatus = (id) => axios.delete(`${API}/${id}`);

