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

/* ==============================
   AUTH & PROFILE
============================== */
export const registerResearcher = async (formData) => {
  const res = await API.post(`${API_BASE}/register`, formData);
  return res.data;
};

export const loginResearcher = async (credentials) => {
  const res = await API.post("/auth/login", credentials);
  return res.data;
};

export const getMyProfile = async () => {
  const res = await API.get(`${API_BASE}/me`);
  return res.data;
};

// In researcher.api.js
export const updateMyProfile = async (profileData) => {
  const formData = new FormData();

  Object.entries(profileData).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });

  const res = await API.put("/researcher/profile", formData);
  return res.data;
};

export const getMembershipStatus = async () => {
  try {
    // This will get the current user's profile which contains member_ship_status
    const response = await API.get('/researcher/me');
    return { 
      status: response.data.member_ship_status || 'none' 
    };
  } catch (error) {
    console.error('Error getting membership status:', error);
    throw error;
  }
};

// cancelMembershipRequest
export const cancelMembershipRequest= async()=>{
  
}



export const getResearchers = async () => {
  const res = await API.get(`${API_BASE}/all`);
  return res.data;
};

export const searchResearchers = async (query) => {
  const res = await API.get(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
  return res.data;
};

/* ==============================
   PUBLICATIONS
============================== */
export const getMyPublications = async () => {
  const res = await API.get(`${API_BASE}/publications`);
  return res.data;
};

export const createPublication = async (publicationData) => {
  const formData = new FormData();
  Object.entries(publicationData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  const res = await API.post(`${API_BASE}/publications`, formData);
  return res.data;
};

export const updatePublication = async (publicationId, publicationData) => {
  const formData = new FormData();
  Object.entries(publicationData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  const res = await API.put(`${API_BASE}/publications/${publicationId}`, formData);
  return res.data;
};

export const deletePublication = async (publicationId) => {
  const res = await API.delete(`${API_BASE}/publications/${publicationId}`);
  return res.data;
};

export const getAllPublications = async () => {
  const res = await API.get(`${API_BASE}/publications/all`);
  return res.data;
};

export const getPublicationsByUser = async (userId) => {
  const res = await API.get(`${API_BASE}/publications/user/${userId}`);
  return res.data;
};

export const likePublication = async (publicationId) => {
  const res = await API.post(`${API_BASE}/publications/${publicationId}/like`);
  return res.data;
};

export const unlikePublication = async (publicationId) => {
  const res = await API.delete(`${API_BASE}/publications/${publicationId}/like`);
  return res.data;
};

export const commentOnPublication = async (publicationId, content) => {
  const res = await API.post(`${API_BASE}/publications/${publicationId}/comments`, { content });
  return res.data;
};

export const getPublicationComments = async (publicationId) => {
  const res = await API.get(`${API_BASE}/publications/${publicationId}/comments`);
  return res.data;
};

/* ==============================
   MESSAGING
============================== */
export const getConversations = async () => {
  const res = await API.get(`${API_BASE}/messages/conversations`);
  return res.data;
};

export const getMessages = async (conversationId) => {
  const res = await API.get(`${API_BASE}/messages/${conversationId}`);
  return res.data;
};

export const sendMessage = async (receiverId, content) => {
  const res = await API.post(`${API_BASE}/messages`, { receiver_id: receiverId, content });
  return res.data;
};

export const markMessagesAsRead = async (conversationId) => {
  const res = await API.put(`${API_BASE}/messages/${conversationId}/read`);
  return res.data;
};

export const deleteMessage = async (messageId) => {
  const res = await API.delete(`${API_BASE}/messages/${messageId}`);
  return res.data;
};

export const getUnreadMessageCount = async () => {
  const res = await API.get(`${API_BASE}/messages/unread/count`);
  return res.data;
};


export const createGroupPost = async (groupId, content) => {
  try {
    // Send as JSON, not FormData
    const res = await API.post(`/researcher/groups/${groupId}/posts`, 
      { content },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error creating group post:", error.response?.data || error.message);
    throw error;
  }
};

// Get group posts
export const getGroupPosts = async (groupId) => {
  try {
    const res = await API.get(`/researcher/groups/${groupId}/posts`);
    return res.data;
  } catch (error) {
    console.error("Error getting group posts:", error.response?.data || error.message);
    throw error;
  }
};

// Delete group post
export const deleteGroupPost = async (postId) => {
  try {
    const res = await API.delete(`/researcher/posts/${postId}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting group post:", error.response?.data || error.message);
    throw error;
  }
};

// Like post
export const likePost = async (postId) => {
  try {
    const res = await API.post(`/researcher/posts/${postId}/like`);
    return res.data;
  } catch (error) {
    console.error("Error liking post:", error.response?.data || error.message);
    throw error;
  }
};

// Unlike post
export const unlikePost = async (postId) => {
  try {
    const res = await API.delete(`/researcher/posts/${postId}/like`);
    return res.data;
  } catch (error) {
    console.error("Error unliking post:", error.response?.data || error.message);
    throw error;
  }
};

// Comment on post
export const commentOnPost = async (postId, content) => {
  try {
    const res = await API.post(`/researcher/posts/${postId}/comments`, { content });
    return res.data;
  } catch (error) {
    console.error("Error commenting on post:", error.response?.data || error.message);
    throw error;
  }
};

// Get post comments
export const getPostComments = async (postId) => {
  try {
    const res = await API.get(`/researcher/posts/${postId}/comments`);
    return res.data;
  } catch (error) {
    console.error("Error getting post comments:", error.response?.data || error.message);
    throw error;
  }
};


/* ==============================
   GROUPS
============================== */
export const getMyGroups = async () => {
  const res = await API.get(`${API_BASE}/my-groups`);
  return res.data;
};

export const createResearchGroup = async (groupData) => {
  const res = await API.post(`${API_BASE}/groups`, groupData);
  return res.data;
};

export const inviteToGroup = async (groupId, researcherIds, message = "") => {
  const res = await API.post(`${API_BASE}/groups/invite`, {
    group_id: groupId,
    researcher_ids: researcherIds,
    message
  });
  return res.data;
};

export const getGroupInvites = async (groupId) => {
  const res = await API.get(`${API_BASE}/groups/${groupId}/invites`);
  return res.data;
};

export const cancelInvite = async (inviteId) => {
  const res = await API.delete(`${API_BASE}/invites/${inviteId}`);
  return res.data;
};

export const resendInvite = async (inviteId) => {
  const res = await API.post(`${API_BASE}/invites/${inviteId}/resend`);
  return res.data;
};

export const getMyGroupInvitations = async () => {
  const res = await API.get(`${API_BASE}/group-invitations`);
  return res.data;
};

export const acceptGroupInvite = async (invitationId) => {
  const res = await API.post(`${API_BASE}/group-invitations/${invitationId}/accept`);
  return res.data;
};

export const rejectGroupInvite = async (invitationId) => {
  const res = await API.post(`${API_BASE}/group-invitations/${invitationId}/reject`);
  return res.data;
};

export const leaveGroup = async (groupId) => {
  const res = await API.delete(`${API_BASE}/groups/${groupId}/leave`);
  return res.data;
};

export const deleteGroup = async (groupId) => {
  const res = await API.delete(`${API_BASE}/groups/${groupId}`);
  return res.data;
};

/* ==============================
   CONNECTIONS
============================== */
export const sendConnectionRequest = async (researcherId) => {
  const res = await API.post(`${API_BASE}/connect/${researcherId}`);
  return res.data;
};

export const getPendingConnectionRequests = async () => {
  const res = await API.get(`${API_BASE}/connections/pending`);
  return res.data;
};

export const getSentConnectionRequests = async () => {
  const res = await API.get(`${API_BASE}/connections/sent`);
  return res.data;
};

export const acceptConnectionRequest = async (requestId) => {
  const res = await API.put(`${API_BASE}/connections/accept/${requestId}`);
  return res.data;
};

export const rejectConnectionRequest = async (requestId) => {
  const res = await API.put(`${API_BASE}/connections/reject/${requestId}`);
  return res.data;
};

export const getMyConnections = async () => {
  const res = await API.get(`${API_BASE}/connections`);
  return res.data;
};

export const checkConnectionStatus = async (researcherId) => {
  const res = await API.get(`${API_BASE}/connections/status/${researcherId}`);
  return res.data;
};

export const removeConnection = async (connectionId) => {
  const res = await API.delete(`${API_BASE}/connections/${connectionId}`);
  return res.data;
};

export const getProjectUpdates = async (groupId) => {
  try {
    // The correct endpoint is /updates/groups/:groupId (not /groups/:groupId/updates)
    const res = await API.get(`/researcher/updates/groups/${groupId}`);
    return res.data;
  } catch (error) {
    console.error("Error getting project updates:", error.response?.data || error.message);
    throw error;
  }
};

// Create project update in a group
export const createProjectUpdate = async (groupId, updateData) => {
  try {
    // Send as JSON, not FormData
    const res = await API.post(
      `/researcher/updates/groups/${groupId}`, 
      updateData,  // Send the object directly, not FormData
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error creating project update:", error.response?.data || error.message);
    throw error;
  }
};

// Update project update
export const updateProjectUpdate = async (updateId, updateData) => {
  try {
    const res = await API.put(`/researcher/updates/${updateId}`, updateData);
    return res.data;
  } catch (error) {
    console.error("Error updating project update:", error.response?.data || error.message);
    throw error;
  }
};

// Delete project update
export const deleteProjectUpdate = async (updateId) => {
  try {
    const res = await API.delete(`/researcher/updates/${updateId}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting project update:", error.response?.data || error.message);
    throw error;
  }
};

// Get all project updates for user's groups
export const getAllProjectUpdates = async () => {
  try {
    const res = await API.get(`/researcher/updates/all`);
    return res.data;
  } catch (error) {
    console.error("Error getting all project updates:", error.response?.data || error.message);
    throw error;
  }
};