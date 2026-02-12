import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

/* 🔐 AUTO ATTACH TOKEN */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const API_BASE = "/researcher";

/* ===============================
   REGISTER (PUBLIC)
================================= */
export const registerResearcher = async (formData) => {
  const res = await API.post(`${API_BASE}/register`, formData);
  return res.data;
};

/* ===============================
   LOGIN
================================= */
export const loginResearcher = async (credentials) => {
  const res = await API.post("/auth/login", credentials);
  return res.data;
};

/* ===============================
   GET MY PROFILE
================================= */
export const getMyProfile = async () => {
  const res = await API.get(`${API_BASE}/me`);
  return res.data;
};

/* ===============================
   UPDATE MY PROFILE
================================= */
export const updateMyProfile = async (profileData) => {
  const formData = new FormData();

  Object.entries(profileData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  const res = await API.put(`${API_BASE}/me`, formData);
  return res.data;
};

// getResearchers
export const getResearchers = async () => {
  const res = await API.get(`${API_BASE}/all`);
  return res.data;
};
// getMyGroups
export const getMyGroups=async()=>{
  const res = await API.get(`${API_BASE}/my-groups`);
  return res.data;
};
// getMyConnections
export const getMyConnections=async()=>{
  const res = await API.get(`${API_BASE}/my-connections`);
  return res.data;
};
// getMyPublications
export const getMyPublications=async()=>{
  const res = await API.get(`${API_BASE}/my-publications`);
  return res.data;
};
// getMyEvents
export const getMyEvents=async()=>{
  const res = await API.get(`${API_BASE}/my-events`);
  return res.data;
};
// createResearchGroup
export const createResearchGroup=async(groupData)=>{
  const res = await API.post(`${API_BASE}/groups`, groupData);
  return res.data;
};



/* ==============================
   INVITE APIs
============================== */


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

/* ACCEPT CONNECTION REQUEST */
export const acceptConnectionRequest = async (requestId) => {
  try {
    const res = await API.put(`/researcher/connections/accept/${requestId}`);
    return res.data;
  } catch (error) {
    console.error("Accept connection error:", error.response?.data || error.message);
    throw error;
  }
};

/* REJECT CONNECTION REQUEST */
export const rejectConnectionRequest = async (requestId) => {
  try {
    const res = await API.put(`/researcher/connections/reject/${requestId}`);
    return res.data;
  } catch (error) {
    console.error("Reject connection error:", error.response?.data || error.message);
    throw error;
  }
};

export const sendConnectionRequest = async (researcherId) => {
  const res = await API.post(`/researcher/connect/${researcherId}`);
  return res.data;
};





/* GET PENDING CONNECTION REQUESTS (received) */
export const getPendingConnectionRequests = async () => {
  const res = await API.get("/researcher/connections/pending");
  return res.data;
};

/* GET SENT CONNECTION REQUESTS */
export const getSentConnectionRequests = async () => {
  const res = await API.get("/researcher/connections/sent");
  return res.data;
};

// inviteToGroup - FIXED
export const inviteToGroup = async (groupId, researcherIds, message = "") => {
  try {
    // Ensure we're sending the correct payload format
    const payload = {
      group_id: groupId,
      researcher_ids: researcherIds,
      message: message || null
    };
    
    console.log("API invite payload:", payload);
    
    const res = await API.post(`/researcher/groups/invite`, payload);
    return res.data;
  } catch (error) {
    console.error("Invite to group error:", error.response?.data || error.message);
    throw error;
  }
};


/* CHECK CONNECTION STATUS */
export const checkConnectionStatus = async (researcherId) => {
  const res = await API.get(`/researcher/connections/status/${researcherId}`);
  return res.data;
};
      


/* ==============================
   GROUP INVITATION RESPONSES
============================== */

/* GET MY GROUP INVITATIONS (Received) */
export const getMyGroupInvitations = async () => {
  try {
    const res = await API.get(`/researcher/group-invitations`);
    return res.data;
  } catch (error) {
    console.error("Get my group invitations error:", error.response?.data || error.message);
    throw error;
  }
};

/* ACCEPT GROUP INVITATION */
export const acceptGroupInvite = async (invitationId) => {
  try {
    const res = await API.post(`/researcher/group-invitations/${invitationId}/accept`);
    return res.data;
  } catch (error) {
    console.error("Accept group invitation error:", error.response?.data || error.message);
    throw error;
  }
};

/* REJECT GROUP INVITATION */
export const rejectGroupInvite = async (invitationId) => {
  try {
    const res = await API.post(`/researcher/group-invitations/${invitationId}/reject`);
    return res.data;
  } catch (error) {
    console.error("Reject group invitation error:", error.response?.data || error.message);
    throw error;
  }
};