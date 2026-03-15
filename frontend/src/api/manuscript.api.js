import axios from "./axios";
const API_URL_public = `${process.env.REACT_APP_API_URL}/msc/online`;

const API_URL = `${process.env.REACT_APP_API_URL}/manuscripts`;

// ================= Get Public API METHODS =================
// For public routes, we need to ensure no auth headers are sent
export const fetchPublicManuscripts = async () => {
  // Create a manual request without auth headers for public routes
  const res = await fetch(API_URL_public, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch manuscripts');
  }
  
  return res.json();
};

export const fetchPublicManuscriptById = async (id) => {
  const res = await fetch(`${API_URL_public}/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch manuscript');
  }
  
  return res.json();
};

export const fetchPublicManuscript = async (id) => {
  const res = await fetch(`${API_URL_public}/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch manuscript');
  }
  
  return res.json();
};

/* =====================================================
   GET ALL MANUSCRIPTS (current user)
===================================================== */
export const fetchManuscripts = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

/* =====================================================
   GET SINGLE MANUSCRIPT BY ID
===================================================== */
export const fetchManuscript = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

/* =====================================================
   CREATE MANUSCRIPT (WITH FILES)
===================================================== */
export const createManuscript = async (formData) => {
  const res = await axios.post(API_URL, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return res.data;
};

/* =====================================================
   UPDATE MANUSCRIPT (WITH FILES)
===================================================== */
export const updateManuscript = async (id, formData) => {
  const res = await axios.put(`${API_URL}/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return res.data;
};

/* =====================================================
   DELETE MANUSCRIPT
===================================================== */
export const deleteManuscript = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};

/* =====================================================
   DRAFTS
===================================================== */
export const fetchDraftManuscripts = async () => {
  const res = await axios.get(`${API_URL}/drafts`);
  return res.data;
};

export const submitDraft = async (manuscriptId) => {
  const res = await axios.post(`${API_URL}/${manuscriptId}/submit`);
  return res.data;
};

/* =====================================================
   SUBMITTED / SCREENING
===================================================== */
export const fetchSubmitted = async () => {
  const res = await axios.get(`${API_URL}/submitted`);
  return res.data;
};

export const fetchScreening = async () => {
  const res = await axios.get(`${API_URL}/screening`);
  return res.data;
};

export const fetchInitialScreening = async () => {
  const res = await axios.get(`${API_URL}/initial-screening`);
  return res.data;
};

export const moveToScreening = async (manuscriptId, comment) => {
  const res = await axios.post(
    `${API_URL}/${manuscriptId}/screening`,
    { comment }
  );
  return res.data;
};

export const rejectManuscript = async (manuscriptId, comment, checklist) => {
  const res = await axios.post(
    `${API_URL}/${manuscriptId}/reject`,
    { comment, checklist }
  );
  return res.data;
};

export const resubmitManuscript = async (manuscriptId) => {
  const res = await axios.post(`${API_URL}/${manuscriptId}/resubmit`);
  return res.data;
};

/* =====================================================
   FILE DOWNLOAD
===================================================== */
export const downloadFile = (fileId) => {
  return `${API_URL}/files/${fileId}/download`;
};

// Under Review, AE Recommendations, EIC Decisions, etc. will be handled by separate API calls in their respective components/pages, as they involve more complex interactions and data fetching based on user roles and manuscript stages.
export const fetchUnderReviewManuscripts = async () => {
  const res = await axios.get(`${API_URL}/under-review`);
  return res.data;
};

export const fetchAERecommendations = async () => {
  const res = await axios.get(`${API_URL}/ae-recommendations`);
  return res.data;
};

export const fetchEICDecisions = async () => {
  const res = await axios.get(`${API_URL}/eic-decisions`);
  return res.data;
};

// reassign manuscript to another AE or reviewer
export const reassignManuscript = async (manuscriptId, newAssigneeId, role) => {
  const res = await axios.post(`${API_URL}/${manuscriptId}/reassign`, {
    newAssigneeId,
    role
  });
  return res.data;
};