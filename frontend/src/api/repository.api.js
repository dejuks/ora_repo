import axios from "axios";

// Create Axios instance
const API = axios.create({
  baseURL: "http://localhost:5000/api/repository-items",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// AUTHOR METHODS
export const createItem = (data) => API.post("/", data);
export const getItems = () => API.get("/");
export const getItem = (id) => API.get(`/${id}`);
export const updateItem = (id, data) => API.put(`/${id}`, data);
export const deleteItem = (id) => API.delete(`/${id}`);

// CURATOR ACTIONS
export const approveItem = (uuid) => {
  // Use PATCH to match backend
  return API.patch(`/${uuid}/approve`);
};
export const rejectItem = (uuid, reason) => API.post(`/${uuid}/reject`, { reason });
export const requestRevision = (uuid, comment) =>
  API.patch(`/${uuid}/revision`, { comment });

// QUEUE
export const getCuratorNewQueue = () => API.get("/curator/queue/new");

export const getDraftItems = async () => {
  return API.get("/author/drafts"); // Backend endpoint
};


export const deleteDraft = async (uuid) => {
  return API.delete(`/${uuid}`);
};

export const submitDraft = async (uuid) => {
  return API.patch(`/author/${uuid}/submit`);
};

export const getDepositsUnderReview = () => {
  return API.get("/author/deposits/review");
};

export const getReturnedDeposits = () => {
  return API.get("/author/deposits/returned");
};

export const getApprovedDeposits = () =>{
return  API.get("/repository/author/deposits/approved");

}

export const enhanceMetadata = (id, metadata) =>
  API.put(`/${id}/metadata`, { metadata });

export const assignVocabulary = (id, vocabulary) =>
  API.put(`/${id}/vocabulary`, { vocabulary });

export const checkCopyright = (id, status, notes) =>
  API.put(`/${id}/copyright`, { status, notes });

export const searchRepositoryItems = async ({
  query = "",
  filterLetter = "",
  page = 1,
}) => {
  const token = localStorage.getItem("token"); // or from context

  const response = await API.get(
    "http://localhost:5000/api/repository-items/search",
    {
      params: { query, filterLetter, page },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getReviewerNewQueue = () =>
  API.get("/reviewer/queue/new");

export const claimItemForReview = (id) =>
  API.patch(`/${id}/claim`);

export const bulkClaimItems = (ids) =>
  API.patch("/reviewer/queue/claim", { ids });

export const getReviewerItemDetail = (uuid) =>
  API.get(`/reviewer/${uuid}`);
export default API;
// repository.api.js
export const updateRevisionComment = (uuid, data) =>
  API.patch(`/${uuid}/revision-comment`, data);
// Update revision comment with optional file
export const updateRevisionCommentWithFile = (uuid, formData) => {
  return API.patch(`/${uuid}/edit-revision`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

