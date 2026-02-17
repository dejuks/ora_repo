import express from "express";
import {
  getAssignedReviews,
  respondInvitation,
  startReview,
  getAssignmentDetails,
  submitReview,
  getReviewerWorkspace,
} from "../../researcher/controllers/researcher.controller.js";

import { authenticate } from "../../middleware/auth.middleware.js";

const router = express.Router();

/* PUBLIC ROUTES */
// (none for reviewers currently)

/* PRIVATE ROUTES - Require Authentication */
router.get("/assigned", authenticate, getAssignedReviews);
router.post("/invitation/:id/respond", authenticate, respondInvitation);
router.post("/start-review/:id", authenticate, startReview);
router.get("/assignment/:id", authenticate, getAssignmentDetails);
router.put("/submit/:id", authenticate, submitReview);
router.get("/workspace", authenticate, getReviewerWorkspace);

export default router;
