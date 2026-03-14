import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/repository/public",
});

export const searchPublicItems = (params) =>
  API.get("/search", { params });

export const getPublicItem = (uuid) =>
  API.get(`/item/${uuid}`);

export const trackView = (uuid) =>
  API.post(`/item/${uuid}/view`);

export const trackDownload = (uuid) =>
  API.post(`/item/${uuid}/download`);

export const rateItem = (uuid, rating) =>
  API.post(`/item/${uuid}/rate`, { rating });
