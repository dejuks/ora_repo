import axios from "axios";

/* ==============================
   AXIOS INSTANCE
============================== */
const API = axios.create({
  baseURL: "http://localhost:5000/api/manuscripts/reviewer", // Fixed: removed /manuscripts/
});

/* 🔐 AUTO ATTACH TOKEN */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ==============================
   REVIEWER ASSIGNMENTS
============================== */

// Get all assigned reviews
export const getReviewerAssignedAPI = async () => {
  try {
    const res = await API.get("/assignments");
    return res.data;
  } catch (error) {
    console.error("Error fetching assignments:", error);
    throw error;
  }
};

// Get reviewer workspace
export const getReviewerWorkspaceAPI = async () => {
  try {
    const res = await API.get("/workspace");
    return res.data;
  } catch (error) {
    console.error("Error fetching workspace:", error);
    throw error;
  }
};

// Get assignment details by ID
export const getAssignmentDetailsAPI = async (id) => {
  try {
    const res = await API.get(`/assignments/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching assignment ${id}:`, error);
    throw error;
  }
};

/* ==============================
   INVITATIONS
============================== */

// Respond to invitation (accept or decline)
export const respondInvitationAPI = async (id, status) => {
  try {
    const res = await API.put(`/assignments/${id}/respond`, { status });
    return res.data;
  } catch (error) {
    console.error(`Error responding to invitation ${id}:`, error);
    throw error;
  }
};

/* ==============================
   REVIEW MANAGEMENT
============================== */

// Start review for an assignment
export const startReviewAPI = async (id) => {
  try {
    const res = await API.put(`/assignments/${id}/start`);
    return res.data;
  } catch (error) {
    console.error(`Error starting review ${id}:`, error);
    throw error;
  }
};

// Submit review for an assignment
export const submitReviewAPI = async (id, reviewData) => {
  try {
    // Handle both FormData and JSON
    let data = reviewData;
    let config = {};
    
    if (reviewData instanceof FormData) {
      config.headers = { 'Content-Type': 'multipart/form-data' };
    }
    
    const res = await API.post(`/assignments/${id}/submit`, data, config);
    return res.data;
  } catch (error) {
    console.error(`Error submitting review ${id}:`, error);
    throw error;
  }
};

/* ==============================
   DRAFT MANAGEMENT
============================== */

// Save review as draft
export const saveReviewDraftAPI = async (id, draftData) => {
  return API.post(`/assignments/${id}/draft`, draftData);
};


// Get review draft
export const getReviewDraftAPI = async (id) => {
  try {
    const res = await API.get(`/assignments/${id}/draft`);
    return res.data;
  } catch (error) {
    // Return null for 404 (no draft found)
    if (error.response?.status === 404) {
      return null;
    }
    console.error("Error fetching draft:", error);
    throw error;
  }
};

/* ==============================
   FILE MANAGEMENT
============================== */

// Download manuscript file
export const downloadManuscriptFileAPI = async (manuscriptId, fileName) => {
  try {
    const res = await API.get(`/manuscript/${manuscriptId}/download`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName || 'manuscript.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
};

/* ==============================
   DEADLINE MANAGEMENT
============================== */

// Extend review deadline (request from reviewer)
export const requestDeadlineExtensionAPI = async (id, requestedDays, reason) => {
  try {
    const res = await API.post(`/assignments/${id}/extend-deadline`, {
      requestedDays,
      reason
    });
    return res.data;
  } catch (error) {
    console.error("Error requesting deadline extension:", error);
    throw error;
  }
};

/* ==============================
   HELPER FUNCTIONS
============================== */

// Get pending invitations only
export const getPendingInvitationsAPI = async () => {
  try {
    const assignments = await getReviewerAssignedAPI();
    return assignments.filter(a => a.review_status === 'pending');
  } catch (error) {
    console.error("Error fetching pending invitations:", error);
    throw error;
  }
};

// Get active reviews (accepted or in_review)
export const getActiveReviewsAPI = async () => {
  try {
    const assignments = await getReviewerAssignedAPI();
    return assignments.filter(a => 
      ['accepted', 'under_review'].includes(a.review_status)
    );
  } catch (error) {
    console.error("Error fetching active reviews:", error);
    throw error;
  }
};

// Get completed reviews
export const getCompletedReviewsAPI = async () => {
  try {
    const assignments = await getReviewerAssignedAPI();
    return assignments.filter(a => 
      ['completed', 'submitted'].includes(a.review_status)
    );
  } catch (error) {
    console.error("Error fetching completed reviews:", error);
    throw error;
  }
};

// Get review statistics
export const getReviewerStatsAPI = async () => {
  try {
    const assignments = await getReviewerAssignedAPI();
    
    const stats = {
      total: assignments.length,
      pending: assignments.filter(a => a.review_status === 'pending').length,
      accepted: assignments.filter(a => a.review_status === 'accepted').length,
      inReview: assignments.filter(a => 
        ['in_review', 'under_review'].includes(a.review_status)
      ).length,
      completed: assignments.filter(a => 
        ['completed', 'submitted'].includes(a.review_status)
      ).length,
      declined: assignments.filter(a => a.review_status === 'declined').length,
      overdue: assignments.filter(a => 
        a.due_date && 
        new Date(a.due_date) < new Date() && 
        !['completed', 'submitted', 'declined'].includes(a.review_status)
      ).length
    };
    
    return stats;
  } catch (error) {
    console.error("Error fetching stats:", error);
    throw error;
  }
};