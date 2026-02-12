import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// attach token if you use auth
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const getManuscripts = () => API.get("/manuscripts");

export const getAuthors = () => {
  return API.get(`/users`);
};
export const inviteAuthor = (manuscriptId, data) =>
  API.post(`/manuscripts/${manuscriptId}/co-authors`, data);

export const getMyInvitedCoAuthors = () =>
  API.get("/manuscripts/co-authors/my-invites");

export const createManuscript = (data) =>
  API.post("/manuscripts", data);

export const updateManuscript = (id, data) =>
  API.put(`/manuscripts/${id}`, data);

export const deleteManuscript = (id) =>
  API.delete(`/manuscripts/${id}`);
export const updateManuscriptStatus = (id, status_id) =>
  API.patch(`/manuscripts/${id}/status`, { status_id });

export const getManuscriptsByUser = async (userId) => {
  return API.get(`/manuscripts/user/${userId}`);
};

export const getEICSubmissions = async () => {
  return API.get(`/manuscripts/eic/submissions`);
};

export const getManuscriptsForAssignEditors = async () => {
  const res = await API.get(`/manuscripts/eic/assign-editors`);
  return res.data;
};

export const assignEditorAPI = async (manuscriptId, editorId) => {
  const res = await API.post(`/manuscripts/eic/assign-editor`, { manuscriptId, editorId });
  return res.data;
};
export const getEditorsAPI = async () => {
  const res = await API.get("/manuscripts/eic/editors");
  return res.data; // returns array of { id, name, email }
};

export const getFinalDecisionsAPI = async () => {
  const res = await API.get("/manuscripts/eic/final-decisions");
  return res.data;
};

export const makeFinalDecisionAPI = async (manuscriptId, decision) => {
  const res = await API.post(`/manuscripts/eic/final-decision`, { manuscriptId, decision });
  return res.data;
};


export const getEICManuscriptDetailsAPI = async (id) => {
  const res = await API.get(`/manuscripts/eic/submissions/${id}`);
  return res.data;
};

export const passEICScreening = async (id) => {
  const res = await API.post(`/manuscripts/eic/screening/${id}/pass`);
  return res.data;
};

export const failEICScreening = async (id) => {
  const res = await API.post(`/manuscripts/eic/screening/${id}/fail`);
  return res.data;
};
export const updateScreeningStatus = async (id, status) => {
  const res = await API.patch(`/manuscripts/eic/manuscripts/${id}/screening`, { screening_status: status });
  return res.data;
};

export const getEthicsManuscriptsAPI = async () => {
  const res = await API.get(`/manuscripts/eic/ethics`);
  return res.data;
};

export const updateEthicsAPI = async (data) => {
  const res = await API.post(`/manuscripts/eic/ethics/update`, data);
  return res.data;
};
export const getProductionAPI = async () => {
  const res = await API.get("/manuscripts/eic/production");
  return res.data;
};

export const updateProductionAPI = async (data) => {
  const res = await API.post(
    "/manuscripts/eic/production/update",
    data
  );
  return res.data;
};

export const getDecisionsAPI = async () => {
  const res = await API.get("/manuscripts/eic/decisions");
  return res.data;
};

export const getAEAssignedManuscriptsAPI = async () => {
  const res = await API.get("/manuscripts/ae/assigned-manuscripts");
  return res.data;
};


