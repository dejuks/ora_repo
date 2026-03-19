import axios from "axios";

const BASE = "http://localhost:5000/api";

/* =========================
   GET ALL VERSIONS (BY MANUSCRIPT)
========================= */
export const getManuscriptVersions = (manuscriptId) =>
  axios
    .get(`${BASE}/manuscripts/${manuscriptId}/versions`)
    .then((res) => res.data);

/* =========================
   GET SINGLE VERSION
========================= */
export const getManuscriptVersion = (id) =>
  axios
    .get(`${BASE}/manuscript-versions/${id}`)
    .then((res) => res.data);

/* =========================
   CREATE VERSION
========================= */
export const createManuscriptVersion = (manuscriptId, data) =>
  axios
    .post(`${BASE}/manuscripts/${manuscriptId}/versions`, data)
    .then((res) => res.data);

/* =========================
   UPDATE VERSION
========================= */
export const updateManuscriptVersion = (id, data) =>
  axios
    .put(`${BASE}/manuscript-versions/${id}`, data)
    .then((res) => res.data);

/* =========================
   DELETE VERSION
========================= */
export const deleteManuscriptVersion = (id) =>
  axios
    .delete(`${BASE}/manuscript-versions/${id}`)
    .then((res) => res.data);
