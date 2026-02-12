import axios from "axios";

/* ==============================
   AXIOS INSTANCE
============================== */
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

/* ==============================
   🔐 AUTO ATTACH JWT TOKEN
============================== */
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ==============================
   GROUP APIs
============================== */

/* GET ALL GROUPS */
export const getGroupsAPI = async () => {
  const res = await API.get("/researcher/groups");
  return res.data;
};

/* GET SINGLE GROUP */
export const getGroupAPI = async (uuid) => {
  const res = await API.get(`/researcher/groups/${uuid}`);
  return res.data;
};

/* CREATE GROUP */
export const createGroupAPI = async (data) => {
  const res = await API.post("/researcher/groups", data);
  return res.data;
};

/* UPDATE GROUP */
export const updateGroupAPI = async (uuid, data) => {
  const res = await API.put(`/researcher/groups/${uuid}`, data);
  return res.data;
};

/* DELETE GROUP */
export const deleteGroupAPI = async (uuid) => {
  const res = await API.delete(`/researcher/groups/${uuid}`);
  return res.data;
};


/* ==============================
   INVITE APIs
============================== */

/* INVITE TO GROUP */
export const inviteToGroup = async (groupId, researcherIds, message = "") => {
  const res = await API.post(`/researcher/groups/${groupId}/invite`, {
    researcher_ids: researcherIds,
    message
  });
  return res.data;
};

/* GET GROUP INVITES */
export const getGroupInvites = async (groupId) => {
  const res = await API.get(`/researcher/groups/${groupId}/invites`);
  return res.data;
};

/* CANCEL INVITE */
export const cancelInvite = async (inviteId) => {
  const res = await API.delete(`/researcher/invites/${inviteId}`);
  return res.data;
};

/* RESEND INVITE */
export const resendInvite = async (inviteId) => {
  const res = await API.post(`/researcher/invites/${inviteId}/resend`);
  return res.data;
};

/* CONNECT WITH RESEARCHER */
export const connectWithResearcher = async (researcherId) => {
  const res = await API.post(`/researcher/connect/${researcherId}`);
  return res.data;
};