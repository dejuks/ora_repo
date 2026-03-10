import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/researcher", // FIXED: Added /researcher
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ==============================
   GROUP MANAGEMENT APIs
============================== */

// Get all groups (with filters)
export const getGroupsAPI = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const res = await API.get(`/groups${params ? `?${params}` : ''}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching groups:", error);
    throw error;
  }
};

// Get single group by UUID
export const getGroupAPI = async (uuid) => {
  try {
    const res = await API.get(`/groups/${uuid}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching group:", error);
    throw error;
  }
};

// Create new group
export const createGroupAPI = async (groupData) => {
  try {
    const res = await API.post("/groups", groupData);
    return res.data;
  } catch (error) {
    console.error("Error creating group:", error);
    throw error;
  }
};

// Update group
export const updateGroupAPI = async (uuid, groupData) => {
  try {
    const res = await API.put(`/groups/${uuid}`, groupData);
    return res.data;
  } catch (error) {
    console.error("Error updating group:", error);
    throw error;
  }
};

// Delete group
export const deleteGroupAPI = async (uuid) => {
  try {
    const res = await API.delete(`/groups/${uuid}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting group:", error);
    throw error;
  }
};

// Get my groups
export const getMyGroupsAPI = async () => {
  try {
    const res = await API.get(`/groups/my-groups`);
    return res.data;
  } catch (error) {
    console.error("Error fetching my groups:", error);
    throw error;
  }
};

/* ==============================
   GROUP MEMBERS APIs - FIXED
============================== */

// Get all members of a group - FIXED URL
export const getGroupMembersAPI = async (groupId) => {
  try {
    console.log(`Fetching members for group: ${groupId}`);
    // CORRECT URL: /groups/:uuid/members (baseURL already includes /researcher)
    const res = await API.get(`/groups/${groupId}/members`);
    console.log("Members API response:", res.data);
    
    // Handle different response formats
    if (res.data && res.data.data) {
      return res.data; // Format: { success: true, data: [...], count: x }
    } else if (Array.isArray(res.data)) {
      return { success: true, data: res.data, count: res.data.length };
    } else {
      return { success: true, data: [], count: 0 };
    }
  } catch (error) {
    console.error("Error fetching group members:", error.response?.data || error.message);
    throw error;
  }
};

// Get members count
export const getMembersCountAPI = async (groupId) => {
  try {
    const res = await API.get(`/groups/${groupId}/members/count`);
    return res.data;
  } catch (error) {
    console.error("Error fetching members count:", error);
    throw error;
  }
};

// Update member role
export const updateMemberRoleAPI = async (groupId, userId, role) => {
  try {
    const res = await API.put(`/groups/${groupId}/members/${userId}/role`, { role });
    return res.data;
  } catch (error) {
    console.error("Error updating member role:", error);
    throw error;
  }
};

// Remove member from group
export const removeMemberAPI = async (groupId, userId) => {
  try {
    const res = await API.delete(`/groups/${groupId}/members/${userId}`);
    return res.data;
  } catch (error) {
    console.error("Error removing member:", error);
    throw error;
  }
};

// Check membership status
export const checkMembershipStatusAPI = async (groupId) => {
  try {
    const res = await API.get(`/groups/${groupId}/membership-status`);
    return res.data;
  } catch (error) {
    console.error("Error checking membership status:", error);
    throw error;
  }
};

/* ==============================
   GROUP INVITATIONS APIs
============================== */

// Invite to group
export const inviteToGroupAPI = async (groupId, researcherIds, message = "") => {
  try {
    const res = await API.post(`/groups/${groupId}/invite`, {
      researcher_ids: researcherIds,
      message
    });
    return res.data;
  } catch (error) {
    console.error("Error inviting to group:", error);
    throw error;
  }
};

// Get group invites
export const getGroupInvitesAPI = async (groupId) => {
  try {
    const res = await API.get(`/groups/${groupId}/invites`);
    return res.data;
  } catch (error) {
    console.error("Error fetching group invites:", error);
    throw error;
  }
};

/* ==============================
   GROUP MEMBERS APIs - PUBLIC ACCESS (NO PERMISSION NEEDED)
============================== */

// Get all members of a group - PUBLIC ACCESS, NO PERMISSION REQUIRED
export const getGroupMembersPublicAPI = async (groupId) => {
  try {
    console.log(`[PUBLIC API] Fetching members for group: ${groupId}`);
    const res = await API.get(`/groups/${groupId}/members/public`);
    console.log("[PUBLIC API] Members response:", res.data);
    return res.data;
  } catch (error) {
    console.error("[PUBLIC API] Error fetching group members:", error.response?.data || error.message);
    throw error;
  }
};

// Get members count - PUBLIC ACCESS
export const getMembersCountPublicAPI = async (groupId) => {
  try {
    const res = await API.get(`/groups/${groupId}/members/count/public`);
    return res.data;
  } catch (error) {
    console.error("Error fetching members count:", error);
    throw error;
  }
};

// Update member status

// Hide member
export const hideMemberAPI = async (groupId, userId, reason) => {
  const res = await API.post(`/groups/${groupId}/members/${userId}/hide`, { reason });
  return res.data;
};

// Get member status
export const getMemberStatusAPI = async (groupId, userId) => {
  const res = await API.get(`/groups/${groupId}/members/${userId}/status`);
  return res.data;
};
/* ==============================
   GROUP BANNING APIs
============================== */

// Ban a group
export const banGroupAPI = async (groupId, banData) => {
  try {
    const res = await API.post(`/groups/${groupId}/ban`, banData);
    return res.data;
  } catch (error) {
    console.error("Error banning group:", error);
    throw error;
  }
};

// Unban a group
export const unbanGroupAPI = async (groupId) => {
  try {
    const res = await API.post(`/groups/${groupId}/unban`);
    return res.data;
  } catch (error) {
    console.error("Error unbanning group:", error);
    throw error;
  }
};

// Get all banned groups
export const getBannedGroupsAPI = async () => {
  try {
    const res = await API.get(`/groups/banned`);
    return res.data;
  } catch (error) {
    console.error("Error fetching banned groups:", error);
    throw error;
  }
};

// Get group guidelines
export const getGroupGuidelinesAPI = async (groupId) => {
  try {
    const res = await API.get(`/groups/${groupId}/guidelines`);
    return res.data;
  } catch (error) {
    console.error("Error fetching guidelines:", error);
    throw error;
  }
};

/* ==============================
   ADMIN GROUP APIs
============================== */

export const getAllGroupsAdminAPI = async () => {
  const res = await API.get("/groups/admin/all");
  return res.data;
};

// Update group status (admin)
export const updateGroupStatusAPI = async (groupUuid, status, reason) => {
  if (!groupUuid || !status || !reason) {
    throw new Error("groupUuid, status, and reason are required");
  }

  const payload = { status, reason };

  // Use the existing API instance
  const res = await API.put(`/groups/admin/${groupUuid}/status`, payload);
  return res.data;
};


export const getGroupDetailsAdminAPI = async (groupId) => {
  if (!groupId) {
    throw new Error("Group ID is missing");
  }

  const res = await API.get(
    `/groups/admin/${groupId}/details`
  );

  return res.data;
};