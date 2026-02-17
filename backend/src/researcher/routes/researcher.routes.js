import express from "express";
import {
  getAssignedReviews,
  respondInvitation,
  startReview,
  getAssignmentDetails,
  submitReview,
  getReviewerWorkspace,
  getProfile,
  updateProfile,
  registerResearcher,
  getResearchers,
  getMyGroups,
  createResearchGroup,
  inviteToGroup,
  getGroupInvites,
  cancelInvite,
  resendInvite,
  getMyGroupInvitations,
  acceptGroupInvitation,
  rejectGroupInvitation,
  searchResearchers,
  leaveGroup,
  deleteGroup,
  getGroupPosts,
  createGroupPost,
  deleteGroupPost,
  likePost,
  unlikePost,
  commentOnPost,
  getPostComments,
  getMyConnections,
  getMyPublications,
  getMyEvents,
  // Publications
  createPublication,
  updatePublication,
  deletePublication,
  getAllPublications,
  getPublicationsByUser,
  likePublication,
  unlikePublication,
  commentOnPublication,
  getPublicationComments,
  // Connections
  sendConnectionRequest,
  getPendingConnectionRequests,
  getSentConnectionRequests,
  acceptConnectionRequest,
  rejectConnectionRequest,
  checkConnectionStatus,
  removeConnection,
  // Messages
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  deleteMessage,
  getUnreadMessageCount,
  // Project Updates
  getProjectUpdates,
  createProjectUpdate,
  updateProjectUpdate,
  deleteProjectUpdate,
  getAllProjectUpdates
} from "../../researcher/controllers/researcher.controller.js";

import { authenticate } from "../../middleware/auth.middleware.js";
import upload from "../../middleware/researcher.upload.middleware.js";

const router = express.Router();

/* PUBLIC ROUTES - IMPORTANT: Use upload middleware for registration */
router.post("/register", upload.single('photo'), registerResearcher);
router.get("/all", getResearchers);
router.get("/search", searchResearchers);

/* PRIVATE ROUTES - Require Authentication */
// Profile routes
router.get("/me", authenticate, getProfile);
router.put("/me", authenticate, updateProfile);
router.put("/profile", authenticate, upload.single('photo'), updateProfile);

// Groups routes
router.get("/my-groups", authenticate, getMyGroups);
router.post("/groups", authenticate, createResearchGroup);
router.post("/groups/invite", authenticate, inviteToGroup);
router.get("/groups/:groupId/invites", authenticate, getGroupInvites);
router.get("/groups/:groupId/posts", authenticate, getGroupPosts);
router.post("/groups/:groupId/posts", authenticate, createGroupPost);
router.delete("/groups/:groupId/leave", authenticate, leaveGroup);
router.delete("/groups/:groupId", authenticate, deleteGroup);

// Group invitations routes
router.get("/group-invitations", authenticate, getMyGroupInvitations);
router.post("/group-invitations/:invitationId/accept", authenticate, acceptGroupInvitation);
router.post("/group-invitations/:invitationId/reject", authenticate, rejectGroupInvitation);

// Invites management
router.delete("/invites/:inviteId", authenticate, cancelInvite);
router.post("/invites/:inviteId/resend", authenticate, resendInvite);

// Posts interactions
router.delete("/posts/:postId", authenticate, deleteGroupPost);
router.post("/posts/:postId/like", authenticate, likePost);
router.delete("/posts/:postId/like", authenticate, unlikePost);
router.post("/posts/:postId/comments", authenticate, commentOnPost);
router.get("/posts/:postId/comments", authenticate, getPostComments);

/* ==============================
   PUBLICATIONS ROUTES
============================== */
router.get("/publications", authenticate, getMyPublications);
router.get("/publications/all", authenticate, getAllPublications);
router.get("/publications/user/:userId", authenticate, getPublicationsByUser);
router.post("/publications", authenticate, upload.single('file'), createPublication);
router.put("/publications/:publicationId", authenticate, upload.single('file'), updatePublication);
router.delete("/publications/:publicationId", authenticate, deletePublication);
router.post("/publications/:publicationId/like", authenticate, likePublication);
router.delete("/publications/:publicationId/like", authenticate, unlikePublication);
router.post("/publications/:publicationId/comments", authenticate, commentOnPublication);
router.get("/publications/:publicationId/comments", authenticate, getPublicationComments);

/* ==============================
   CONNECTIONS ROUTES
============================== */
router.get("/connections", authenticate, getMyConnections);
router.get("/connections/pending", authenticate, getPendingConnectionRequests);
router.get("/connections/sent", authenticate, getSentConnectionRequests);
router.post("/connect/:researcherId", authenticate, sendConnectionRequest);
router.put("/connections/accept/:requestId", authenticate, acceptConnectionRequest);
router.put("/connections/reject/:requestId", authenticate, rejectConnectionRequest);
router.get("/connections/status/:researcherId", authenticate, checkConnectionStatus);
router.delete("/connections/:connectionId", authenticate, removeConnection);

/* ==============================
   MESSAGES ROUTES
============================== */
router.get("/messages/conversations", authenticate, getConversations);
router.get("/messages/:conversationId", authenticate, getMessages);
router.post("/messages", authenticate, sendMessage);
router.put("/messages/:conversationId/read", authenticate, markMessagesAsRead);
router.delete("/messages/:messageId", authenticate, deleteMessage);
router.get("/messages/unread/count", authenticate, getUnreadMessageCount);

/* ==============================
   PROJECT UPDATES ROUTES
============================== */
router.get("/updates/all", authenticate, getAllProjectUpdates);
router.get("/updates/groups/:groupId", authenticate, getProjectUpdates);
router.post("/updates/groups/:groupId", authenticate, createProjectUpdate);
router.put("/updates/:updateId", authenticate, updateProjectUpdate);
router.delete("/updates/:updateId", authenticate, deleteProjectUpdate);

// Review assignments
router.get("/assigned", authenticate, getAssignedReviews);
router.post("/invitation/:id/respond", authenticate, respondInvitation);
router.post("/start-review/:id", authenticate, startReview);
router.get("/assignment/:id", authenticate, getAssignmentDetails);
router.put("/submit/:id", authenticate, submitReview);
router.get("/workspace", authenticate, getReviewerWorkspace);

// Events (placeholder)
router.get("/events", authenticate, getMyEvents);

export default router;