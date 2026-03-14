import axios from "axios";
import axiosInstance from './axios';
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

/* 🔐 AUTO ATTACH TOKEN */
API.interceptors.request.use((config) => {
  // Try multiple possible token keys for compatibility
  const token = localStorage.getItem("researcherToken") || 
                localStorage.getItem("token") || 
                localStorage.getItem("authToken");
  
  console.log("Request URL:", config.url);
  console.log("Token found:", !!token);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for better error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Unauthorized - clearing tokens");
      localStorage.removeItem("researcherToken");
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const API_BASE = "/researcher";

/* ==============================
   AUTH & PROFILE
============================== */
export const registerResearcher = async (formData) => {
  const res = await API.post(`${API_BASE}/register`, formData);
  return res.data;
};

export const loginResearcher = async (credentials) => {
  try {
    const res = await API.post("/auth/login", credentials);
    
    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("researcherToken", res.data.token);
      
      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
    }
    
    return res.data;
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw error;
  }
};

export const getMyProfile = async () => {
  const res = await API.get(`${API_BASE}/me`);
  return res.data;
};

export const updateMyProfile = async (profileData) => {
  try {
    const response = await API.put(`${API_BASE}/profile`, profileData, {
      headers: {
        ...(profileData instanceof FormData ? {} : { 'Content-Type': 'application/json' })
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const getResearchers = async () => {
  const res = await API.get(`${API_BASE}/all`);
  return res.data;
};

export const searchResearchers = async (query) => {
  const res = await API.get(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
  return res.data;
};

/* ==============================
   GROUPS - All group related functions
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
   GROUP POSTS / FORUM
============================== */
export const getGroupPosts = async (groupId) => {
  try {
    const res = await API.get(`/researcher/groups/${groupId}/posts`);
    return res.data;
  } catch (error) {
    console.error("Error getting group posts:", error.response?.data || error.message);
    throw error;
  }
};

export const createGroupPost = async (groupId, content) => {
  try {
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

export const deleteGroupPost = async (postId) => {
  try {
    const res = await API.delete(`/researcher/posts/${postId}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting group post:", error.response?.data || error.message);
    throw error;
  }
};

export const likePost = async (postId) => {
  try {
    const res = await API.post(`/researcher/posts/${postId}/like`);
    return res.data;
  } catch (error) {
    console.error("Error liking post:", error.response?.data || error.message);
    throw error;
  }
};

export const unlikePost = async (postId) => {
  try {
    const res = await API.delete(`/researcher/posts/${postId}/like`);
    return res.data;
  } catch (error) {
    console.error("Error unliking post:", error.response?.data || error.message);
    throw error;
  }
};

export const commentOnPost = async (postId, content) => {
  try {
    const res = await API.post(`/researcher/posts/${postId}/comments`, { content });
    return res.data;
  } catch (error) {
    console.error("Error commenting on post:", error.response?.data || error.message);
    throw error;
  }
};

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
   PUBLICATIONS
============================== */
export const getMyPublications = async () => {
  const res = await API.get(`${API_BASE}/publications/`);
  return res.data;
};

export const createPublication = async (publicationData) => {
  const formData = new FormData();
  Object.entries(publicationData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  const res = await API.post(`${API_BASE}/publications/`, formData);
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
   CONNECTIONS
============================== */
export const getMyConnections = async () => {
  const res = await API.get(`${API_BASE}/connections/`);
  return res.data;
};

export const sendConnectionRequest = async (researcherId) => {
  try {
    console.log("Sending connection request to researcher:", researcherId);
    const res = await API.post(`${API_BASE}/connect/${researcherId}`);
    return res.data;
  } catch (error) {
    console.error("Error sending connection request:", error.response?.data || error.message);
    throw error;
  }
};

export const getPendingConnectionRequests = async () => {
  const res = await API.get(`${API_BASE}/connections/pending/`);
  return res.data;
};

export const getSentConnectionRequests = async () => {
  const res = await API.get(`${API_BASE}/connections/sent/`);
  return res.data;
};

export const acceptConnectionRequest = async (requestId) => {
  const res = await API.put(`${API_BASE}/connections/accept/${requestId}/`);
  return res.data;
};

export const rejectConnectionRequest = async (requestId) => {
  const res = await API.put(`${API_BASE}/connections/reject/${requestId}/`);
  return res.data;
};

export const checkConnectionStatus = async (researcherId) => {
  const res = await API.get(`${API_BASE}/connections/status/${researcherId}/`);
  return res.data;
};

export const removeConnection = async (connectionId) => {
  const res = await API.delete(`${API_BASE}/connections/${connectionId}/`);
  return res.data;
};

/* ==============================
   MESSAGING - FIXED
============================== */
export const getConversations = async () => {
  try {
    const res = await API.get(`${API_BASE}/messages/conversations`);
    return res.data;
  } catch (error) {
    console.error("Error getting conversations:", error.response?.data || error.message);
    throw error;
  }
};

export const getMessages = async (conversationId) => {
  try {
    const res = await API.get(`${API_BASE}/messages/${conversationId}`);
    return res.data;
  } catch (error) {
    console.error("Error getting messages:", error.response?.data || error.message);
    throw error;
  }
};

export const sendMessage = async (receiverId, content) => {
  try {
    console.log("Sending message to:", receiverId, "content:", content);
    const res = await API.post(`${API_BASE}/messages/`, { 
      receiver_id: receiverId, 
      content: content 
    });
    return res.data;
  } catch (error) {
    console.error("Error sending message:", error.response?.data || error.message);
    throw error;
  }
};


export const markMessagesAsRead = async (conversationId) => {
  try {
    const res = await API.put(`${API_BASE}/messages/${conversationId}/read/`);
    return res.data;
  } catch (error) {
    console.error("Error marking messages as read:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteMessage = async (messageId) => {
  try {
    const res = await API.delete(`${API_BASE}/messages/${messageId}/`);
    return res.data;
  } catch (error) {
    console.error("Error deleting message:", error.response?.data || error.message);
    throw error;
  }
};

export const getUnreadMessageCount = async () => {
  try {
    const res = await API.get(`${API_BASE}/messages/unread/count/`);
    return res.data;
  } catch (error) {
    console.error("Error getting unread count:", error.response?.data || error.message);
    throw error;
  }
};


/* ==============================
   PROJECT UPDATES
============================== */
export const getProjectUpdates = async (groupId) => {
  try {
    const res = await API.get(`${API_BASE}/updates/groups/${groupId}`);
    return res.data;
  } catch (error) {
    console.error("Error getting project updates:", error.response?.data || error.message);
    throw error;
  }
};

export const createProjectUpdate = async (groupId, updateData) => {
  try {
    const res = await API.post(
      `${API_BASE}/updates/groups/${groupId}`, 
      updateData,
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

export const updateProjectUpdate = async (updateId, updateData) => {
  try {
    const res = await API.put(`${API_BASE}/updates/${updateId}`, updateData);
    return res.data;
  } catch (error) {
    console.error("Error updating project update:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteProjectUpdate = async (updateId) => {
  try {
    const res = await API.delete(`${API_BASE}/updates/${updateId}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting project update:", error.response?.data || error.message);
    throw error;
  }
};

export const getAllProjectUpdates = async () => {
  try {
    const res = await API.get(`${API_BASE}/updates/all`);
    return res.data;
  } catch (error) {
    console.error("Error getting all project updates:", error.response?.data || error.message);
    throw error;
  }
};

/* ==============================
   LOGOUT FUNCTION
============================== */
export const logoutResearcher = () => {
  localStorage.removeItem("researcherToken");
  localStorage.removeItem("token");
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  window.location.href = '/login';
};

/// Researcher public networks

export const researcherAPI = {
  // Get featured researchers
  getFeaturedResearchers: async (limit = 3) => {
    try {
      const response = await axiosInstance.get('/researchers/featured', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching featured researchers:', error);
      throw error;
    }
  },

  // Get researchers with filters
  getResearchers: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/researchers', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching researchers:', error);
      throw error;
    }
  },

  // Get researcher by ID
  getResearcherById: async (id) => {
    try {
      const response = await axiosInstance.get(`/researchers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching researcher:', error);
      throw error;
    }
  },

  // Get researcher publications
  getResearcherPublications: async (id, params = {}) => {
    try {
      const response = await axiosInstance.get(`/researchers/${id}/publications`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching researcher publications:', error);
      throw error;
    }
  },

  // Get researcher stats
  getResearcherStats: async (id) => {
    try {
      const response = await axiosInstance.get(`/researchers/${id}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching researcher stats:', error);
      throw error;
    }
  },

  // Get recent publications
  getRecentPublications: async (limit = 5) => {
    try {
      const response = await axiosInstance.get('/publications/recent', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent publications:', error);
      throw error;
    }
  },

  // Get upcoming events
  getUpcomingEvents: async (limit = 3) => {
    try {
      const response = await axiosInstance.get('/events/upcoming', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }
  },

  // Get research fields with counts
  getResearchFields: async () => {
    try {
      const response = await axiosInstance.get('/research/fields');
      return response.data;
    } catch (error) {
      console.error('Error fetching research fields:', error);
      throw error;
    }
  },

  // Get testimonials
  getTestimonials: async (limit = 3) => {
    try {
      const response = await axiosInstance.get('/testimonials', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      throw error;
    }
  },

  // Get network stats
  getNetworkStats: async () => {
    try {
      const response = await axiosInstance.get('/network/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching network stats:', error);
      throw error;
    }
  },

  // Search researchers
  searchResearchers: async (query, params = {}) => {
    try {
      const response = await axiosInstance.get('/researchers/search', {
        params: { q: query, ...params }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching researchers:', error);
      throw error;
    }
  },

  // Connect with researcher
  connectWithResearcher: async (researcherId) => {
    try {
      const response = await axiosInstance.post(`/researchers/${researcherId}/connect`);
      return response.data;
    } catch (error) {
      console.error('Error connecting with researcher:', error);
      throw error;
    }
  },

  // Follow researcher
  followResearcher: async (researcherId) => {
    try {
      const response = await axiosInstance.post(`/researchers/${researcherId}/follow`);
      return response.data;
    } catch (error) {
      console.error('Error following researcher:', error);
      throw error;
    }
  },

  // Get recommended researchers
  getRecommendedResearchers: async (limit = 3) => {
    try {
      const response = await axiosInstance.get('/researchers/recommended', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recommended researchers:', error);
      throw error;
    }
  },

  // Subscribe to newsletter
  subscribeNewsletter: async (email) => {
    try {
      const response = await axiosInstance.post('/newsletter/subscribe', { email });
      return response.data;
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      throw error;
    }
  }
};