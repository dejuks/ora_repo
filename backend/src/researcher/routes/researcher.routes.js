import express from "express";
import {
  registerResearcher,
  getProfile,
  updateProfile,
  getResearchers,
  getMyGroups,
  getMyPublications,
  getMyEvents,
  createResearchGroup,
  inviteToGroup,
  getGroupInvites,
  cancelInvite,
  resendInvite,
  // Add these new imports
  getMyGroupInvitations,
  acceptGroupInvitation,
  rejectGroupInvitation
} from "../controllers/researcher.controller.js";

import connectionRoutes from "./connection.route.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  uploadUserPhotoSingle,
  handleUploadError
} from "../../middleware/researcher.upload.middleware.js";

const router = express.Router();

/* PUBLIC */
router.post(
  "/register",
  uploadUserPhotoSingle,
  handleUploadError,
  registerResearcher
);

router.get('/all', getResearchers);

/* PRIVATE - Requires Authentication */
router.get("/profile", authenticate, getProfile);
router.get("/me", authenticate, getProfile);

router.put(
  "/profile",
  authenticate,
  uploadUserPhotoSingle,
  handleUploadError,
  updateProfile
);

router.put(
  "/me",
  authenticate,
  uploadUserPhotoSingle,
  handleUploadError,
  updateProfile
);

// Groups
router.get('/my-groups', authenticate, getMyGroups);
router.post('/groups', authenticate, createResearchGroup);
router.post('/groups/invite', authenticate, inviteToGroup);
router.get('/groups/:groupId/invites', authenticate, getGroupInvites);

// Invites (as owner - managing sent invites)
router.delete('/invites/:inviteId', authenticate, cancelInvite);
router.post('/invites/:inviteId/resend', authenticate, resendInvite);

// Group Invitations (as invitee - receiving invites)
router.get('/group-invitations', authenticate, getMyGroupInvitations);
router.post('/group-invitations/:invitationId/accept', authenticate, acceptGroupInvitation);
router.post('/group-invitations/:invitationId/reject', authenticate, rejectGroupInvitation);

// Other
router.get('/my-connections', authenticate, getMyPublications);
router.get('/my-publications', authenticate, getMyPublications);
router.get('/my-events', authenticate, getMyEvents);

// Mount connection routes
router.use("/", connectionRoutes);

export default router;