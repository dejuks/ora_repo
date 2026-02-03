import axios from "./axios";

/* =========================
   AUTH (PUBLIC)
========================= */

// Register public user
export const publicRegister = (data) =>
  axios.post("/public-users/register", data);

// Login public user
export const publicLogin = (data) =>
  axios.post("/public-users/login", data);


/* =========================
   PUBLIC USER CRUD
   (Profile / Admin / Owner)
========================= */

// Get all public users (admin use)
export const getPublicUsers = () =>
  axios.get("/public-users");

// Get single public user by UUID
export const getPublicUserByUuid = (uuid) =>
  axios.get(`/public-users/${uuid}`);

// Update public user (profile update)
export const updatePublicUser = (uuid, data) =>
  axios.put(`/public-users/${uuid}`, data);

// Delete public user (admin / self-delete)
export const deletePublicUser = (uuid) =>
  axios.delete(`/public-users/${uuid}`);


export const searchPublicRepository = (params) =>
  axios.get("/api/public-repository/search", { params });